/**
 * Created by hh on 2016/12/19.
 */
var FightDataModel = (function (_super) {
    __extends(FightDataModel, _super);
    function FightDataModel() {
        _super.apply(this, arguments);
        this.pveHeroArr = [];
        this.nextSyncTime = 0;
        this.dropTimeMap = {};
        this.tempLoadMonster = [];
    }
    var d = __define,c=FightDataModel,p=c.prototype;
    p.parse = function (value) {
        if (value.myPos) {
            this.parsePVEHeroArr(value.myPos);
        }
        if (value.nextSyncTime) {
            this.nextSyncTime = value.nextSyncTime;
        }
        if (value.itemList) {
            this.parseDrop(value.itemList);
        }
    };
    /**
     * PVE战斗英雄
     * @param obj
     */
    p.parsePVEHeroArr = function (obj) {
        this.pveHeroArr = [];
        for (var i = 0; i < obj.length; i++) {
            if (!!obj[i]) {
                this.pveHeroArr.push({ id: obj[i], side: 1, pos: i });
            }
        }
    };
    /**
     * 掉落数据
     * @param obj
     */
    p.parseDrop = function (obj) {
        this.dropTimeMap = {};
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            this.dropTimeMap[keys[i]] = obj[keys[i]];
        }
    };
    /**
     * 改变PVE阵形(不会立马产生效果)
     * @param value
     */
    p.changePVEFormation = function (value) {
        this.tempHeroArr = [];
        for (var i = 0; i < value.length; i++) {
            if (!!value[i]) {
                this.tempHeroArr.push({ id: value[i], side: 1, pos: i });
            }
        }
    };
    /**
     * 同步PVE阵型
     */
    p.syncPVEFormation = function () {
        if (this.tempHeroArr && this.tempHeroArr.length > 0) {
            var heroIds = this.getPVEFormationIds();
            Http.inst.send(CmdID.FIGHT_FORMATION, {
                type: 1,
                posAry: JSON.stringify(heroIds)
            });
            return true;
        }
        return false;
    };
    /**
     * 得到当前PVE阵型
     * @returns {number[]|any[]}
     */
    p.getPVEFormation = function () {
        return (this.tempHeroArr && this.tempHeroArr.length > 0) ? this.tempHeroArr.concat() : this.pveHeroArr.concat();
    };
    /**
     * 得到当前阵型的id数组
     * @returns {U[]}
     */
    p.getPVEIds = function () {
        var arr = this.getPVEFormation();
        return arr.map(function (value) { return value.id; });
    };
    /**
     * 得到监时阵型id数组
     * @returns {number[]|any[]}
     */
    p.getPVEFormationIds = function () {
        var result = [];
        for (var i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            result[i] = 0;
        }
        for (var i = 0; i < this.tempHeroArr.length; i++) {
            var id = this.tempHeroArr[i].id;
            var pos = this.tempHeroArr[i].pos;
            result[pos] = id;
        }
        return result;
    };
    /**
     * 替换PVE阵型
     */
    p.ensurePVEFormation = function () {
        if (this.tempHeroArr && this.tempHeroArr.length > 0) {
            this.pveHeroArr = this.tempHeroArr.concat();
            this.tempHeroArr = [];
            EventManager.inst.dispatch(ContextEvent.PVE_CHANGE_FORMATION_RES);
        }
    };
    /**
     * 得到PVE战斗英雄
     */
    p.getPVEBattleHero = function () {
        var heroArr = [];
        if (fight.TEST_SELF_HERO) {
            for (var i = 0; i < fight.TEST_SELF_HERO.length; i++) {
                if (!!fight.TEST_SELF_HERO[i]) {
                    heroArr.push({ id: fight.TEST_SELF_HERO[i], side: 1, pos: i });
                }
            }
        }
        else {
            heroArr = this.pveHeroArr.concat();
        }
        return heroArr;
    };
    /**
     * 生成掉落
     */
    p.generateDrop = function () {
        var result = [];
        return [4, 5];
        var keys = Object.keys(Config.DropData);
        var totalValue = 0;
        for (var i = 0; i < keys.length; i++) {
            totalValue += Config.DropData[keys[i]].chance;
        }
        for (var i = 0; i < 2; i++) {
            var randomValue = Math.random();
            if (randomValue < totalValue) {
                var currentValue = 0;
                var id = -1;
                for (var j = 0; j < keys.length; j++) {
                    var config = Config.DropData[keys[j]];
                    if (randomValue > currentValue) {
                        id = +keys[j];
                        currentValue += config.chance;
                    }
                    else {
                        break;
                    }
                }
                if (id >= 0 && result.indexOf(id) < 0) {
                    var time = this.dropTimeMap[id] || 0;
                    var cd = Config.DropData[id].cd * 60;
                    var endTime = egret.getTimer() + UserProxy.inst.server_time;
                    if (endTime - cd >= time) {
                        result.push(id);
                    }
                }
            }
        }
        return result;
    };
    p.getMonster = function (level, preload) {
        if (preload === void 0) { preload = false; }
        if (preload) {
            this.tempLoadMonster[level] = this.generateMonster(level);
        }
        else {
            if (this.tempLoadMonster[level]) {
                return this.tempLoadMonster[level].concat();
                delete this.tempLoadMonster[level];
            }
            else {
                return this.generateMonster(level);
            }
        }
    };
    p.generateMonster = function (level) {
        var result = [];
        // TODO 测试
        if (fight.TEST_OTHER_HERO) {
            var monsters_1 = fight.TEST_OTHER_HERO.concat();
            for (var i = 0; i < monsters_1.length; i++) {
                if (!!monsters_1[i] && +monsters_1[i])
                    result.push({ id: monsters_1[i], side: FightSideEnum.RIGHT_SIDE, pos: i });
            }
            return result;
        }
        var config = Config.StageData[level];
        var monsters = config.monster.concat();
        // 判断是否是boss关
        if (config.id % 10 == 0) {
            var monsters_2 = config.monster.concat();
            for (var i = 0; i < monsters_2.length; i++) {
                if (!!monsters_2[i] && +monsters_2[i]) {
                    result.push({ id: +monsters_2[i], side: FightSideEnum.RIGHT_SIDE, pos: i });
                }
            }
        }
        else {
            var counts = config.monster_number.concat();
            for (var i = 0; i < counts.length; i++) {
                if (counts[i] > 0 && monsters[i]) {
                    if (counts[i] > monsters[i].length) {
                        counts[i] = monsters[i].length;
                    }
                    var tempArr = monsters[i].split(",");
                    var count = 0;
                    var posArr = [];
                    do {
                        var pos = counts[i] == 1 ? 1 : i * 3 + Math.floor(Math.random() * 3);
                        if (posArr.indexOf(pos) < 0) {
                            var index = Math.floor(Math.random() * tempArr.length);
                            if (!!tempArr[index] && +tempArr[index]) {
                                result.push({ id: +tempArr[index], side: FightSideEnum.RIGHT_SIDE, pos: pos });
                                count++;
                                posArr.push(pos);
                            }
                        }
                    } while (count < counts[i]);
                }
            }
        }
        return result;
    };
    return FightDataModel;
}(egret.HashObject));
egret.registerClass(FightDataModel,'FightDataModel');
//# sourceMappingURL=FightDataModel.js.map