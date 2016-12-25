/**
 * Created by hh on 2016/12/12.
 */
class RoleData {
    public id:number;            // 角色id
    public magicAtk:string;      // 魔法攻击力
    public magicDef:string;      // 魔法防御力
    public physicalAtk:string;   // 物理攻击力
    public physicalDef:string;   // 物理防御力
    protected _curHP:string;     // 当前血量
    public maxHP:string;         // 最大血量
    public config:RoleConfig;    // 角色配置数据

    public level:number;
    public starLevel:number;
    public strengthenLevel:number;

    public parse(obj:any, id:number) {
        this.id = obj.id || id;
        this.level = obj["lv"] || 0;
        this.starLevel = obj["star"] || 1;
        this.strengthenLevel = obj["enhanceLv"] || 0;
        let getPropFun = "";
        if (fight.isHero(this.id)) {
            this.config = Config.HeroData[this.id];
            getPropFun = "getHeroPropValue";
        } else {
            this.config = Config.EnemyData[this.id];
            getPropFun = "getMonsterPropValue";
        }
        this.maxHP = this[getPropFun](this.config.hp);
        this.physicalAtk = this[getPropFun](this.config.physical_atk);
        this.physicalDef = this[getPropFun](this.config.physical_def);
        this.magicAtk = this[getPropFun](this.config.magical_atk);
        this.magicDef =  this[getPropFun](this.config.magical_def);
        this._curHP = obj.hp || this.maxHP;
    }

    public copy(roleData:RoleData) {
        this.id = roleData.id;
        this.config = roleData.config;
        this.level = roleData.level;
        this.starLevel = roleData.starLevel;
        this.strengthenLevel = roleData.strengthenLevel;
        let getPropFun:string = "";
        if (this.isHero) {
            getPropFun = "getHeroPropValue";
        } else {
            getPropFun = "getMonsterPropValue";
        }
        this.maxHP = this[getPropFun](this.config.hp);
        this._curHP = roleData.curHP;
        this.physicalAtk = this[getPropFun](this.config.physical_atk);
        this.physicalDef = this[getPropFun](this.config.physical_def);
        this.magicAtk = this[getPropFun](this.config.magical_atk);
        this.magicDef =  this[getPropFun](this.config.magical_def);
    }

    private getMonsterPropValue(value:number){
        // TODO 怪物基础属性的公式
        return value + "";
    }

    private getHeroPropValue(value:number)
    {
        // let paraA:number = Config.BaseData[4]["value"];
        // let paraB:number = Config.BaseData[5]["value"];
        // let paraC:number = Config.BaseData[6]["value"];
        // let heroLv:number = this.level;
        // let heroEnhanceLv:number = this.strengthenLevel;
        // let result = (value + paraC)*(Math.pow(paraA,heroLv-1))*(Math.pow(paraB,heroEnhanceLv));
        // return result + "";
        return value + "";
    }

    /**
     * 技能是否激活
     */
    public isSkillActive(skillId:number|string){
        // TODO 技能是否激活
        return true;
    }

    public get curHP(){
        return this._curHP;
    }

    public set curHP(value:string) {
        this._curHP = value;
        this._curHP = BigNum.clamp(this._curHP, 0, this.maxHP);
    }

    /**
     * 是否是英雄
     * @returns {boolean}
     */
    public get isHero(){
        return this.config.id < 200;
    }
}