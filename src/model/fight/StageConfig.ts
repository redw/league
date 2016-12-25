/**
 * 关卡配置
 * Created by hh on 16/11/26.
 */
class StageConfig {
    "monster_number": number[];
    "monster":string[];
    "id": number;
    "map":string;

    public static getMonster(config:StageConfig){
        let result:{id:number, pos:number, side:number}[] = [];
        const counts = config.monster_number.concat();
        let monsters = config.monster.concat();
        if (!!fight.TEST_OTHER_HERO) {
            let monsters = fight.TEST_OTHER_HERO.concat();
            for (let i = 0; i < monsters.length; i++) {
                if (monsters[i])
                     result.push({id:monsters[i], side:2, pos:i});
            }
        } else {
            for (let i = 0; i < counts.length; i++) {
                if (counts[i] > 0 && !!monsters[i]) {
                    if (counts[i] > monsters[i].length) {
                        counts[i] = monsters[i].length;
                    }
                    let tempArr = monsters[i].split(",");
                    let count = 0;
                    let posArr = [];
                    do {
                        let pos = i * 3 + Math.floor(Math.random() * 3);
                        if (posArr.indexOf(pos) < 0) {
                            let index = Math.floor(Math.random() * tempArr.length);
                            result.push({id:+tempArr[index], side:2, pos:pos});
                            tempArr.splice(index, 1);
                            count++;
                            posArr.push(pos);
                        }
                    } while (count < counts[i]);
                }
            }
        }
        return result;
    }
}
