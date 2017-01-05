/**
 * Created by Administrator on 2016/12/13.
 */
class HeroModel extends ModelDict{
    private pveHeroArr = [];
    private tempHeroArr = [];
    constructor(){
        super(HeroVO, "ROLE_DATA");
    }

    /**
     * 得到某个英雄
     * @param id
     * @returns {RoleData}
     */
    public getHeroData(id:string|number) {
        return <HeroVO>this.getValue(id);
    }

    /**
     * 得到玩家英雄id列表
     * @returns {Array}
     */
    public getHeroIds():number[]{
        let result = [];
        let keys = this.getKeys();
        for (let i = 0; i < keys.length; i++) {
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
     * 刷新英雄属性
     * @param id
     */
    public refresh(id:number=0) {
        // if (id > 0) {
        //     this.getHeroData(id).refresh();
        // } else {
        //     let ids = this.getHeroIds();
        //     for (let i = 0; i < ids.length; i++) {
        //         this.getHeroData(ids[i]).refresh();
        //     }
        // }
    }
}