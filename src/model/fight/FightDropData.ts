/**
 * Created by hh on 2016/12/19.
 */
class FightDropData extends egret.HashObject {
    private dropData:any;

    public constructor(){
        super();
        this.dropData = {};
    }

    public parse(value:any){
        this.dropData = {};
        let keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
            this.dropData[keys[i]] = value[keys[i]];
        }
    }

    public canUseProp(id:number){
        let result = false;
        let time:number = this.dropData[id];
        if (!time) {
            result = true;
        }
        let config:FightDropConfig = Config.DropData[id];
        result =  time + config.cd < egret.getTimer();
        return result;
    }

    public static generateDrop(){
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
                let id = 0;
                for (let j = 0; j < keys.length; j++) {
                    let config:FightDropConfig = Config.DropData[keys[j]];
                    if (randomValue > currentValue) {
                        id = config.id;
                        currentValue += config.chance;
                    } else {
                        break;
                    }
                }
                if (id >= 0 && result.indexOf(id) < 0) {
                    result.push(id);
                }
            }
        }
        return result;
    }
}