/**
 * 战斗角色数据
 *
 * @author honghong
 */
var BuffTypeEnum;
(function (BuffTypeEnum) {
    BuffTypeEnum[BuffTypeEnum["PHYSICAL_ATK"] = 1] = "PHYSICAL_ATK";
    BuffTypeEnum[BuffTypeEnum["MAGIC_ATK"] = 2] = "MAGIC_ATK";
    BuffTypeEnum[BuffTypeEnum["PHYSICAL_DEF"] = 3] = "PHYSICAL_DEF";
    BuffTypeEnum[BuffTypeEnum["MAGIC_DEF"] = 4] = "MAGIC_DEF";
    BuffTypeEnum[BuffTypeEnum["HURT_OUT"] = 5] = "HURT_OUT";
    BuffTypeEnum[BuffTypeEnum["HURT"] = 6] = "HURT";
    BuffTypeEnum[BuffTypeEnum["BACK_HURT"] = 7] = "BACK_HURT";
    BuffTypeEnum[BuffTypeEnum["BACK_HURT_OUT"] = 8] = "BACK_HURT_OUT";
    BuffTypeEnum[BuffTypeEnum["VERTIGO"] = 9] = "VERTIGO";
    BuffTypeEnum[BuffTypeEnum["ADD_BLOOD"] = 10] = "ADD_BLOOD";
    BuffTypeEnum[BuffTypeEnum["POISONING"] = 11] = "POISONING";
    BuffTypeEnum[BuffTypeEnum["HIDE"] = 12] = "HIDE";
    BuffTypeEnum[BuffTypeEnum["INVINCIBLE"] = 13] = "INVINCIBLE";
    BuffTypeEnum[BuffTypeEnum["FREE_PHYSICAL"] = 14] = "FREE_PHYSICAL";
    BuffTypeEnum[BuffTypeEnum["FREE_MAGIC"] = 15] = "FREE_MAGIC";
    BuffTypeEnum[BuffTypeEnum["ATK_MORE_MORE"] = 16] = "ATK_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["KILL_MORE_MORE"] = 17] = "KILL_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["BLOOD_MORE_MORE"] = 18] = "BLOOD_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["SEAL_MAGIC"] = 19] = "SEAL_MAGIC";
    BuffTypeEnum[BuffTypeEnum["DEF_MORE_MORE"] = 20] = "DEF_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["FORBIDDEN_ADD_BLOOD"] = 21] = "FORBIDDEN_ADD_BLOOD";
    BuffTypeEnum[BuffTypeEnum["ATTACK_KEY"] = 22] = "ATTACK_KEY";
    BuffTypeEnum[BuffTypeEnum["XIA_MA_WEI"] = 23] = "XIA_MA_WEI";
    BuffTypeEnum[BuffTypeEnum["FIRE_WILL"] = 24] = "FIRE_WILL";
    BuffTypeEnum[BuffTypeEnum["TO_BOSS"] = 25] = "TO_BOSS";
    BuffTypeEnum[BuffTypeEnum["CHANGE_DODGE"] = 26] = "CHANGE_DODGE";
    BuffTypeEnum[BuffTypeEnum["CHANGE_BLOCK"] = 27] = "CHANGE_BLOCK";
    BuffTypeEnum[BuffTypeEnum["CHANGE_CRIT"] = 28] = "CHANGE_CRIT";
    BuffTypeEnum[BuffTypeEnum["CHANGE_CRIT_HURT"] = 29] = "CHANGE_CRIT_HURT";
    BuffTypeEnum[BuffTypeEnum["LIFE"] = 30] = "LIFE"; // 生命
})(BuffTypeEnum || (BuffTypeEnum = {}));
var FightRoleData = (function (_super) {
    __extends(FightRoleData, _super);
    function FightRoleData() {
        _super.apply(this, arguments);
        this.buffInfo = {}; // 类型 -> [id, count......]
        this.turnCount = 0; // 轮数
        this.triggerChanceType = "a"; // 触发chance类型
        this.critDamage = 0;
    }
    var d = __define,c=FightRoleData,p=c.prototype;
    d(p, "order"
        /**
         * 得到出战顺序
         * @returns {number}
         */
        ,function () {
            return this.config.speed + (3 - this.side) * 10 + (9 - this.pos);
        }
    );
    p.turnBegin = function () {
        if (this.turnCount > 0)
            this.reduceBuff();
        this.turnCount++;
        this.physicalAtk = BigNum.mul(this.physicalAtk, this.getBuffMultiValue(BuffTypeEnum.ATK_MORE_MORE));
        this.magicAtk = BigNum.mul(this.magicAtk, this.getBuffMultiValue(BuffTypeEnum.ATK_MORE_MORE));
    };
    /**
     * 要使用的技能
     * @returns {number}
     */
    p.getSkillId = function () {
        var arr = this.config.skill_trigger_order;
        var skillArr = arr.filter(function (value) { return value > 0; });
        var result = skillArr[skillArr.length - 1];
        if (this.canSelectSkill) {
            var len = skillArr.length;
            for (var i = 0; i < len; ++i) {
                var skillId = skillArr[i];
                var skillInfo = Config.SkillData[skillId];
                if (skillInfo) {
                    var triggerId = skillInfo.trigger_chance;
                    var triggerInfo = Config.TriggerChanceData[triggerId];
                    if (!triggerInfo) {
                        fight.recordLog("\u6280\u80FD" + skillId + " \u89E6\u53D1\u4E32" + triggerId + " \u51FA\u9519\u4E86", 50);
                    }
                    else {
                        var triggerArr = triggerInfo['type_' + this.triggerChanceType];
                        if (!triggerArr) {
                            fight.recordLog("\u4E32" + triggerId + " \u6CA1\u6709\u7C7B\u578B" + this.triggerChanceType, 50);
                        }
                        else {
                            var totalSkillCount = triggerArr.length;
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
    };
    // 是否爆击
    p.isCri = function () {
        var result = false;
        if (!this.criChanceArr || this.criChanceArr.length == 0) {
            var triggerId = this.critChance;
            var triggerInfo = Config.TriggerChanceData[triggerId];
            if (!triggerInfo)
                return result;
            var triggerArr = triggerInfo['type_' + this.triggerChanceType];
            this.criChanceArr = triggerArr.concat();
        }
        if (this.criChanceArr.shift() == 1) {
            result = true;
        }
        return result;
    };
    // 是否闪避
    p.isDodge = function () {
        var result = false;
        if (!this.dodgeChanceArr || this.dodgeChanceArr.length == 0) {
            var triggerId = this.dodgeChance;
            var triggerInfo = Config.TriggerChanceData[triggerId];
            if (!triggerInfo)
                return result;
            var triggerArr = triggerInfo['type_' + this.triggerChanceType];
            this.dodgeChanceArr = triggerArr.concat();
        }
        if (this.dodgeChanceArr.shift() == 1) {
            result = true;
        }
        if (this.isExistBuff(BuffTypeEnum.HIDE)) {
            result = true;
        }
        return result;
    };
    // 是否格档
    p.isBlock = function () {
        var result = false;
        if (!this.blockChanceArr || this.blockChanceArr.length == 0) {
            var triggerId = this.blockChance;
            var triggerInfo = Config.TriggerChanceData[triggerId];
            if (!triggerInfo)
                return result;
            var triggerArr = triggerInfo['type_' + this.triggerChanceType];
            this.blockChanceArr = triggerArr.concat();
        }
        if (this.blockChanceArr.shift() == 1) {
            result = true;
        }
        return result;
    };
    // 是否是boss
    p.isBoss = function () {
        var result = fight.isBoss(this.config.id);
        result = result || this.isExistBuff(BuffTypeEnum.TO_BOSS);
        return result;
    };
    d(p, "canSelectSkill"
        // 能选择技能
        ,function () {
            return !this.isExistBuff(BuffTypeEnum.SEAL_MAGIC);
        }
    );
    d(p, "outHurtRatio"
        // 输出伤害系数
        ,function () {
            return this.getBuffMultiValue(BuffTypeEnum.HURT_OUT);
        }
    );
    d(p, "hurtRatio"
        // 伤害系数
        ,function () {
            return this.getBuffMultiValue(BuffTypeEnum.HURT);
        }
    );
    d(p, "backHurtRatio"
        // 反弹自己伤害系数
        ,function () {
            return this.getBuffPlusValue(BuffTypeEnum.BACK_HURT);
        }
    );
    d(p, "backOutHurtRatio"
        // 反弹输出伤害系数
        ,function () {
            return this.getBuffPlusValue(BuffTypeEnum.BACK_HURT_OUT);
        }
    );
    d(p, "freePhysicalAtk"
        // 免物攻
        ,function () {
            return this.isExistBuff(BuffTypeEnum.FREE_PHYSICAL);
        }
    );
    d(p, "freeMagicAtk"
        // 免魔攻
        ,function () {
            return this.isExistBuff(BuffTypeEnum.FREE_MAGIC);
        }
    );
    d(p, "isInvincible"
        // 无敌
        ,function () {
            return this.isExistBuff(BuffTypeEnum.INVINCIBLE);
        }
    );
    d(p, "canAction"
        // 能行动(没有眩晕)
        ,function () {
            return !this.isExistBuff(BuffTypeEnum.VERTIGO);
        }
    );
    // 回血
    p.backBlood = function () {
        var addHP = BigNum.mul(this.maxHP, this.getBuffPlusValue(BuffTypeEnum.ADD_BLOOD));
        if (BigNum.greater(fight.DIE_HP, addHP)) {
            if (!this.isExistBuff(BuffTypeEnum.FORBIDDEN_ADD_BLOOD)) {
                this.curHP = BigNum.add(this.curHP, addHP);
            }
        }
    };
    // 掉血(中毒后)
    p.loseBlood = function () {
        var buffs = this.buffInfo[BuffTypeEnum.POISONING];
        var len = buffs ? buffs.length : 0;
        for (var i = 0; i < len; i++) {
            var hurt = BigNum.sub(buffs[i].magicAtk, this.magicDef);
            hurt = BigNum.mul(hurt, buffs[i].value);
            if (BigNum.greaterOrEqual(hurt, 0)) {
                this.curHP = BigNum.sub(this.curHP, hurt);
            }
            else {
                console.warn("中毒后，伤害应该大于0");
            }
        }
    };
    /**
     * 是否存在buff
     *
     * @param type
     * @returns {boolean}
     */
    p.isExistBuff = function (type) {
        var result = false;
        if (this.buffInfo[type]) {
            result = this.buffInfo[type].length > 0;
        }
        return result;
    };
    /**
     * 得到buff的加值
     *
     * @param type
     * @returns {number}
     */
    p.getBuffPlusValue = function (type) {
        var result = 0;
        var buffs = this.buffInfo[type];
        var len = buffs ? buffs.length : 0;
        for (var i = 0; i < len; i++) {
            result += buffs[i].value;
        }
        return result;
    };
    /**
     * 得到buff的乘值
     *
     * @param type
     * @returns {number}
     */
    p.getBuffMultiValue = function (type) {
        var result = 1;
        var buffs = this.buffInfo[type];
        var len = buffs ? buffs.length : 0;
        for (var i = 0; i < len; i++) {
            result *= buffs[i].value;
        }
        return result;
    };
    /**
     * 得到buff指数值
     * @param type
     * @returns {number}
     */
    // public getBuffIndexValue(type:number|string) {
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
    p.addBuff = function (buffID, role) {
        var obj = Config.BuffData[buffID];
        if (obj) {
            var type = obj.effect;
            var value = obj.value;
            // 如果是boss,并且to_boss为0
            if (!!this.config.boss && !obj.to_boss) {
                return;
            }
            if (type == BuffTypeEnum.PHYSICAL_ATK) {
                this.physicalAtk = BigNum.mul(this.physicalAtk, value);
            }
            else if (type == BuffTypeEnum.MAGIC_ATK) {
                this.magicAtk = BigNum.mul(this.magicAtk, value);
            }
            else if (type == BuffTypeEnum.PHYSICAL_DEF) {
                this.physicalDef = BigNum.mul(this.physicalDef, value);
            }
            else if (type == BuffTypeEnum.MAGIC_DEF) {
                this.magicDef = BigNum.mul(this.magicDef, value);
            }
            else if (type == BuffTypeEnum.LIFE) {
                this._curHP = BigNum.mul(this._curHP, 1 + value);
                this.maxHP = BigNum.mul(this.maxHP, 1 + value);
            }
            else if (type == BuffTypeEnum.CHANGE_DODGE) {
                this.dodgeChance = Math.min(this.dodgeChance + value, 1);
            }
            else if (type == BuffTypeEnum.CHANGE_CRIT) {
                this.critChance = Math.min(this.critChance + value, 1);
            }
            else if (type == BuffTypeEnum.CHANGE_BLOCK) {
                this.blockChance = Math.min(this.blockChance + value, 1);
            }
            else if (type == BuffTypeEnum.CHANGE_CRIT_HURT) {
                this.critDamage += value;
            }
            else {
                if (!this.buffInfo[type]) {
                    this.buffInfo[type] = [];
                }
                if (type == BuffTypeEnum.POISONING) {
                    this.buffInfo[type].push({ id: obj.id, duration: obj.duration, value: obj.value, magicAtk: role.magicAtk, turn: 0 });
                }
                else {
                    this.buffInfo[type].push({ id: obj.id, duration: obj.duration, value: obj.value, turn: 0 });
                }
            }
        }
        else {
            console.error("没有buffID:" + buffID + "配置");
        }
    };
    /**
     * 减去buff
     */
    p.reduceBuff = function () {
        var arr = Object.keys(this.buffInfo);
        for (var i = 0; i < arr.length; i++) {
            var type = arr[i];
            var buffs = this.buffInfo[type];
            for (var j = 0; j < buffs.length; j++) {
                buffs[j].duration--;
                if (buffs[j].duration <= 0) {
                    buffs.splice(j, 1);
                    j--;
                }
                else {
                    buffs[j].turn++;
                }
            }
        }
    };
    p.addDesInfo = function (obj) {
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
        var arr = Object.keys(this.buffInfo);
        for (var i = 0; i < arr.length; i++) {
            var type = arr[i];
            var buffs = this.buffInfo[type];
            for (var j = 0; j < buffs.length; j++) {
                obj.buff.push(buffs[j].id);
            }
        }
    };
    p.parse = function (obj, id) {
        _super.prototype.parse.call(this, obj, id);
        this.critChance = this.config.crit_chance;
        this.critDamage = this.config.crit_damage;
        this.blockChance = this.config.block_chance;
        this.dodgeChance = this.config.dodge_chance;
        this.side = obj.side;
        this.pos = obj.pos;
    };
    return FightRoleData;
}(RoleData));
egret.registerClass(FightRoleData,'FightRoleData');
//# sourceMappingURL=FightRoleData.js.map