/**
 * 怪物角色值对象
 * Created by hh on 2017/1/4.
 */
class MonsterVO{
    public level:number;                // 关卡id
    private _id:number;
    public config:RoleConfig;
    public constructor(value?:any){
        if (value)
            this.parse(value);
    }

    public get id(){
        return this._id;
    }

    public set id(value:number) {
        this._id = value;
        this.config = Config.EnemyData[value];
    }

    public parse(value:any) {
        if (value) {
            this.id = value.id;
            this.level = value.level;
        }
    }

    public get phyAtk(){
        return this.getValue(this.config.physical_atk);
    }

    public get phyDef(){
        return this.getValue(this.config.physical_def);
    }

    public get magAtk(){
        return this.getValue(this.config.magical_atk);
    }

    public get magDef() {
        return this.getValue(this.config.magical_def);
    }

    public get maxHP(){
        return this.getValue(this.config.hp);
    }

    private getValue(value:number){
        let ratio = +Config.BaseData[59].value;
        let level = this.level;
        return value * Math.pow(ratio, level) + "";
    }
}