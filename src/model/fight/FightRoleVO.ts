/**
 * 战斗角色值对象
 * Created by hh on 2017/1/4.
 */
class FightRoleVO{
    public skill:number;                            // 解锁技能
    public phyAtk:string;
    public phyDef:string;
    public magAtk:string;
    public magDef:string;
    public maxHP:string;
    public id:number;
    public config:RoleConfig;
    public side:number;                             // 边
    public pos:number;                              // 位置
    public turnCount = 0;                           // 轮数

    public triggerChanceType:string = "a";          // 触发chance类型
    public criChanceArr:number[];
    public blockChanceArr:number[];
    public dodgeChanceArr:number[];
    private buffInfo:any = {};                      // 类型 -> [id, count......]
    private dodgeChance:number;
    private blockChance:number;
    private critChance:number;
    public critDamage:number = 0;

    public constructor(value?:{id:number, pos:number, side:number}){
        this.parse(value);
    }

    public parse(value:{id:number, pos:number, side:number}){
        if (value) {
            this.id = value.id;
            this.pos = value.pos;
            this.side = value.side;
            if (fight.isHero(this.id)) {
                this.config = Config.HeroData[this.id];
            } else {
                this.config = Config.EnemyData[this.id];
            }
        }
    }

    public copyProp(vo:HeroVO | MonsterVO){
        this.phyAtk = vo.phyAtk;
        this.phyDef = vo.phyDef;
        this.magAtk = vo.magAtk;
        this.magDef = vo.magDef;
        this.maxHP = vo.maxHP;
        if ("skill" in vo) {
            this.skill = vo["skill"];
        }
        if (!this._curHP) {
            this._curHP = this.maxHP;
        }
    }

    /**
     * 得到出战顺序
     * @returns {number}
     */
    public get order() {
        return this.config.speed + (3 - this.side) * 10 + (9 - this.pos);
    }

    public turnBegin(){
        if (this.turnCount > 0)
            this.reduceBuff();
        this.turnCount++;
    }

    /**
     * 技能是否激活
     */
    public isSkillActive(skillId:number|string){
        // TODO 技能是否激活
        return true;
    }

    /**
     * 要使用的技能
     * @returns {number}
     */
    public getSkillId(){
        let arr = this.config.skill_trigger_order;
        let skillArr = arr.filter((value)=>{return value > 0});
        let result:number = skillArr[skillArr.length - 1];
        if (this.canSelectSkill) {
            const len = skillArr.length;
            for (let i = 0 ; i < len ; ++i) {
                let skillId = skillArr[i];
                let skillInfo = Config.SkillData[skillId];
                if (skillInfo){
                    let triggerId:string|number = skillInfo.trigger_chance;
                    let triggerInfo = Config.TriggerChanceData[triggerId];
                    if (!triggerInfo) {
                        fight.recordLog(`技能${skillId} 触发串${triggerId} 出错了`, 50);
                    } else {
                        let triggerArr = triggerInfo['type_'+ this.triggerChanceType];
                        if (!triggerArr) {
                            fight.recordLog(`串${triggerId} 没有类型${this.triggerChanceType}`, 50);
                        } else {
                            let totalSkillCount = triggerArr.length;
                            if (triggerArr[(this.turnCount - 1) % totalSkillCount] == 1) {
                                result = skillId;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    // 是否爆击
    public isCri(){
        let result = false;
        if (!this.criChanceArr || this.criChanceArr.length == 0) {
            let triggerId:string|number = this.critChance;
            let triggerInfo = Config.TriggerChanceData[triggerId];
            if (!triggerInfo)  return result;
            let triggerArr = triggerInfo['type_'+ this.triggerChanceType];
            this.criChanceArr = triggerArr.concat();
        }
        if (this.criChanceArr.shift() == 1) {
            result = true;
        }
        return result;
    }

    // 是否闪避
    public isDodge() {
        let result = false;
        if (!this.dodgeChanceArr || this.dodgeChanceArr.length == 0) {
            let triggerId:string|number = this.dodgeChance;
            let triggerInfo = Config.TriggerChanceData[triggerId];
            if (!triggerInfo)  return result;
            let triggerArr = triggerInfo['type_'+ this.triggerChanceType];
            this.dodgeChanceArr = triggerArr.concat();
        }
        if (this.dodgeChanceArr.shift() == 1) {
            result = true;
        }
        if (this.isExistBuff(BuffTypeEnum.HIDE)) {
            result = true;
        }
        return result;
    }

    // 是否格档
    public isBlock() {
        let result = false;
        if (!this.blockChanceArr || this.blockChanceArr.length == 0) {
            let triggerId:string|number = this.blockChance;
            let triggerInfo = Config.TriggerChanceData[triggerId];
            if (!triggerInfo) return result;
            let triggerArr = triggerInfo['type_'+ this.triggerChanceType];
            this.blockChanceArr = triggerArr.concat();
        }
        if (this.blockChanceArr.shift() == 1) {
            result = true;
        }
        return result;
    }

    // 是否是boss
    public isBoss(){
        let result = fight.isBoss(this.config.id);
        result = result || this.isExistBuff(BuffTypeEnum.TO_BOSS);
        return result;
    }

    // 能选择技能
    private get canSelectSkill(){
        return !this.isExistBuff(BuffTypeEnum.SEAL_MAGIC);
    }

    // 输出伤害系数
    public get outHurtRatio(){
        return this.getBuffMultiValue(BuffTypeEnum.HURT_OUT);
    }

    // 伤害系数
    public get hurtRatio() {
        return this.getBuffMultiValue(BuffTypeEnum.HURT);
    }

    // 反弹自己伤害系数
    public get backHurtRatio(){
        return this.getBuffPlusValue(BuffTypeEnum.BACK_HURT);
    }

    // 反弹输出伤害系数
    public get backOutHurtRatio(){
        return this.getBuffPlusValue(BuffTypeEnum.BACK_HURT_OUT);
    }

    // 免物攻
    public get freePhysicalAtk(){
        return this.isExistBuff(BuffTypeEnum.FREE_PHYSICAL);
    }

    // 免魔攻
    public get freeMagicAtk(){
        return this.isExistBuff(BuffTypeEnum.FREE_MAGIC);
    }

    // 无敌
    public get isInvincible(){
        return this.isExistBuff(BuffTypeEnum.INVINCIBLE);
    }

    // 能行动(没有眩晕)
    public get canAction(){
        return !this.isExistBuff(BuffTypeEnum.VERTIGO);
    }

    // 回血
    public backBlood() {
        let addHP = BigNum.mul(this.maxHP, this.getBuffPlusValue(BuffTypeEnum.ADD_BLOOD));
        if (!this.isExistBuff(BuffTypeEnum.FORBIDDEN_ADD_BLOOD)) {
            this.curHP = BigNum.add(this._curHP, addHP);
        }
    }

    // 掉血(中毒后)
    public loseBlood(){
        let buffs = this.buffInfo[BuffTypeEnum.POISONING];
        const len = buffs ? buffs.length : 0;
        for (let i = 0; i < len; i++) {
            let hurt = BigNum.sub(buffs[i].magAtk, this.magDef);
            hurt = BigNum.mul(hurt, buffs[i].value);
            if (BigNum.greaterOrEqual(hurt, 0)) {
                this.curHP = BigNum.add(this.curHP, hurt);
            } else {
                fight.recordLog("中毒后，伤害应该大于0", fight.LOG_FIGHT_WARN);
            }
        }
    }

    /**
     * 是否存在buff
     *
     * @param type
     * @returns {boolean}
     */
    public isExistBuff(type:number|string) {
        let result = false;
        if (this.buffInfo[type]) {
            result = this.buffInfo[type].length > 0;
        }
        return result;
    }

    /**
     * 得到buff的加值
     *
     * @param type
     * @returns {number}
     */
    public getBuffPlusValue(type:number|string) {
        let result = 0;
        let buffs = this.buffInfo[type];
        let len = buffs ? buffs.length : 0;
        for (let i = 0; i < len; i++) {
            result += buffs[i].value;
        }
        return result;
    }

    /**
     * 得到buff的乘值
     *
     * @param type
     * @returns {number}
     */
    public getBuffMultiValue(type:number|string) {
        let result = 1;
        let buffs = this.buffInfo[type];
        let len = buffs ? buffs.length : 0;
        for (let i = 0; i < len; i++) {
            result *= buffs[i].value;
        }
        return result;
    }

    /**
     * 给角色施加buff
     *
     * @param buffID  被拖加的buffId
     * @param role  施加者
     */
    public addBuff(buffID:number|string, role?:FightRoleVO){
        let obj:BuffConfig = Config.BuffData[buffID];
        if (obj) {
            let type = obj.effect;
            let value  = obj.value;
            // 如果是boss,并且to_boss为0
            if (!!this.config.boss && !obj.to_boss) {
                return;
            }
            if (type == BuffTypeEnum.PHYSICAL_ATK) {
                this.phyAtk = BigNum.mul(this.phyAtk, value);
            } else if (type == BuffTypeEnum.MAGIC_ATK) {
                this.magAtk = BigNum.mul(this.magAtk, value);
            } else if (type == BuffTypeEnum.PHYSICAL_DEF) {
                this.phyDef = BigNum.mul(this.phyDef, value);
            } else if (type == BuffTypeEnum.MAGIC_DEF){
                this.magDef = BigNum.mul(this.magDef, value);
            } else if (type == BuffTypeEnum.LIFE) {
                this._curHP = BigNum.mul(this._curHP, 1 + value);
                this.maxHP = BigNum.mul(this.maxHP, 1 + value);
            } else if (type == BuffTypeEnum.CHANGE_DODGE) {
                this.dodgeChance = Math.min(this.dodgeChance + value, 1);
            } else if (type == BuffTypeEnum.CHANGE_CRIT) {
                this.critChance = Math.min(this.critChance + value, 1);
            } else if (type == BuffTypeEnum.CHANGE_BLOCK) {
                this.blockChance = Math.min(this.blockChance + value, 1);
            } else if (type == BuffTypeEnum.CHANGE_CRIT_HURT) {
                this.critDamage += value;
            }
            if (!this.buffInfo[type]) {
                this.buffInfo[type] = [];
            }
            if (type == BuffTypeEnum.POISONING) {
                this.buffInfo[type].push({id:obj.id, duration:obj.duration, value:obj.value, magicAtk:role.magAtk});
            } else {
                this.buffInfo[type].push({id:obj.id, duration:obj.duration, value:obj.value});
            }
        } else {
            fight.recordLog("没有buffID:" + buffID + "配置", fight.LOG_FIGHT_WARN);
        }
    }

    /**
     * 减去buff
     */
    private reduceBuff() {
        let arr = Object.keys(this.buffInfo);
        for (let i = 0; i < arr.length; i++) {
            let type = arr[i];
            let buffs = this.buffInfo[type];
            for (let j = 0; j < buffs.length; j++) {
                buffs[j].duration--;
                if (buffs[j].duration <= 0) {
                    buffs.splice(j ,1);
                    j--;
                } else {
                    buffs[j].turn++;
                }
            }
        }
    }

    public addDesInfo(obj:FightReportItem | FightReportTargetItem) {
        obj.hp = this.curHP;
        obj.phyAtk = this.phyAtk;
        obj.phyDef = this.phyDef;
        obj.magAtk = this.magAtk;
        obj.magDef = this.magDef;
        obj.id = this.config.id;
        obj.pos = fight.getRolePosDes(this);
        obj.dcri = this.critChance;
        obj.dcirDom = this.critDamage;
        obj.ddodge = this.dodgeChance;
        obj.dblock = this.blockChance;
        obj.buff = [];
        let arr = Object.keys(this.buffInfo);
        for (let i = 0; i < arr.length; i++) {
            let type = arr[i];
            let buffs = this.buffInfo[type];
            for (let j = 0; j < buffs.length; j++) {
                obj.buff.push(buffs[j].id);
            }
        }
    }

    public updateProp(prop:{magAtk:string, magDef:string, maxHP:string, phyAtk:string, phyDef:string, skill?:number}){
        this.magAtk = prop.magAtk;
        this.magDef = prop.magDef;
        this.maxHP = prop.maxHP;
        this.phyAtk = prop.phyAtk;
        this.phyDef = prop.phyDef;
        this.skill = prop.skill || 0;
        if (!this._curHP) {
            this._curHP = this.maxHP;
        }
    }

    protected _curHP:string;
    public get curHP(){
        return this._curHP;
    }

    public set curHP(value:string){
        if (this._curHP != value) {
            this._curHP = value;
            this._curHP = BigNum.clamp(this._curHP, 0, this.maxHP);
        }
    }
}
