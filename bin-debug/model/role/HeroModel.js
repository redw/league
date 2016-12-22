/**
 * Created by Administrator on 2016/12/13.
 */
var HeroModel = (function (_super) {
    __extends(HeroModel, _super);
    function HeroModel() {
        _super.call(this, RoleData, "ROLE_DATA");
        this.pveHeroArr = [];
        this.tempHeroArr = [];
    }
    var d = __define,c=HeroModel,p=c.prototype;
    /**
     * 得到某个英雄
     * @param id
     * @returns {RoleData}
     */
    p.getHeroData = function (id) {
        return this.getValue(id);
    };
    /**
     * 得到玩家英雄id列表
     * @returns {Array}
     */
    p.getHeroIds = function () {
        var result = [];
        var keys = this.getKeys();
        for (var i = 0; i < keys.length; i++) {
            result.push(keys[i]);
        }
        return result;
    };
    /**
     * 解析英雄列表
     * @param obj
     */
    p.parseHeroList = function (obj) {
        this.parse(obj);
    };
    /**
     * 添加PVE战斗英雄
     * @param obj
     */
    p.initPVEBattleHero = function (obj) {
        this.pveHeroArr = [];
        for (var i = 0; i < obj.myPos.length; i++) {
            if (!!obj.myPos[i]) {
                this.pveHeroArr.push({ id: obj.myPos[i], side: 1, pos: i });
            }
        }
    };
    p.changePVEFormation = function (value) {
        this.tempHeroArr = [];
        for (var i = 0; i < value.length; i++) {
            if (!!value[i]) {
                this.tempHeroArr.push({ id: value[i], side: 1, pos: i });
            }
        }
    };
    /**
     * 得到当前PVE阵型
     * @returns {number[]|any[]}
     */
    p.getPVEFormation = function () {
        return (this.tempHeroArr && this.tempHeroArr.length > 0) ? this.tempHeroArr.concat() : this.pveHeroArr.concat();
    };
    p.ensurePVEFormation = function () {
        if (this.tempHeroArr && this.tempHeroArr.length > 0) {
            this.pveHeroArr = this.tempHeroArr;
            this.tempHeroArr = [];
        }
    };
    /**
     * 得到PVE战斗英雄
     */
    p.getPVEBattleHero = function () {
        return this.pveHeroArr.concat();
    };
    return HeroModel;
}(ModelDict));
egret.registerClass(HeroModel,'HeroModel');
//# sourceMappingURL=HeroModel.js.map