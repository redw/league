/**
 * 战斗过程生成器
 *
 * @author hh
 */
var FightProcessGenerator = (function () {
    function FightProcessGenerator() {
        this.leftTeam = Array(9);
        this.rightTeam = Array(9);
        this.allTeam = [this.leftTeam, this.rightTeam];
        this.index = 0;
        this.turn = 0;
    }
    var d = __define,c=FightProcessGenerator,p=c.prototype;
    /**
     * 通过配置 添加战斗角色数据
     * @param data
     */
    p.addConfigDataArr = function (data) {
        this.reset();
        var len = data.length;
        for (var i = 0; i < len; i++) {
            var role = new FightRoleData();
            // if (fight.isHero(data[i].id)) {
            //     role.pos = data[i].pos;
            //     role.side = data[i].side;
            //     role.copy(UserProxy.inst.heroData.getHeroData(data[i].id));
            // } else {
            //     role.parse(data[i], data[i].id);
            // }
            // 暂时不开放基础属性对战斗的影响
            role.parse(data[i], data[i].id);
            this.addSceneData(role);
        }
    };
    /**
     * 添加战斗角色数据
     * @param left  左边角色数据
     * @param right 右边角色数据
     */
    p.addSceneDataArr = function (left, right) {
        this.reset();
        for (var i = 0; i < left.length; i++) {
            this.addSceneData(left[i]);
        }
        for (var i = 0; i < right.length; i++) {
            this.addSceneData(right[i]);
        }
    };
    /**
     * 添加单个角色数据
     * @param role
     */
    p.addSceneData = function (role) {
        var side = role.side - 1;
        var pos = role.pos;
        this.allTeam[side][pos] = role;
        this.roles.push(role);
    };
    /**
     * 生成战斗报告
     * @returns {FightReportItem[]}
     */
    p.generateData = function () {
        var result = [];
        this.index = 0;
        this.turn = 0;
        this.addBeginBuff(this.roles);
        while (!this.checkEnd() && this.index <= 300) {
            if (this.index >= 300) {
                fight.recordLog("战斗步数超过了300,数所有问题了", fight.LOG_FIGHT_ERROR);
                break;
            }
            this.generateOrder();
            while (this.orders.length > 0 && !this.checkEnd()) {
                this.generateItem(result);
            }
        }
        return result;
    };
    /**
     * 重新生成战报
     * @returns {FightReportItem[]}
     */
    p.updateGenerateData = function () {
        var result = [];
        while (!this.checkEnd() && this.index <= 300) {
            if (this.index >= 300) {
                fight.recordLog("战斗步数超过了300,数所有问题了", fight.LOG_FIGHT_ERROR);
                break;
            }
            this.generateOrder();
            while (this.orders.length > 0 && !this.checkEnd()) {
                this.generateItem(result);
            }
        }
        return result;
    };
    p.generateOrder = function () {
        if (!this.orders || this.orders.length == 0) {
            this.orders = this.roles.concat();
            this.orders.sort(function (a, b) {
                return b.order - a.order;
            });
            this.turnBegin();
            this.turn++;
        }
    };
    p.addBeginBuff = function (roles) {
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            var beginSkillArr = role.config.begin_skill;
            for (var j = 0; j < beginSkillArr.length; j++) {
                var skillId = beginSkillArr[j];
                if (!!skillId) {
                    if (role.isSkillActive(skillId)) {
                        var skillConfig = Config.SkillData[skillId];
                        var buffId = skillConfig.buff_id;
                        role.addBuff(buffId);
                    }
                }
            }
        }
    };
    p.generateItem = function (result) {
        var role = this.orders.shift();
        var skillId = role.getSkillId();
        var skillInfo = Config.SkillData[skillId];
        var getTargetFunName = FightProcessGenerator.SkillTargetFunMap[skillInfo.target_cond];
        var skillRepeat = skillInfo.repeat;
        for (var i = 0; i < skillRepeat; i++) {
            var targets = this[getTargetFunName](role);
            if (i == 0 && targets.length <= 0) {
                fight.recordLog("方法" + getTargetFunName + "错误", 100);
            }
            if (targets.length > 0) {
                var item = this.damageCore(role, targets, skillInfo, this.index++, this.turn - 1);
                result.push(item);
            }
        }
    };
    /**
     * 计算伤害
     * @param startRole
     * @param targets
     * @param skillInfo
     * @param index
     * @param round
     * @returns {FightReportItem}
     */
    p.damageCore = function (startRole, targets, skillInfo, index, round) {
        var len = targets.length;
        var isAddHP = skillInfo.target_group == "friend";
        var isPhyAtk = skillInfo.damage_type == "physical";
        var isMagicAtk = skillInfo.damage_type == "magical";
        var cri = startRole.isCri();
        var criDamage = cri ? (startRole.critDamage) : 1;
        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(startRole) + "发动攻击", 0);
        var result = {
            skillId: skillInfo.id,
            target: [],
            cri: cri,
            round: round,
            index: index
        };
        // 如果被眩晕
        if (startRole.canAction) {
            // 回血
            startRole.backBlood();
            for (var i = 0; i < len; i++) {
                var target = targets[i];
                var item = {};
                var atk = void 0, def = void 0;
                item.damage = "0";
                result.target.push(item);
                target.physicalDef = BigNum.mul(target.physicalDef, 1 + target.getBuffPlusValue(BuffTypeEnum.DEF_MORE_MORE));
                target.magicDef = BigNum.mul(target.magicDef, 1 + target.getBuffPlusValue(BuffTypeEnum.DEF_MORE_MORE));
                if (isPhyAtk) {
                    atk = startRole.physicalAtk;
                    def = target.physicalDef;
                }
                else {
                    atk = startRole.magicAtk;
                    def = target.magicDef;
                }
                // 如果对象加血
                if (isAddHP) {
                    var addHP = BigNum.mul(atk, Math.abs(skillInfo.damage) * criDamage);
                    target.curHP = BigNum.add(target.curHP, addHP);
                    target.curHP = BigNum.min(target.curHP, target.maxHP);
                    item.hp = target.curHP;
                    item.addHP = addHP;
                    fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "加血" + addHP, 0);
                    if (!!skillInfo.buff_id) {
                        target.addBuff(skillInfo.buff_id, startRole);
                    }
                }
                else {
                    item.dodge = target.isDodge();
                    item.block = target.isBlock();
                    if (item.dodge) {
                        // 如果被闪避了
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时闪避了", 0);
                    }
                    else {
                        var ratio = 1;
                        if (target.isInvincible) {
                            ratio = 0;
                            item.invincible = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时无敌", 0);
                        }
                        else if (isPhyAtk && target.freePhysicalAtk) {
                            ratio = 0;
                            item.isFreePhysicalAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时物免", 0);
                        }
                        else if (isMagicAtk && target.freeMagicAtk) {
                            ratio = 0;
                            item.isFreeMagicAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时魔免", 0);
                        }
                        // 计算伤害
                        var outHurtRatio = startRole.outHurtRatio;
                        var targetHurtRatio = target.hurtRatio;
                        var backHurtRatio = target.backHurtRatio;
                        var backOutHurtRatio = startRole.backOutHurtRatio;
                        item.hurtRatio = targetHurtRatio;
                        item.backHurtRatio = backHurtRatio;
                        result.backOutHurtRatio = backOutHurtRatio;
                        result.outHurtRatio = outHurtRatio;
                        var damage = skillInfo.damage;
                        var outHurt = BigNum.max(0, BigNum.mul(BigNum.sub(atk, def), outHurtRatio * criDamage * damage));
                        var hurt = BigNum.mul(outHurt, targetHurtRatio * (item.block ? 0.5 : 1) * ratio);
                        target.curHP = BigNum.sub(target.curHP, hurt);
                        item.damage = hurt;
                        item.hp = target.curHP;
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时失血" + hurt + "当前血量" + target.curHP + "最大血量" + target.maxHP, 0);
                        var outHurtBack = BigNum.mul(backOutHurtRatio, hurt);
                        var backHurt = BigNum.mul(backHurtRatio, hurt);
                        startRole.curHP = BigNum.sub(BigNum.add(startRole.curHP, outHurtBack), backHurt);
                        startRole.curHP = BigNum.min(startRole.curHP, startRole.maxHP);
                        result.damage = BigNum.add(backHurt, outHurtBack);
                        result.hp = startRole.curHP;
                        if (BigNum.greaterOrEqual(0, target.curHP)) {
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击死亡", 1);
                            this.removeRole(target);
                        }
                        else {
                            if (!!skillInfo.buff_id) {
                                target.addBuff(skillInfo.buff_id, startRole);
                            }
                        }
                        if (BigNum.greaterOrEqual(0, startRole.curHP)) {
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "反弹死亡", 1);
                            this.removeRole(startRole);
                        }
                    }
                }
                target.addDesInfo(item);
            }
        }
        else {
            result.vertigo = true;
        }
        // 扣血
        if (BigNum.greater(startRole.curHP, 0)) {
            startRole.loseBlood();
            if (BigNum.lessOrEqual(startRole.curHP, 0)) {
                console.log("第" + index + "攻击者中毒死亡" + fight.getRolePosDes(startRole));
                this.removeRole(startRole);
            }
        }
        startRole.addDesInfo(result);
        return result;
    };
    p.turnBegin = function () {
        for (var i = 0; i < this.orders.length; i++) {
            this.orders[i].turnBegin();
        }
    };
    // 角色战败后，移除角色
    p.removeRole = function (role) {
        var side = role.side - 1;
        var pos = role.pos;
        for (var i = 0; i < this.roles.length; i++) {
            if (this.roles[i] == role) {
                this.roles.splice(i, 1);
                break;
            }
        }
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i] == role) {
                this.orders.splice(i, 1);
                break;
            }
        }
        if (this.allTeam[side][pos] == null) {
            fight.recordLog("角色不应该为空,移除角色或发生错误", 1);
        }
        this.allTeam[side][pos] = null;
    };
    // 检查是否结束
    p.checkEnd = function () {
        var len = this.roles.length;
        var isEnd = true;
        var side = 0;
        for (var i = 0; i < len; i++) {
            if (i == 0) {
                side = this.roles[0].side;
            }
            else {
                if (side != this.roles[i].side) {
                    isEnd = false;
                    break;
                }
            }
        }
        return isEnd;
    };
    // 得到正序单目标
    p.getTarget = function (obj) {
        var result = [];
        var row = obj.pos % 3;
        var indexArr = [];
        var rows = fight.getCommonOrders(row);
        for (var i = 0; i < rows.length; i++) {
            indexArr.push(rows[i], rows[i] + 3, rows[i] + 6);
        }
        var len = indexArr.length;
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < len; i++) {
            var index = indexArr[i];
            if (team[index])
                result.push(team[index]);
            if (result.length > 0) {
                break;
            }
        }
        return result;
    };
    // 得到倒序单目标
    p.getReverseTarget = function (obj) {
        var result = [];
        var row = obj.pos % 3;
        var indexArr = [];
        var rows = fight.getCommonOrders(row);
        for (var i = 0; i < rows.length; i++) {
            indexArr.push(rows[i] + 6, rows[i] + 3, rows[i]);
        }
        var len = indexArr.length;
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < len; i++) {
            var index = indexArr[i];
            if (team[index])
                result.push(team[index]);
            if (result.length > 0) {
                break;
            }
        }
        return result;
    };
    // 得到正序一列
    p.getColumnTargets = function (obj) {
        var result = [];
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var index = i * 3 + j;
                if (team[index]) {
                    result.push(team[index]);
                }
            }
            if (result.length > 0) {
                break;
            }
        }
        return result;
    };
    // 得到倒序一列
    p.getColumnReverseTargets = function (obj) {
        var result = [];
        var team = this.allTeam[2 - obj.side];
        for (var i = 2; i >= 0; i--) {
            for (var j = 0; j < 3; j++) {
                var index = i * 3 + j;
                if (team[index]) {
                    result.push(team[index]);
                }
            }
            if (result.length > 0) {
                break;
            }
        }
        return result;
    };
    // 得到一排目标
    p.getRowTargets = function (obj) {
        var result = [];
        var rows = fight.getCommonOrders(obj.pos % 3);
        var indexArr = [];
        for (var i = 0; i < rows.length; i++) {
            indexArr.push([rows[i], rows[i] + 3, rows[i] + 6]);
        }
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var index = indexArr[i][j];
                if (team[index]) {
                    result.push(team[index]);
                }
            }
            if (result.length > 0) {
                break;
            }
        }
        return result;
    };
    // 得到本方所有目标
    p.getMySideTargets = function (obj) {
        var result = [];
        var team = this.allTeam[obj.side - 1];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                result.push(team[i]);
            }
        }
        return result;
    };
    // 得到对方所有目标
    p.getOtherSideTargets = function (obj) {
        var result = [];
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                result.push(team[i]);
            }
        }
        return result;
    };
    // 得到血量最多的目标
    p.getMostHPTarget = function (obj) {
        var result = null;
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                }
                else {
                    if (BigNum.greater(team[i].curHP, result.curHP)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    };
    // 得到血量最少的目标
    p.getLeaseHPTarget = function (obj) {
        var result = null;
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                }
                else {
                    if (BigNum.less(team[i].curHP, result.curHP)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    };
    // 得到友方血最最少的目标
    p.getSelfSideLeaseHPTarget = function (obj) {
        var result = null;
        var team = this.allTeam[obj.side - 1];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = team[i];
                }
                else {
                    if (BigNum.less(team[i].curHP, result.curHP)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    };
    // 得到最高物攻的目标
    p.getMostPhyAtkTarget = function (obj) {
        var result = null;
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                }
                else {
                    if (BigNum.greater(team[i].physicalAtk, result.physicalAtk)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    };
    // 得到最高法攻的目标
    p.getLeaseMagicAtkTarget = function (obj) {
        var result = null;
        var team = this.allTeam[2 - obj.side];
        for (var i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                }
                else {
                    if (BigNum.greater(team[i].magicAtk, result.magicAtk)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    };
    // 得到自己目标
    p.getSelfTarget = function (obj) {
        var result = this.allTeam[obj.side - 1][obj.pos];
        return [result];
    };
    // 重置
    p.reset = function () {
        this.leftTeam = Array(9);
        this.rightTeam = Array(9);
        this.orders = [];
        this.roles = [];
    };
    FightProcessGenerator.SkillTargetFunMap = {
        "one1": "getTarget",
        "one2": "getReverseTarget",
        "row": "getRowTargets",
        "line1": "getColumnTargets",
        "line2": "getColumnReverseTargets",
        "all_enemy": "getOtherSideTargets",
        "all_friend": "getMySideTargets",
        "hp_least": "getLeaseHPTarget",
        "hp_most": "getMostHPTarget",
        "physical_atk_most": "getMostPhyAtkTarget",
        "magical_atk_most": "getLeaseMagicAtkTarget",
        "friend_hp_least": "getSelfSideLeaseHPTarget",
        "self": "getSelfTarget"
    };
    return FightProcessGenerator;
}());
egret.registerClass(FightProcessGenerator,'FightProcessGenerator');
