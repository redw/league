/**
 * Created by hh on 2016/12/19.
 */
class FightDataModel extends egret.HashObject {
    private pveHeroArr:{id:number,side:number,pos:number}[] = [];
    private nextSyncTime:number = 0;
    private dropTimeMap:any = {};
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
     * 得到当前阵型的id数组
     * @returns {U[]}
     */
    public getPVEIds(){
        let arr = this.getPVEFormation();
        return arr.map((value)=>{ return value.id});
    }

    /**
     * 得到监时阵型id数组
     * @returns {number[]|any[]}
     */
    public getPVEFormationIds(){
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
        let result = [];
        return [4, 5];
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

    private tempLoadMonster = [];
    public getMonster(level:number, preload:boolean=false){
        if (preload) {
            this.tempLoadMonster[level] = this.generateMonster(level);
        } else {
            if (this.tempLoadMonster[level]) {
                return this.tempLoadMonster[level].concat();
                delete this.tempLoadMonster[level];
            } else {
                return this.generateMonster(level);
            }
        }
    }

    private generateMonster(level:number){
        let result:{id:number, pos:number, side:number}[] = [];
        // TODO 测试
        if (fight.TEST_OTHER_HERO) {
            let monsters = fight.TEST_OTHER_HERO.concat();
            for (let i = 0; i < monsters.length; i++) {
                if (!!monsters[i] && +monsters[i])
                    result.push({id:monsters[i], side:FightSideEnum.RIGHT_SIDE, pos:i});
            }
            return result;
        }

        let config = Config.StageData[level];
        let monsters = config.monster.concat();
        // 判断是否是boss关
        if (config.id % 10 == 0) {
            let monsters = config.monster.concat();
            for (let i = 0; i < monsters.length; i++) {
                if (!!monsters[i] && +monsters[i]) {
                    result.push({id:+monsters[i], side:FightSideEnum.RIGHT_SIDE, pos:i});
                }
            }
        } else {
            const counts = config.monster_number.concat();
            for (let i = 0; i < counts.length; i++) {
                if (counts[i] > 0 && monsters[i]) {
                    if (counts[i] > monsters[i].length) {
                        counts[i] = monsters[i].length;
                    }
                    let tempArr = monsters[i].split(",");
                    let count = 0;
                    let posArr = [];
                    do {
                        let pos = counts[i] == 1 ? 1 : i * 3 + Math.floor(Math.random() * 3);
                        if (posArr.indexOf(pos) < 0) {
                            let index = Math.floor(Math.random() * tempArr.length);
                            if (!!tempArr[index] && +tempArr[index]){
                                result.push({id:+tempArr[index], side:FightSideEnum.RIGHT_SIDE, pos:pos});
                                count++;
                                posArr.push(pos);
                            }
                        }
                    } while (count < counts[i]);
                }
            }
        }
        return result;
    }
}