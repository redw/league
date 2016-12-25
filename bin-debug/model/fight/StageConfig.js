/**
 * 关卡配置
 * Created by hh on 16/11/26.
 */
var StageConfig = (function () {
    function StageConfig() {
    }
    var d = __define,c=StageConfig,p=c.prototype;
    StageConfig.getMonster = function (config) {
        var result = [];
        var counts = config.monster_number.concat();
        var monsters = config.monster.concat();
        if (!!fight.TEST_OTHER_HERO) {
            var monsters_1 = fight.TEST_OTHER_HERO.concat();
            for (var i = 0; i < monsters_1.length; i++) {
                if (monsters_1[i])
                    result.push({ id: monsters_1[i], side: 2, pos: i });
            }
        }
        else {
            for (var i = 0; i < counts.length; i++) {
                if (counts[i] > 0 && !!monsters[i]) {
                    if (counts[i] > monsters[i].length) {
                        counts[i] = monsters[i].length;
                    }
                    var tempArr = monsters[i].split(",");
                    var count = 0;
                    var posArr = [];
                    do {
                        var pos = i * 3 + Math.floor(Math.random() * 3);
                        if (posArr.indexOf(pos) < 0) {
                            var index = Math.floor(Math.random() * tempArr.length);
                            result.push({ id: +tempArr[index], side: 2, pos: pos });
                            tempArr.splice(index, 1);
                            count++;
                            posArr.push(pos);
                        }
                    } while (count < counts[i]);
                }
            }
        }
        return result;
    };
    return StageConfig;
}());
egret.registerClass(StageConfig,'StageConfig');
//# sourceMappingURL=StageConfig.js.map