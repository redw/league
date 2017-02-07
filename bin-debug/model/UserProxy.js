/**
 * 用户数据
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
var UserProxy = (function (_super) {
    __extends(UserProxy, _super);
    function UserProxy() {
        _super.apply(this, arguments);
        this.curArea = 1;
        this.battle_pos = [];
        this.server_time = 0;
        this.heroData = new HeroModel();
        this.fightData = new FightDataModel();
    }
    var d = __define,c=UserProxy,p=c.prototype;
    d(UserProxy, "inst"
        ,function () {
            if (UserProxy._instance == null) {
                UserProxy._instance = new UserProxy();
            }
            return UserProxy._instance;
        }
    );
    UserProxy._instance = null;
    return UserProxy;
}(egret.HashObject));
egret.registerClass(UserProxy,'UserProxy');
//# sourceMappingURL=UserProxy.js.map