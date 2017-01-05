/**
 * Created by hh on 2016/12/19.
 */
class FightDataModel extends egret.HashObject {
    private pveHeroArr:{id:number,side:number,pos:number}[] = [];
    private nextSyncTime:number = 0;
    private dropTimeMap:any;
    private tempHeroArr:any;

    public parse(value:any){
        if (value.myPos) {
            this.parsePVEHeroArr(value.myPos);
        }
        if (value.nextSyncTime) {
            this.nextSyncTime = value.nextSyncTime;
        }
        if (value.itemList) {
            this.parseDrop(value.itemList);
        }
    }

    /**
     * PVE战斗英雄
     * @param obj
     */
    public parsePVEHeroArr(obj:any){
        this.pveHeroArr = [];
        for (let i = 0; i < obj.length; i++) {
            if (!!obj[i]) {
                this.pveHeroArr.push({id:obj[i], side:1, pos:i});
            }
        }
    }

    /**
     * 掉落数据
     * @param obj
     */
    public parseDrop(obj:any) {
        this.dropTimeMap = {};
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            this.dropTimeMap[keys[i]] = obj[keys[i]];
        }
    }

    /**
     * 改变PVE阵形(不会立马产生效果)
     * @param value
     */
    public changePVEFormation(value:number[]){
        this.tempHeroArr = [];
        for (let i = 0; i < value.length; i++) {
            if (!!value[i]) {
                this.tempHeroArr.push({id:value[i], side:1, pos:i});
            }
        }
    }

    /**
     * 同步PVE阵型
     */
    public syncPVEFormation(){
        if (this.tempHeroArr && this.tempHeroArr.length > 0) {
            let heroIds = this.getPVEFormationIds(); 
            Http.inst.send(CmdID.FIGHT_FORMATION, {
                type: 1,
                posAry: JSON.stringify(heroIds)
            });
            // this.tempHeroArr = [];
            return true;
        }
        return false;
    }

    /**
     * 得到当前PVE阵型
     * @returns {number[]|any[]}
     */
    public getPVEFormation(){
        return (this.tempHeroArr && this.tempHeroArr.length > 0) ? this.tempHeroArr.concat() : this.pveHeroArr.concat();
    }

    /**
     * 得到当前PVE阵型
     * @returns {number[]|any[]}
     */
    private getPVEFormationIds(){
        let result = [];
        for (let i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            result[i] = 0;
        }
        for (let i = 0; i < this.tempHeroArr.length; i++) {
            let id = this.tempHeroArr[i].id;
            let pos = this.tempHeroArr[i].pos;
            result[pos] = id;
        }
        return result;
    }

    /**
     * 替换PVE阵型
     */
    public ensurePVEFormation(){
        if (this.tempHeroArr && this.tempHeroArr.length > 0) {
            this.pveHeroArr = this.tempHeroArr.concat();
            this.tempHeroArr = [];
            EventManager.inst.dispatch(ContextEvent.PVE_CHANGE_FORMATION_RES);
        }
    }

    /**
     * 得到PVE战斗英雄
     */
    public getPVEBattleHero(){
        let heroArr = [];
        if (fight.TEST_SELF_HERO) {
            for (let i = 0; i < fight.TEST_SELF_HERO.length; i++) {
                if (!!fight.TEST_SELF_HERO[i]) {
                    heroArr.push({id:fight.TEST_SELF_HERO[i], side:1, pos:i});
                }
            }
        } else {
            heroArr = this.pveHeroArr.concat();
        }
        return heroArr;
    }

    /**
     * 生成掉落
     */
    public generateDrop(){
        return [];
        let result = [];
        let keys = Object.keys(Config.DropData);
        let totalValue = 0;
        for (let i = 0; i < keys.length; i++) {
            totalValue +=  Config.DropData[keys[i]].chance;
        }
        for (let i = 0; i < 2; i++) {
            let randomValue = Math.random();
            if (randomValue < totalValue) {
                let currentValue = 0;
                let id = -1;
                for (let j = 0; j < keys.length; j++) {
                    let config:FightDropConfig = Config.DropData[keys[j]];
                    if (randomValue > currentValue) {
                        id = +keys[j];
                        currentValue += config.chance;
                    } else {
                        break;
                    }
                }
                if (id >= 0 && result.indexOf(id) < 0) {
                    let time = this.dropTimeMap[id] || 0;
                    let cd = Config.DropData[id].cd * 60;
                    let endTime = egret.getTimer() + UserProxy.inst.server_time;
                    if (endTime - cd >= time) {
                        result.push(id);
                    }
                }
            }
        }
        return result;
    }
}