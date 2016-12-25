/**
 * Created by hh on 2016/12/12.
 */
var RoleData = (function () {
    function RoleData() {
    }
    var d = __define,c=RoleData,p=c.prototype;
    p.parse = function (obj, id) {
        this.id = obj.id || id;
        this.level = obj["lv"] || 0;
        this.starLevel = obj["star"] || 1;
        this.strengthenLevel = obj["enhanceLv"] || 0;
        var getPropFun = "";
        if (fight.isHero(this.id)) {
            this.config = Config.HeroData[this.id];
            getPropFun = "getHeroPropValue";
        }
        else {
            this.config = Config.EnemyData[this.id];
            getPropFun = "getMonsterPropValue";
        }
        this.maxHP = this[getPropFun](this.config.hp);
        this.physicalAtk = this[getPropFun](this.config.physical_atk);
        this.physicalDef = this[getPropFun](this.config.physical_def);
        this.magicAtk = this[getPropFun](this.config.magical_atk);
        this.magicDef = this[getPropFun](this.config.magical_def);
        this._curHP = obj.hp || this.maxHP;
    };
    p.copy = function (roleData) {
        this.id = roleData.id;
        this.config = roleData.config;
        this.level = roleData.level;
        this.starLevel = roleData.starLevel;
        this.strengthenLevel = roleData.strengthenLevel;
        var getPropFun = "";
        if (this.isHero) {
            getPropFun = "getHeroPropValue";
        }
        else {
            getPropFun = "getMonsterPropValue";
        }
        this.maxHP = this[getPropFun](this.config.hp);
        this._curHP = roleData.curHP;
        this.physicalAtk = this[getPropFun](this.config.physical_atk);
        this.physicalDef = this[getPropFun](this.config.physical_def);
        this.magicAtk = this[getPropFun](this.config.magical_atk);
        this.magicDef = this[getPropFun](this.config.magical_def);
    };
    p.getMonsterPropValue = function (value) {
        // TODO 怪物基础属性的公式
        return value + "";
    };
    p.getHeroPropValue = function (value) {
        // let paraA:number = Config.BaseData[4]["value"];
        // let paraB:number = Config.BaseData[5]["value"];
        // let paraC:number = Config.BaseData[6]["value"];
        // let heroLv:number = this.level;
        // let heroEnhanceLv:number = this.strengthenLevel;
        // let result = (value + paraC)*(Math.pow(paraA,heroLv-1))*(Math.pow(paraB,heroEnhanceLv));
        // return result + "";
        return value + "";
    };
    /**
     * 技能是否激活
     */
    p.isSkillActive = function (skillId) {
        // TODO 技能是否激活
        return true;
    };
    d(p, "curHP"
        ,function () {
            return this._curHP;
        }
        ,function (value) {
            this._curHP = value;
            this._curHP = BigNum.clamp(this._curHP, 0, this.maxHP);
        }
    );
    d(p, "isHero"
        /**
         * 是否是英雄
         * @returns {boolean}
         */
        ,function () {
            return this.config.id < 200;
        }
    );
    return RoleData;
}());
egret.registerClass(RoleData,'RoleData');
//# sourceMappingURL=RoleData.js.map