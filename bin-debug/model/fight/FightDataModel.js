/**
 * Created by hh on 2016/12/19.
 */
var fight;
(function (fight) {
    var dataModel;
    (function (dataModel) {
        var pveHeroArr = [];
        /**
         * PVE战斗英雄
         * @param obj
         */
        function parsePVEHeroArr(obj) {
            pveHeroArr = [];
            for (var i = 0; i < obj.length; i++) {
                if (!!obj[i]) {
                    pveHeroArr.push({ id: obj[i], side: 1, pos: i });
                }
            }
        }
        dataModel.parsePVEHeroArr = parsePVEHeroArr;
        /**
         * 得到我的pve出战英雄
         * @returns {{id: number, side: number, pos: number}[]|Array|any}
         */
        function getMyPVEHeroArr() {
            if (fight.TEST_SELF_HERO) {
                parsePVEHeroArr(fight.TEST_SELF_HERO);
            }
            return pveHeroArr;
        }
        dataModel.getMyPVEHeroArr = getMyPVEHeroArr;
    })(dataModel = fight.dataModel || (fight.dataModel = {}));
})(fight || (fight = {}));
//# sourceMappingURL=FightDataModel.js.map