/**
 * Created by Administrator on 2016/12/13.
 */
class HeroModel extends ModelDict{
    private pveHeroArr = [];
    private tempHeroArr = [];
    constructor(){
        super(RoleData, "ROLE_DATA");
    }

    /**
     * 得到某个英雄
     * @param id
     * @returns {RoleData}
     */
    public getHeroData(id:string|number) {
        return <RoleData>this.getValue(id);
    }

    /**
     * 得到玩家英雄id列表
     * @returns {Array}
     */
    public getHeroIds():number[]{
        var result = [];
        var keys = this.getKeys();
        for (var i = 0; i < keys.length; i++) {
            result.push(keys[i]);
        }
        return result;
    }

    /**
     * 解析英雄列表
     * @param obj
     */
    public parseHeroList(obj:any){
        this.parse(obj);
    }

    /**
     * 添加PVE战斗英雄
     * @param obj
     */
    public initPVEBattleHero(obj:any){
        this.pveHeroArr = [];
        for (let i = 0; i < obj.myPos.length; i++) {
            if (!!obj.myPos[i]) {
                this.pveHeroArr.push({id:obj.myPos[i], side:1, pos:i});
            }
        }
    }

    public changePVEFormation(value:number[]){
        this.tempHeroArr = [];
        for (let i = 0; i < value.length; i++) {
            if (!!value[i]) {
                this.tempHeroArr.push({id:value[i], side:1, pos:i});
            }
        }
    }

    /**
     * 得到当前PVE阵型
     * @returns {number[]|any[]}
     */
    public getPVEFormation(){
        return (this.tempHeroArr && this.tempHeroArr.length > 0) ? this.tempHeroArr.concat() : this.pveHeroArr.concat();
    }

    public ensurePVEFormation(){
        if (this.tempHeroArr && this.tempHeroArr.length > 0) {
            this.pveHeroArr = this.tempHeroArr;
            this.tempHeroArr = [];
        }
    }

    /**
     * 得到PVE战斗英雄
     */
    public getPVEBattleHero(){
        return this.pveHeroArr.concat();
    }
}