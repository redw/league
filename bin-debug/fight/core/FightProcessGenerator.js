/**
 * 战斗过程生成器
 * @author hh
 */
var FightProcessGenerator = (function () {
    function FightProcessGenerator() {
        this.leftTeam = Array(fight.ROLE_UP_LIMIT);
        this.rightTeam = Array(fight.ROLE_UP_LIMIT);
        this.allTeam = [this.leftTeam, this.rightTeam];
        this.index = 0;
        this.turn = 0;
        this.result = 0;
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
            var role = new FightRoleVO(data[i]);
            if (fight.isHero(role.id)) {
                var roleVO = new HeroVO({ id: data[i].id });
                role.copyProp(roleVO);
            }
            else {
                var roleVO = new MonsterVO({ id: data[i].id });
                role.copyProp(roleVO);
            }
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
    p.addSceneDataVec = function (roleVec) {
        this.reset();
        for (var i = 0; i < roleVec.length; i++) {
            this.addSceneData(roleVec[i]);
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
     * @param bunch 串
     * @returns {FightReportItem[]}
     */
    p.generateData = function (bunch) {
        if (bunch === void 0) { bunch = "a"; }
        for (var i = 0; i < this.roles.length; i++) {
            this.roles[i].triggerChanceType = bunch;
        }
        var result = [];
        this.index = 0;
        this.turn = 0;
        this.addBeginBuff(this.roles);
        while (!this.checkEnd() && this.turn <= fight.ROUND_LIMIT) {
            if (this.turn >= fight.ROUND_LIMIT) {
                this.result = 0;
                fight.recordLog("战斗步数超过了上限,数所有问题了", fight.LOG_FIGHT_WARN);
                break;
            }
            if (this.orders.length == 0 && !this.checkEnd()) {
                this.turnBegin();
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
    p.updateGenerateData = function (heroArr) {
        var result = [];
        for (var i = 0; i < this.roles.length; i++) {
            for (var j = 0; j < heroArr.length; j++) {
                if (this.roles[i].id == heroArr[j].id) {
                    this.roles[i].copyProp(heroArr[j]);
                }
            }
        }
        while (!this.checkEnd() && this.turn <= fight.ROUND_LIMIT) {
            if (this.index >= fight.ROUND_LIMIT) {
                fight.recordLog("战斗步数超过了上限,数所有问题了", fight.LOG_FIGHT_WARN);
                break;
            }
            if (this.orders.length == 0 && !this.checkEnd()) {
                this.turnBegin();
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
        }
    };
    p.addBeginBuff = function (roles) {
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            var beginSkillArr = role.config.begin_skill;
            var len_1 = beginSkillArr ? beginSkillArr.length : 0;
            for (var j = 0; j < len_1; j++) {
                var skillId = beginSkillArr[j];
                if (skillId) {
                    if (role.isSkillActive(skillId)) {
                        var skillConfig = Config.SkillData[skillId];
                        var buffId = skillConfig.buff_id;
                        role.addBuff(buffId);
                    }
                }
            }
        }
        this.leftTotalLife = "0";
        var arr = this.allTeam[FightSideEnum.LEFT_SIDE - 1];
        var len = arr ? arr.length : 0;
        for (var i = 0; i < len; i++) {
            var roleData = arr[i];
            if (roleData) {
                this.leftTotalLife = BigNum.add(this.leftTotalLife, roleData.maxHP);
            }
        }
        this.rightTotalLife = "0";
        arr = this.allTeam[FightSideEnum.RIGHT_SIDE - 1];
        len = arr ? arr.length : 0;
        for (var i = 0; i < len; i++) {
            var roleData = arr[i];
            if (roleData) {
                this.rightTotalLife = BigNum.add(this.rightTotalLife, roleData.maxHP);
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
            if (getTargetFunName in this) {
                var targets = this[getTargetFunName](role);
                if (i == 0 && targets.length <= 0) {
                    fight.recordLog("方法" + getTargetFunName + "错误", fight.LOG_FIGHT_ERROR);
                }
                if (targets.length > 0) {
                    var item = this.damageCore(role, targets, skillInfo, this.index++, this.turn - 1);
                    result.push(item);
                }
            }
            else {
                fight.recordLog("\u65B9\u6CD5" + skillInfo.target_cond + "\u9519\u8BEF", fight.LOG_FIGHT_ERROR);
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
        var isAddHP = fight.isAddHPSkill(skillInfo);
        var isFriendSkill = skillInfo.target_group == "friend"; // 友方技能不考虑防御
        var isPhyAtk = skillInfo.damage_type == "physical";
        var isMagicAtk = skillInfo.damage_type == "magical";
        var cri = startRole.isCri();
        var criDamage = cri ? (startRole.critDamage) : 1;
        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(startRole) + "发动攻击", fight.LOG_FIGHT_DATA);
        var result = {
            skillId: skillInfo.id,
            target: [],
            cri: cri,
            maxhp: startRole.maxHP,
            round: round,
            index: index,
            damage: "0"
        };
        // 如果被眩晕
        if (startRole.canAction) {
            // 回血
            startRole.backBlood();
            var killCount = 0;
            for (var i = 0; i < len; i++) {
                var target = targets[i];
                var item = {};
                var atk = void 0, def = void 0;
                item.damage = "0";
                item.maxhp = target.maxHP;
                result.target.push(item);
                target.phyDef = BigNum.mul(target.phyDef, target.getBuffMultiValue(BuffTypeEnum.DEF_MORE_MORE));
                target.magDef = BigNum.mul(target.magDef, target.getBuffMultiValue(BuffTypeEnum.DEF_MORE_MORE));
                if (isPhyAtk) {
                    atk = startRole.phyAtk;
                    def = isFriendSkill ? 0 : target.phyDef;
                }
                else {
                    atk = startRole.magAtk;
                    def = isFriendSkill ? 0 : target.magDef;
                }
                startRole.phyAtk = BigNum.mul(startRole.phyAtk, startRole.getBuffMultiValue(BuffTypeEnum.ATK_MORE_MORE));
                startRole.magAtk = BigNum.mul(startRole.magAtk, startRole.getBuffMultiValue(BuffTypeEnum.ATK_MORE_MORE));
                if (!isFriendSkill) {
                    item.dodge = !!skillInfo.is_dodge && target.isDodge();
                    item.block = !!skillInfo.is_block && target.isBlock();
                }
                // 如果对象加血
                if (isAddHP) {
                    var addHP = BigNum.mul(atk, Math.abs(skillInfo.damage) * criDamage);
                    target.curHP = BigNum.add(target.curHP, addHP);
                    item.hp = target.curHP;
                    item.addHP = addHP;
                    fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "加血" + addHP, fight.LOG_FIGHT_DATA);
                    if (!!skillInfo.buff_id) {
                        target.addBuff(skillInfo.buff_id, startRole);
                    }
                }
                else {
                    if (item.dodge) {
                        // 如果被闪避了
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时闪避了", fight.LOG_FIGHT_DATA);
                    }
                    else {
                        var ratio = 1;
                        if (target.isInvincible) {
                            ratio = 0;
                            item.invincible = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时无敌", fight.LOG_FIGHT_DATA);
                        }
                        else if (isPhyAtk && target.freePhysicalAtk) {
                            ratio = 0;
                            item.isFreePhysicalAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时物免", fight.LOG_FIGHT_DATA);
                        }
                        else if (isMagicAtk && target.freeMagicAtk) {
                            ratio = 0;
                            item.isFreeMagicAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时魔免", fight.LOG_FIGHT_DATA);
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
                        // 攻击要害, 对象对敌人造成伤害时，将伤害值*(1+敌人缺失生命值/敌人生命上限 * value)
                        var lackRatio = BigNum.div(BigNum.sub(target.maxHP, target.curHP), target.maxHP);
                        lackRatio = BigNum.mul(lackRatio, startRole.getBuffPlusValue(BuffTypeEnum.ATTACK_KEY));
                        hurt = BigNum.mul(hurt, BigNum.add(1, lackRatio));
                        // 下马威 对象对敌人造成伤害时，将伤害值*(1+敌人生命值/敌人生命上限 * value)
                        lackRatio = BigNum.div(target.curHP, target.maxHP);
                        lackRatio = BigNum.mul(lackRatio, startRole.getBuffPlusValue(BuffTypeEnum.XIA_MA_WEI));
                        hurt = BigNum.mul(hurt, BigNum.add(1, lackRatio));
                        target.curHP = BigNum.sub(target.curHP, hurt);
                        item.damage = hurt;
                        item.hp = target.curHP;
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时失血" + hurt + "当前血量" + target.curHP + "最大血量" + target.maxHP, fight.LOG_FIGHT_INFO);
                        var outHurtBack = BigNum.mul(backOutHurtRatio, hurt);
                        var backHurt = BigNum.mul(backHurtRatio, hurt);
                        startRole.curHP = BigNum.add(startRole.curHP, outHurtBack);
                        startRole.curHP = BigNum.sub(startRole.curHP, backHurt);
                        result.damage = BigNum.add(result.damage, BigNum.add(backHurt, outHurtBack));
                        result.hp = startRole.curHP;
                        if (BigNum.greater(fight.DIE_HP, target.curHP)) {
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击死亡", 1);
                            killCount++;
                            this.removeRole(target);
                        }
                        else {
                            if (!!skillInfo.buff_id) {
                                target.addBuff(skillInfo.buff_id, startRole);
                            }
                        }
                        if (BigNum.greater(fight.DIE_HP, startRole.curHP)) {
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "反弹死亡", 1);
                            this.removeRole(startRole);
                        }
                    }
                }
                target.addDesInfo(item);
            }
            var addKillHP = BigNum.mul(startRole.maxHP, startRole.getBuffPlusValue(BuffTypeEnum.BLOOD_MORE_MORE));
            startRole.curHP = BigNum.add(startRole.curHP, BigNum.mul(addKillHP, killCount));
            if (killCount > 0 && startRole.isExistBuff(BuffTypeEnum.KILL_MORE_MORE)) {
                startRole.phyAtk = BigNum.mul(startRole.phyAtk, startRole.getBuffMultiValue(BuffTypeEnum.KILL_MORE_MORE) * killCount);
                startRole.magAtk = BigNum.mul(startRole.magAtk, startRole.getBuffMultiValue(BuffTypeEnum.KILL_MORE_MORE) * killCount);
            }
        }
        else {
            result.vertigo = true;
        }
        // 扣血
        if (BigNum.greater(startRole.curHP, 0)) {
            startRole.loseBlood();
            if (BigNum.lessOrEqual(startRole.curHP, 0)) {
                fight.recordLog("第" + index + "攻击者中毒死亡" + fight.getRolePosDes(startRole));
                this.removeRole(startRole);
            }
        }
        startRole.addDesInfo(result);
        return result;
    };
    p.turnBegin = function () {
        this.turn++;
        for (var i = 0; i < this.roles.length; i++) {
            this.roles[i].turnBegin();
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
        if (isEnd) {
            if (len > 0 && this.roles[0].side == FightSideEnum.LEFT_SIDE) {
                this.result = 1;
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
                    if (BigNum.greater(Number(team[i].curHP), Number(result.curHP))) {
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
                    if (BigNum.less(Number(team[i].curHP), Number(result.curHP))) {
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
                    if (BigNum.less(Number(team[i].curHP), Number(result.curHP))) {
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
                    if (BigNum.greater(Number(team[i].phyAtk), Number(result.phyAtk))) {
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
                    if (BigNum.greater(Number(team[i].magAtk), Number(result.magAtk))) {
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
    p.getRightTotalLife = function () {
        return this.rightTotalLife;
    };
    p.getLeftTotalLife = function () {
        return this.leftTotalLife;
    };
    /**
     * 攻击力翻翻
     * @param side
     */
    p.doubleSideAtk = function (side) {
        var roleArr = this.roles;
        for (var i = 0; i < roleArr.length; i++) {
            if (roleArr[i] && roleArr[i].side == side) {
                roleArr[i].phyAtk = BigNum.mul(roleArr[i].phyAtk, 2);
                roleArr[i].magAtk = BigNum.mul(roleArr[i].magAtk, 2);
            }
        }
    };
    /**
     * 回复生命
     * @param side
     * @param ratio
     */
    p.recoverySideBlood = function (side, ratio) {
        if (ratio === void 0) { ratio = 0.5; }
        var roleArr = this.roles;
        for (var i = 0; i < roleArr.length; i++) {
            if (roleArr[i] && roleArr[i].side == side) {
                roleArr[i].curHP = BigNum.add(roleArr[i].curHP, BigNum.mul(roleArr[i].maxHP, ratio));
                roleArr[i].curHP = BigNum.min(roleArr[i].curHP, roleArr[i].maxHP);
            }
        }
    };
    p.doPalmHurt = function (side) {
        var roleArr = this.roles;
        for (var i = 0; i < roleArr.length; i++) {
            if (roleArr[i] && roleArr[i].side == side) {
                if (roleArr[i].id <= 300) {
                    roleArr[i].curHP = "0e0";
                }
                else {
                    roleArr[i].curHP = BigNum.sub(roleArr[i].curHP, BigNum.mul(roleArr[i].maxHP, 0.2));
                }
                if (BigNum.greater(fight.DIE_HP, roleArr[i].curHP)) {
                    this.removeRole(roleArr[i]);
                    i--;
                }
            }
        }
    };
    // 重置
    p.reset = function () {
        for (var i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            this.leftTeam[i] = null;
            this.rightTeam[i] = null;
        }
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
//# sourceMappingURL=FightProcessGenerator.js.map