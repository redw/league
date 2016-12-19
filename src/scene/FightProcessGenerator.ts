/**
 * 战斗过程生成器
 *
 * @author hh
 */
class FightProcessGenerator {
    private leftTeam: FightRoleData[] = Array(9);
    private rightTeam: FightRoleData[] = Array(9);
    private allTeam: FightRoleData[][] = [this.leftTeam, this.rightTeam];
    private roles: FightRoleData[];
    private orders: FightRoleData[];
    private index:number = 0;
    private turn:number = 0;

    private static SkillTargetFunMap = {
        "one1":"getTarget",
        "one2":"getReverseTarget",
        "row":"getRowTargets",
        "line1":"getColumnTargets",
        "line2":"getColumnReverseTargets",
        "all_enemy":"getOtherSideTargets",
        "all_friend":"getMySideTargets",
        "hp_least":"getLeaseHPTarget",
        "hp_most":"getMostHPTarget",
        "physical_atk_most":"getMostPhyAtkTarget",
        "magical_atk_most":"getLeaseMagicAtkTarget",
        "friend_hp_least":"getSelfSideLeaseHPTarget",
        "self":"getSelfTarget"
    };

    /**
     * 通过配置 添加战斗角色数据
     * @param data
     */
    public addConfigDataArr(data: {id: number, pos: number, side: number}[]) {
        this.reset();
        let len = data.length;
        for (let i = 0; i < len; i++) {
            let role = new FightRoleData();
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
    }

    /**
     * 添加战斗角色数据
     * @param left  左边角色数据
     * @param right 右边角色数据
     */
    public addSceneDataArr(left:FightRoleData[], right:FightRoleData[]) {
        this.reset();
        for (let i = 0; i < left.length; i++) {
            this.addSceneData(left[i]);
        }
        for (let i = 0; i < right.length; i++) {
            this.addSceneData(right[i]);
        }
    }

    /**
     * 添加单个角色数据
     * @param role
     */
    private addSceneData(role:FightRoleData) {
        let side = role.side - 1;
        let pos = role.pos;
        this.allTeam[side][pos] = role;
        this.roles.push(role);
    }

    /**
     * 生成战斗报告
     * @returns {FightReportItem[]}
     */
    public generateData() {
        let result:FightReportItem[] = [];
        this.index = 0;
        this.turn = 0;
        this.addBeginBuff(this.roles);
        while (!this.checkEnd() && this.index <= 300) {
            if (this.index >= 300) {
                fight.recordLog("战斗步数超过了300,数据有问题", fight.LOG_FIGHT_ERROR);
                break;
            }
            this.generateOrder();
            while (this.orders.length > 0 && !this.checkEnd()) {
                this.generateItem(result);
            }
        }
        return result;
    }

    /**
     * 重新生成战报
     * @returns {FightReportItem[]}
     */
    public updateGenerateData(){
        let result:FightReportItem[] = [];
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
    }

    private generateOrder(){
        if (!this.orders || this.orders.length == 0) {
            this.orders = this.roles.concat();
            this.orders.sort((a: FightRoleData, b: FightRoleData) => {
                return b.order - a.order
            });
            this.turnBegin();
            this.turn++;
        }
    }

    private addBeginBuff(roles:FightRoleData[]){
        for (let i = 0; i < roles.length; i++) {
            let role = roles[i];
            let beginSkillArr:string[];
            if (typeof role.config.begin_skill == "string" || typeof role.config.begin_skill == "number") {
                beginSkillArr = (String(role.config.begin_skill)).split(",");
            } else {
                beginSkillArr = role.config.begin_skill;
            }
            for (let j = 0; j < beginSkillArr.length; j++) {
                let skillId = beginSkillArr[j];
                if (!!skillId) {
                    if (role.isSkillActive(skillId)) {
                        let skillConfig = Config.SkillData[skillId];
                        let buffId = skillConfig.buff_id;
                        role.addBuff(buffId);
                    }
                }
            }
        }
    }

    private generateItem(result:FightReportItem[]){
        let role = this.orders.shift();
        let skillId = role.getSkillId();
        let skillInfo:SkillConfig = Config.SkillData[skillId];
        let getTargetFunName = FightProcessGenerator.SkillTargetFunMap[skillInfo.target_cond];
        let skillRepeat = skillInfo.repeat;
        for (let i = 0; i < skillRepeat; i++) {
            let targets = this[getTargetFunName](role);
            if (i == 0 && targets.length <= 0) {
                fight.recordLog("方法" + getTargetFunName + "错误", fight.LOG_FIGHT_ERROR);
            }
            if (targets.length > 0) {
                let item = this.damageCore(role, targets, skillInfo, this.index++, this.turn - 1);
                result.push(item);
            }
        }
    }

    /**
     * 计算伤害
     * @param startRole
     * @param targets
     * @param skillInfo
     * @param index
     * @param round
     * @returns {FightReportItem}
     */
    private damageCore(startRole:FightRoleData, targets:FightRoleData[], skillInfo:SkillConfig, index:number, round:number) {
        let len = targets.length;
        let isAddHP = skillInfo.target_group == "friend";
        let isPhyAtk = skillInfo.damage_type == "physical";
        let isMagicAtk = skillInfo.damage_type == "magical";
        let cri = startRole.isCri();
        let criDamage = cri ? (startRole.critDamage): 1;

        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(startRole) + "发动攻击", fight.LOG_FIGHT_INFO);
        let result:FightReportItem = <FightReportItem>{
            skillId:skillInfo.id,
            target:[],
            cri: cri,
            round: round,
            index: index
        };

        // 如果被眩晕
        if (startRole.canAction) {
            // 回血
            startRole.backBlood();
            for (let i = 0; i < len; i++) {
                let target:FightRoleData = targets[i];
                let item:FightReportTargetItem = <FightReportTargetItem>{};
                let atk, def;
                item.damage = "0";
                result.target.push(item);
                target.physicalDef = BigNum.mul(target.physicalDef, 1 + target.getBuffPlusValue(BuffTypeEnum.DEF_MORE_MORE));
                target.magicDef = BigNum.mul(target.magicDef, 1 + target.getBuffPlusValue(BuffTypeEnum.DEF_MORE_MORE));
                if (isPhyAtk) {
                    atk = startRole.physicalAtk;
                    def = target.physicalDef;
                } else {
                    atk = startRole.magicAtk;
                    def = target.magicDef;
                }
                // 如果对象加血
                if (isAddHP) {
                    let addHP = BigNum.mul(atk, Math.abs(skillInfo.damage) * criDamage);
                    target.curHP = BigNum.add(target.curHP, addHP);
                    target.curHP = BigNum.min(target.curHP, target.maxHP);
                    item.hp = target.curHP;
                    item.addHP = addHP;
                    fight.recordLog("第" + index + "步角色" +  fight.getRolePosDes(target) + "加血" + addHP, fight.LOG_FIGHT_INFO);
                    if (!!skillInfo.buff_id) {
                        target.addBuff(skillInfo.buff_id, startRole);
                    }
                } else {
                    item.dodge = target.isDodge();
                    item.block = target.isBlock();
                    if (item.dodge) {
                        // 如果被闪避了
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时闪避了", fight.LOG_FIGHT_INFO);
                    } else {
                        let ratio = 1;
                        if (target.isInvincible) {
                            ratio = 0;
                            item.invincible = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时无敌", fight.LOG_FIGHT_INFO);
                        } else if (isPhyAtk && target.freePhysicalAtk) {
                            ratio = 0;
                            item.isFreePhysicalAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时物免", fight.LOG_FIGHT_INFO);
                        } else if (isMagicAtk && target.freeMagicAtk) {
                            ratio = 0;
                            item.isFreeMagicAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时魔免", fight.LOG_FIGHT_INFO);
                        }

                        // 计算伤害
                        let outHurtRatio = startRole.outHurtRatio;
                        let targetHurtRatio = target.hurtRatio;
                        let backHurtRatio = target.backHurtRatio;
                        let backOutHurtRatio = startRole.backOutHurtRatio;
                        item.hurtRatio = targetHurtRatio;
                        item.backHurtRatio = backHurtRatio;
                        result.backOutHurtRatio = backOutHurtRatio;
                        result.outHurtRatio = outHurtRatio;

                        let damage = skillInfo.damage;
                        let outHurt = BigNum.max(0, BigNum.mul(BigNum.sub(atk, def), outHurtRatio * criDamage * damage));
                        let hurt = BigNum.mul(outHurt, targetHurtRatio * (item.block ? 0.5 : 1) * ratio);
                        target.curHP = BigNum.sub(target.curHP, hurt);
                        item.damage = hurt;
                        item.hp = target.curHP;
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时失血" + hurt + "当前血量" + target.curHP + "最大血量" + target.maxHP, 0);

                        let outHurtBack = BigNum.mul(backOutHurtRatio, hurt);
                        let backHurt = BigNum.mul(backHurtRatio, hurt);
                        startRole.curHP = BigNum.sub(BigNum.add(startRole.curHP, outHurtBack), backHurt);
                        startRole.curHP = BigNum.min(startRole.curHP, startRole.maxHP);
                        result.damage = BigNum.add(backHurt, outHurtBack);
                        result.hp = startRole.curHP;

                        if (BigNum.greaterOrEqual(0, target.curHP)){
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击死亡", fight.LOG_FIGHT_ROLE_DIE);
                            this.removeRole(target);
                        } else {
                            if (!!skillInfo.buff_id) {
                                target.addBuff(skillInfo.buff_id, startRole);
                            }
                        }
                        if (BigNum.greaterOrEqual(0, startRole.curHP)) {
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "反弹死亡", fight.LOG_FIGHT_ROLE_DIE);
                            this.removeRole(startRole);
                        }
                    }
                }
                target.addDesInfo(item);
            }
        } else {
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
    }

    private turnBegin(){
        for (let i = 0; i < this.orders.length; i++) {
            this.orders[i].turnBegin();
        }
    }

    // 角色死亡后，移除角色
    private removeRole(role: FightRoleData) {
        let side = role.side - 1;
        let pos = role.pos;
        for (let i = 0; i < this.roles.length; i++) {
            if (this.roles[i] == role) {
                this.roles.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i] == role) {
                this.orders.splice(i, 1);
                break;
            }
        }
        if (this.allTeam[side][pos] == null) {
            fight.recordLog("角色不应该为空,移除角色或发生错误", fight.LOG_FIGHT_WARN);
        }
        this.allTeam[side][pos] = null;
    }

    // 检查是否结束
    private checkEnd() {
        let len = this.roles.length;
        let isEnd = true;
        let side = 0;
        for (let i = 0; i < len; i++) {
            if (i == 0) {
                side = this.roles[0].side;
            } else {
                if (side != this.roles[i].side) {
                    isEnd = false;
                    break;
                }
            }
        }
        return isEnd;
    }

    // 得到正序单目标
    private getTarget(obj: {pos: number, side: number}) {
        let result = [];
        let row = obj.pos % 3;
        let indexArr: number[] = [];
        let rows = fight.getCommonOrders(row);
        for (let i = 0; i < rows.length; i++) {
            indexArr.push(rows[i], rows[i] + 3, rows[i] + 6);
        }
        const len = indexArr.length;
        const team = this.allTeam[2 - obj.side];
        for (let i = 0; i < len; i++) {
            let index = indexArr[i];
            if (team[index])
                result.push(team[index]);
            if (result.length > 0) {
                break;
            }
        }
        return result;
    }

    // 得到倒序单目标
    private getReverseTarget(obj: {pos: number, side: number}) {
        let result = [];
        let row = obj.pos % 3;
        let indexArr: number[] = [];
        let rows = fight.getCommonOrders(row);
        for (let i = 0; i < rows.length; i++) {
            indexArr.push(rows[i] + 6, rows[i] + 3, rows[i]);
        }
        let len = indexArr.length;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < len; i++) {
            let index = indexArr[i];
            if (team[index])
                result.push(team[index]);
            if (result.length > 0) {
                break;
            }
        }
        return result;
    }

    // 得到正序一列
    private getColumnTargets(obj: {pos: number, side: number}) {
        let result = [];
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let index = i * 3 + j;
                if (team[index]) {
                    result.push(team[index]);
                }
            }
            if (result.length > 0) {
                break;
            }
        }
        return result;
    }

    // 得到倒序一列
    private getColumnReverseTargets(obj: {pos: number, side: number}) {
        let result = [];
        let team = this.allTeam[2 - obj.side];
        for (let i = 2; i >= 0; i--) {
            for (let j = 0; j < 3; j++) {
                let index = i * 3 + j;
                if (team[index]) {
                    result.push(team[index]);
                }
            }
            if (result.length > 0) {
                break;
            }
        }
        return result;
    }

    // 得到一排目标
    private getRowTargets(obj: {pos: number, side: number}) {
        let result = [];
        let rows = fight.getCommonOrders(obj.pos % 3);
        let indexArr: number[][] = [];
        for (let i = 0; i < rows.length; i++) {
            indexArr.push([rows[i], rows[i] + 3, rows[i] + 6]);
        }
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let index = indexArr[i][j];
                if (team[index]) {
                    result.push(team[index]);
                }
            }
            if (result.length > 0) {
                break;
            }
        }
        return result;
    }

    // 得到本方所有目标
    public getMySideTargets(obj: {pos: number, side: number}) {
        let result = [];
        let team = this.allTeam[obj.side - 1];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                result.push(team[i]);
            }
        }
        return result;
    }

    // 得到对方所有目标
    public getOtherSideTargets(obj: {pos: number, side: number}) {
        let result = [];
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                result.push(team[i]);
            }
        }
        return result;
    }

    // 得到血量最多的目标
    public getMostHPTarget(obj: {pos: number, side: number}) {
        let result:FightRoleData = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.greater(team[i].curHP, result.curHP)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到血量最少的目标
    public getLeaseHPTarget(obj: {pos: number, side: number}) {
        let result:FightRoleData = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.less(team[i].curHP, result.curHP)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到友方血最最少的目标
    public getSelfSideLeaseHPTarget(obj:{pos: number, side: number}) {
        let result:FightRoleData = null;
        let team = this.allTeam[obj.side - 1];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = team[i];
                } else {
                    if (BigNum.less(team[i].curHP, result.curHP)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到最高物攻的目标
    public getMostPhyAtkTarget(obj: {pos: number, side: number}) {
        let result:FightRoleData = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.greater(team[i].physicalAtk, result.physicalAtk)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到最高法攻的目标
    public getLeaseMagicAtkTarget(obj: {pos: number, side: number}) {
        let result:FightRoleData = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.greater(team[i].magicAtk, result.magicAtk)) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到自己目标
    private getSelfTarget(obj: {pos: number, side: number}) {
        let result:FightRoleData = this.allTeam[obj.side - 1][obj.pos];
        return [result];
    }

    // 重置
    private reset() {
        this.leftTeam = Array(9);
        this.rightTeam = Array(9);
        this.index = 0;
        this.turn = 0;
        this.orders = [];
        this.roles = [];
    }
}