/**
 * Created by hh on 2016/12/19.
 */
module fight.dataModel{
    let pveHeroArr:{id:number,side:number,pos:number}[] = [];

    /**
     * PVE战斗英雄
     * @param obj
     */
    export function parsePVEHeroArr(obj:any){
        pveHeroArr = [];
        for (let i = 0; i < obj.length; i++) {
            if (!!obj[i]) {
                pveHeroArr.push({id:obj[i], side:1, pos:i});
            }
        }
    }

    /**
     * 得到我的pve出战英雄
     * @returns {{id: number, side: number, pos: number}[]|Array|any}
     */
    export function getMyPVEHeroArr(){
        if (fight.TEST_SELF_HERO) {
            parsePVEHeroArr(fight.TEST_SELF_HERO);
        }
        return pveHeroArr;
    }
}