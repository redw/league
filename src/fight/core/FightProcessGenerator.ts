/**
 * 战斗过程生成器
 * @author hh
 */
class FightProcessGenerator {
    private leftTeam: FightRoleVO[] = Array(fight.ROLE_UP_LIMIT);
    private rightTeam: FightRoleVO[] = Array(fight.ROLE_UP_LIMIT);
    private allTeam: FightRoleVO[][] = [this.leftTeam, this.rightTeam];
    private roles: FightRoleVO[];
    private orders: FightRoleVO[];
    private index:number = 0;
    private turn:number = 0;
    public result:number = 0;
    private rightTotalLife:string;
    private leftTotalLife:string;

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
            let role = new FightRoleVO(data[i]);
            if (fight.isHero(role.id)) {
                let roleVO = new HeroVO({id:data[i].id});
                role.copyProp(roleVO);
            } else {
                let roleVO = new MonsterVO({id:data[i].id});
                role.copyProp(roleVO);
            }
            this.addSceneData(role);
        }
    }

    /**
     * 添加战斗角色数据
     * @param left  左边角色数据
     * @param right 右边角色数据
     */
    public addSceneDataArr(left:FightRoleVO[], right:FightRoleVO[]) {
        this.reset();
        for (let i = 0; i < left.length; i++) {
            this.addSceneData(left[i]);
        }
        for (let i = 0; i < right.length; i++) {
            this.addSceneData(right[i]);
        }
    }

    public addSceneDataVec(roleVec:FightRoleVO[]) {
        this.reset();
        for (let i = 0; i < roleVec.length; i++) {
            this.addSceneData(roleVec[i]);
        }
    }

    /**
     * 添加单个角色数据
     * @param role
     */
    private addSceneData(role:FightRoleVO) {
        let side = role.side - 1;
        let pos = role.pos;
        this.allTeam[side][pos] = role;
        this.roles.push(role);
    }

    /**
     * 生成战斗报告
     * @param bunch 串
     * @returns {FightReportItem[]}
     */
    public generateData(bunch:string="a") {
        for (let i = 0; i < this.roles.length; i++) {
            this.roles[i].triggerChanceType = bunch;
        }
        let result:FightReportItem[] = [];
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
    }

    /**
     * 重新生成战报
     * @returns {FightReportItem[]}
     */
    public updateGenerateData(){
        let result:FightReportItem[] = [];
        while (!this.checkEnd() && this.turn  <= fight.ROUND_LIMIT) {
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
    }

    private generateOrder(){
        if (!this.orders || this.orders.length == 0) {
            this.orders = this.roles.concat();
            this.orders.sort((a: FightRoleVO, b: FightRoleVO) => {
                return b.order - a.order
            });
        }
    }

    private addBeginBuff(roles:FightRoleVO[]){
        for (let i = 0; i < roles.length; i++) {
            let role = roles[i];
            let beginSkillArr:string[] = role.config.begin_skill;
            let len = beginSkillArr ? beginSkillArr.length : 0;
            for (let j = 0; j < len; j++) {
                let skillId = beginSkillArr[j];
                if (skillId) {
                    if (role.isSkillActive(skillId)) {
                        let skillConfig = Config.SkillData[skillId];
                        let buffId = skillConfig.buff_id;
                        role.addBuff(buffId);
                    }
                }
            }
        }

        this.leftTotalLife = "0";
        let arr = this.allTeam[FightSideEnum.LEFT_SIDE - 1];
        let len = arr ? arr.length : 0;
        for (let i = 0; i < len; i++) {
            let roleData = arr[i];
            if (roleData) {
                this.leftTotalLife = BigNum.add(this.leftTotalLife, roleData.maxHP);
            }
        }

        this.rightTotalLife = "0";
        arr = this.allTeam[FightSideEnum.RIGHT_SIDE - 1];
        len = arr ? arr.length : 0;
        for (let i = 0; i < len; i++) {
            let roleData = arr[i];
            if (roleData) {
                this.rightTotalLife = BigNum.add(this.rightTotalLife, roleData.maxHP);
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
    private damageCore(startRole:FightRoleVO, targets:FightRoleVO[], skillInfo:SkillConfig, index:number, round:number) {
        let len = targets.length;
        let isAddHP = fight.isAddHPSkill(skillInfo);
        let isFriendSkill = skillInfo.target_group == "friend";   // 友方技能不考虑防御
        let isPhyAtk = skillInfo.damage_type == "physical";
        let isMagicAtk = skillInfo.damage_type == "magical";
        let cri = startRole.isCri();
        let criDamage = cri ? (startRole.critDamage): 1;

        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(startRole) + "发动攻击", fight.LOG_FIGHT_DATA);
        let result:FightReportItem = <FightReportItem>{
            skillId:skillInfo.id,
            target:[],
            cri: cri,
            maxhp:startRole.maxHP,
            round: round,
            index: index
        };

        // 如果被眩晕
        if (startRole.canAction) {
            // 回血
            startRole.backBlood();
            let killCount = 0;
            for (let i = 0; i < len; i++) {
                let target:FightRoleVO = targets[i];
                let item:FightReportTargetItem = <FightReportTargetItem>{};
                let atk, def;
                item.damage = "0";
                item.maxhp = target.maxHP;
                result.target.push(item);
                target.phyDef = BigNum.mul(target.phyDef, target.getBuffMultiValue(BuffTypeEnum.DEF_MORE_MORE));
                target.magDef = BigNum.mul(target.magDef, target.getBuffMultiValue(BuffTypeEnum.DEF_MORE_MORE));
                if (isPhyAtk) {
                    atk = startRole.phyAtk;
                    def = isFriendSkill ? 0 :target.phyDef;
                } else {
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
                    let addHP = BigNum.mul(atk, Math.abs(skillInfo.damage) * criDamage);
                    target.curHP = BigNum.add(target.curHP, addHP);
                    item.hp = target.curHP;
                    item.addHP = addHP;
                    fight.recordLog("第" + index + "步角色" +  fight.getRolePosDes(target) + "加血" + addHP, fight.LOG_FIGHT_DATA);
                    if (!!skillInfo.buff_id) {
                        target.addBuff(skillInfo.buff_id, startRole);
                    }
                } else {
                    if (item.dodge) {
                        // 如果被闪避了
                        fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时闪避了", fight.LOG_FIGHT_DATA);
                    } else {
                        let ratio = 1;
                        if (target.isInvincible) {
                            ratio = 0;
                            item.invincible = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时无敌", fight.LOG_FIGHT_DATA);
                        } else if (isPhyAtk && target.freePhysicalAtk) {
                            ratio = 0;
                            item.isFreePhysicalAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时物免", fight.LOG_FIGHT_DATA);
                        } else if (isMagicAtk && target.freeMagicAtk) {
                            ratio = 0;
                            item.isFreeMagicAtk = true;
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击时魔免", fight.LOG_FIGHT_DATA);
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

                        // 攻击要害, 对象对敌人造成伤害时，将伤害值*(1+敌人缺失生命值/敌人生命上限 * value)
                        let lackRatio = BigNum.div(BigNum.sub(target.maxHP,target.curHP), target.maxHP);
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

                        let outHurtBack = BigNum.mul(backOutHurtRatio, hurt);
                        let backHurt = BigNum.mul(backHurtRatio, hurt);
                        startRole.curHP = BigNum.add(startRole.curHP, outHurtBack);
                        startRole.curHP = BigNum.sub(startRole.curHP, backHurt);
                        result.damage = BigNum.add(backHurt, outHurtBack);
                        result.hp = startRole.curHP;

                        if (BigNum.greater(fight.DIE_HP, target.curHP)){
                            fight.recordLog("第" + index + "步角色" + fight.getRolePosDes(target) + "被攻击死亡", 1);
                            killCount++;
                            this.removeRole(target);
                        } else {
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

            let addKillHP = BigNum.mul(startRole.maxHP, startRole.getBuffPlusValue(BuffTypeEnum.BLOOD_MORE_MORE));
            startRole.curHP = BigNum.add(startRole.curHP, BigNum.mul(addKillHP, killCount));
            if (killCount > 0 && startRole.isExistBuff(BuffTypeEnum.KILL_MORE_MORE)) {
                startRole.phyAtk = BigNum.mul(startRole.phyAtk, startRole.getBuffMultiValue(BuffTypeEnum.KILL_MORE_MORE) * killCount);
                startRole.magAtk = BigNum.mul(startRole.magAtk, startRole.getBuffMultiValue(BuffTypeEnum.KILL_MORE_MORE) * killCount);
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
        this.turn++;
        for (let i = 0; i < this.roles.length; i++) {
            this.roles[i].turnBegin();
        }
    }

    // 角色战败后，移除角色
    private removeRole(role: FightRoleVO) {
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
            fight.recordLog("角色不应该为空,移除角色或发生错误", 1);
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
        if (isEnd) {
            if (this.roles[0].side == FightSideEnum.LEFT_SIDE) {
                this.result = 1;
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
        let result:FightRoleVO = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.greater(Number(team[i].curHP), Number(result.curHP))) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到血量最少的目标
    public getLeaseHPTarget(obj: {pos: number, side: number}) {
        let result:FightRoleVO = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.less(Number(team[i].curHP), Number(result.curHP))) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到友方血最最少的目标
    public getSelfSideLeaseHPTarget(obj:{pos: number, side: number}) {
        let result:FightRoleVO = null;
        let team = this.allTeam[obj.side - 1];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = team[i];
                } else {
                    if (BigNum.less(Number(team[i].curHP), Number(result.curHP))) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到最高物攻的目标
    public getMostPhyAtkTarget(obj: {pos: number, side: number}) {
        let result:FightRoleVO = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.greater(Number(team[i].phyAtk), Number(result.phyAtk))) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到最高法攻的目标
    public getLeaseMagicAtkTarget(obj: {pos: number, side: number}) {
        let result:FightRoleVO = null;
        let team = this.allTeam[2 - obj.side];
        for (let i = 0; i < 9; i++) {
            if (team[i]) {
                if (!result) {
                    result = (team[i]);
                } else {
                    if (BigNum.greater(Number(team[i].magAtk), Number(result.magAtk))) {
                        result = team[i];
                    }
                }
            }
        }
        return [result];
    }

    // 得到自己目标
    private getSelfTarget(obj: {pos: number, side: number}) {
        let result:FightRoleVO = this.allTeam[obj.side - 1][obj.pos];
        return [result];
    }

    public getRightTotalLife() {
        return this.rightTotalLife;
    }

    public getLeftTotalLife(){
        return this.leftTotalLife;
    }

    // 重置
    private reset() {
        for (let i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            this.leftTeam[i] = null;
            this.rightTeam[i] = null;
        }
        this.orders = [];
        this.roles = [];
    }
}