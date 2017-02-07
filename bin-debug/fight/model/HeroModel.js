/**
 * Created by Administrator on 2016/12/13.
 */
var HeroModel = (function (_super) {
    __extends(HeroModel, _super);
    function HeroModel() {
        _super.call(this, HeroVO, "ROLE_DATA");
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
     * 刷新英雄属性
     * @param id
     */
    p.refresh = function (id) {
        if (id === void 0) { id = 0; }
        // if (id > 0) {
        //     this.getHeroData(id).refresh();
        // } else {
        //     let ids = this.getHeroIds();
        //     for (let i = 0; i < ids.length; i++) {
        //         this.getHeroData(ids[i]).refresh();
        //     }
        // }
    };
    return HeroModel;
}(ModelDict));
egret.registerClass(HeroModel,'HeroModel');
//# sourceMappingURL=HeroModel.js.map