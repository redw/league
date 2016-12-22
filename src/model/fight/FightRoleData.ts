/**
 * 战斗角色数据
 *
 * @author honghong
 */
enum BuffTypeEnum
{
    PHYSICAL_ATK = 1,                               // 物攻
    MAGIC_ATK,                                      // 魔攻
    PHYSICAL_DEF,                                   // 物防
    MAGIC_DEF,                                      // 魔防
    HURT_OUT,                                       // 伤害输出
    HURT,                                           // 伤害
    BACK_HURT,                                      // 伤害反弹
    BACK_HURT_OUT,                                  // 伤害输出反弹
    VERTIGO,                                        // 眩晕
    ADD_BLOOD,                                      // 回血
    POISONING,                                      // 中毒
    HIDE,                                           // 隐匿
    INVINCIBLE,                                     // 无敌
    FREE_PHYSICAL,                                  // 物免
    FREE_MAGIC,                                     // 魔免
    ATK_MORE_MORE,                                  // 越来越(物攻/魔攻)
    KILL_MORE_MORE,                                 // 越来越(击杀)
    BLOOD_MORE_MORE,                                // 越来越(血量)
    SEAL_MAGIC,                                     // 封魔
    DEF_MORE_MORE,                                  // 越来越(物防/魔防)
    FORBIDDEN_ADD_BLOOD,                            // 冰封生命
    ATTACK_KEY,                                     // 攻击要害
    XIA_MA_WEI,                                     // 下马威
    FIRE_WILL,                                      // 火的意志
    TO_BOSS,                                        // 成为boss
    CHANGE_DODGE,                                   // 改变闪避率
    CHANGE_BLOCK,                                   // 改变格档率
    CHANGE_CRIT,                                    // 改变暴击率
    CHANGE_CRIT_HURT,                               // 改变暴击伤害
    LIFE                                            // 生命
}

class FightRoleData extends RoleData {
    private buffInfo:any = {};                      // 类型 -> [id, count......]
    public side:number;                             // 边
    public pos:number;                              // 位置
    public turnCount = 0;                           // 轮数
    public triggerChanceType:string = "a";          // 触发chance类型
    public criChanceArr:number[];
    public blockChanceArr:number[];
    public dodgeChanceArr:number[];
    public critDamage:number = 0;

    private dodgeChance:number;
    private blockChance:number;
    private critChance:number;

    /**
     * 得到出战顺序
     * @returns {number}
     */
    public get order() {
        return this.config.speed + (3 - this.side) * 10 + (9 - this.pos);
    }

    public turnBegin(){
        this.reduceBuff();
        this.turnCount++;
        this.physicalAtk = BigNum.mul(this.physicalAtk, this.getBuffMultiValue(BuffTypeEnum.ATK_MORE_MORE));
        this.magicAtk = BigNum.mul(this.magicAtk, this.getBuffMultiValue(BuffTypeEnum.ATK_MORE_MORE));
    }

    /**
     * 要使用的技能
     * @returns {number}
     */
    public getSkillId(){
        let arr = this.config.skill_trigger_order;
        let result:number = arr[arr.length - 1];
        if (this.canSelectSkill) {
            const len = arr.length;
            for (let i = 0 ; i < len ; ++i) {
                let skillId = arr[i];
                let skillInfo = Config.SkillData[skillId];
                let triggerId:string|number = skillInfo.trigger_chance || 0;
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
        this.changeHP(BigNum.mul(this.maxHP, this.getBuffPlusValue(BuffTypeEnum.ADD_BLOOD)));
    }

    // 掉血(中毒后)
    public loseBlood(){
        let buffs = this.buffInfo[BuffTypeEnum.POISONING];
        const len = buffs ? buffs.length : 0;
        for (let i = 0; i < len; i++) {
            let hurt = BigNum.sub(buffs[i].magicAtk, this.magicDef);
            hurt = BigNum.mul(hurt, buffs[i].value);
            if (BigNum.greaterOrEqual(hurt, 0)) {
                this.changeHP(BigNum.mul(hurt,  -1));
            } else {
                console.warn("中毒后，伤害应该大于0");
            }
        }
    }

    // 加血(最好要直接掉curHP)
    public changeHP(hp:any){
        if (hp > 0) {
            if (!this.isExistBuff(BuffTypeEnum.FORBIDDEN_ADD_BLOOD)) {
                this.curHP = BigNum.add(this.curHP, hp);
                this.curHP = BigNum.min(this.curHP, this.maxHP);
            }
        } else {
            this.curHP = BigNum.add(this.curHP, hp);
            // this.curHP += hp;
        }
    }

    /**
     * 是否存在buff
     *
     * @param type
     * @returns {boolean}
     */
    private isExistBuff(type:number|string) {
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
    private getBuffMultiValue(type:number|string) {
        let result = 1;
        let buffs = this.buffInfo[type];
        let len = buffs ? buffs.length : 0;
        for (let i = 0; i < len; i++) {
            result *= buffs[i].value;
        }
        return result;
    }

    /**
     * 得到buff指数值
     * @param type
     * @returns {number}
     */
    // private getBuffIndexValue(type:number|string) {
    //     let result = 1;
    //     let buffs = this.buffInfo[type];
    //     let len = buffs ? buffs.length : 0;
    //     for (let i = 0; i < len; i++) {
    //         result *= (1 + buffs[i].value);
    //     }
    //     return result;
    // }

    /**
     * 给角色施加buff
     *
     * @param buffID  被拖加的buffId
     * @param role  施加者
     */
    public addBuff(buffID:number|string, role?:FightRoleData){
        let obj:BuffConfig = Config.BuffData[buffID];
        if (obj) {
            let type = obj.effect;
            let value  = obj.value;
            // 如果是boss,并且to_boss为0
            if (!!this.config.boss && !obj.to_boss) {
                return;
            }
            if (type == BuffTypeEnum.PHYSICAL_ATK) {
                this.physicalAtk = BigNum.mul(this.physicalAtk, value);
            } else if (type == BuffTypeEnum.MAGIC_ATK) {
                this.magicAtk = BigNum.mul(this.magicAtk, value);
            } else if (type == BuffTypeEnum.PHYSICAL_DEF) {
                this.physicalDef = BigNum.mul(this.physicalDef, value);
            } else if (type == BuffTypeEnum.MAGIC_DEF){
                this.magicDef = BigNum.mul(this.magicDef, value);
            } else if (type == BuffTypeEnum.LIFE) {
                this.curHP = BigNum.mul(this.curHP, 1 + value);
                this.maxHP = BigNum.mul(this.maxHP, 1 + value);
            } else if (type == BuffTypeEnum.CHANGE_DODGE) {
                this.dodgeChance = Math.min(this.dodgeChance + value, 1);
            } else if (type == BuffTypeEnum.CHANGE_CRIT) {
                this.critChance = Math.min(this.critChance + value, 1);
            } else if (type == BuffTypeEnum.CHANGE_BLOCK) {
                this.blockChance = Math.min(this.blockChance + value, 1);
            } else if (type == BuffTypeEnum.CHANGE_CRIT_HURT) {
                this.critDamage += value;
            } else {
                if (!this.buffInfo[type]) {
                    this.buffInfo[type] = [];
                }
                if (type == BuffTypeEnum.POISONING) {
                    this.buffInfo[type].push({id:obj.id, duration:obj.duration, value:obj.value, magicAtk:role.magicAtk, turn:0});
                } else {
                    this.buffInfo[type].push({id:obj.id, duration:obj.duration, value:obj.value, turn:0});
                }
            }
        } else {
            console.error("没有buffID:" + buffID + "配置");
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
        obj.phyAtk = this.physicalAtk;
        obj.phyDef = this.physicalDef;
        obj.magAtk = this.magicAtk;
        obj.magDef = this.magicDef;
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

    public parse(obj:any, id:number) {
        super.parse(obj, id);
        this.critChance = this.config.crit_chance;
        this.critDamage = this.config.crit_damage;
        this.blockChance = this.config.block_chance;
        this.dodgeChance = this.config.dodge_chance;
        this.side = obj.side;
        this.pos = obj.pos;
    }
}