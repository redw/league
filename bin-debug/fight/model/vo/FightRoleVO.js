/**
 * 战斗角色值对象
 * Created by hh on 2017/1/4.
 */
var FightRoleVO = (function () {
    function FightRoleVO(value) {
        this.turnCount = 0; // 轮数
        this.triggerChanceType = "a"; // 触发chance类型
        this.buffInfo = {}; // 类型 -> [id, count......]
        this.dodgeChance = 0;
        this.blockChance = 0;
        this.critChance = 0;
        this.critDamage = 0;
        this.parse(value);
    }
    var d = __define,c=FightRoleVO,p=c.prototype;
    p.parse = function (value) {
        if (value) {
            this.id = value.id;
            this.pos = value.pos;
            this.side = value.side;
            if (fight.isHero(this.id)) {
                this.config = Config.HeroData[this.id];
            }
            else {
                this.config = Config.EnemyData[this.id];
            }
            this.critChance = this.config.crit_chance;
            this.critDamage = this.config.crit_damage;
            this.blockChance = this.config.block_chance;
            this.dodgeChance = this.config.dodge_chance;
        }
    };
    p.copyProp = function (vo) {
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
    };
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
    };
    /**
     * 技能是否激活
     */
    p.isSkillActive = function (skillId) {
        // TODO 技能是否激活
        return true;
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
        if (!this.isExistBuff(BuffTypeEnum.FORBIDDEN_ADD_BLOOD)) {
            this.curHP = BigNum.add(this._curHP, addHP);
        }
    };
    // 掉血(中毒后)
    p.loseBlood = function () {
        var buffs = this.buffInfo[BuffTypeEnum.POISONING];
        var len = buffs ? buffs.length : 0;
        for (var i = 0; i < len; i++) {
            var hurt = BigNum.sub(buffs[i].magAtk, this.magDef);
            hurt = BigNum.mul(hurt, buffs[i].value);
            if (BigNum.greaterOrEqual(hurt, 0)) {
                this.curHP = BigNum.add(this.curHP, hurt);
            }
            else {
                fight.recordLog("中毒后，伤害应该大于0", fight.LOG_FIGHT_WARN);
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
            // 如果是boss,并且to_boss为0?
            if (!obj.to_boss) {
                if (this.isExistBuff(BuffTypeEnum.TO_BOSS))
                    return;
            }
            if (type == BuffTypeEnum.PHYSICAL_ATK) {
                this.phyAtk = BigNum.mul(this.phyAtk, value);
            }
            else if (type == BuffTypeEnum.MAGIC_ATK) {
                this.magAtk = BigNum.mul(this.magAtk, value);
            }
            else if (type == BuffTypeEnum.PHYSICAL_DEF) {
                this.phyDef = BigNum.mul(this.phyDef, value);
            }
            else if (type == BuffTypeEnum.MAGIC_DEF) {
                this.magDef = BigNum.mul(this.magDef, value);
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
            if (!this.buffInfo[type]) {
                this.buffInfo[type] = [];
            }
            if (type == BuffTypeEnum.POISONING) {
                this.buffInfo[type].push({ id: obj.id, duration: obj.duration, value: obj.value, magicAtk: role.magAtk });
            }
            else {
                this.buffInfo[type].push({ id: obj.id, duration: obj.duration, value: obj.value });
            }
        }
        else {
            fight.recordLog("没有buffID:" + buffID + "配置", fight.LOG_FIGHT_WARN);
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
        var arr = Object.keys(this.buffInfo);
        for (var i = 0; i < arr.length; i++) {
            var type = arr[i];
            var buffs = this.buffInfo[type];
            for (var j = 0; j < buffs.length; j++) {
                obj.buff.push(buffs[j].id);
            }
        }
    };
    p.updateProp = function (prop) {
        this.magAtk = prop.magAtk;
        this.magDef = prop.magDef;
        this.maxHP = prop.maxHP;
        this.phyAtk = prop.phyAtk;
        this.phyDef = prop.phyDef;
        this.skill = prop.skill || 0;
        if (!this._curHP) {
            this._curHP = this.maxHP;
        }
    };
    d(p, "curHP"
        ,function () {
            return this._curHP;
        }
        ,function (value) {
            if (this._curHP != value) {
                this._curHP = value;
                this._curHP = BigNum.clamp(this._curHP, 0, this.maxHP);
            }
        }
    );
    return FightRoleVO;
}());
egret.registerClass(FightRoleVO,'FightRoleVO');
//# sourceMappingURL=FightRoleVO.js.map