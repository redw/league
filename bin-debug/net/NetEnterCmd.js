/**
 * 进入游戏返回
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
var NetEnterCmd = (function (_super) {
    __extends(NetEnterCmd, _super);
    function NetEnterCmd() {
        _super.apply(this, arguments);
    }
    var d = __define,c=NetEnterCmd,p=c.prototype;
    p.execute = function () {
        Config.init();
        UserProxy.inst.heroData.parse(this.data["heroList"]);
        UserProxy.inst.fightData.parse(this.data["battleObj"]);
    };
    p.init = function () {
    };
    return NetEnterCmd;
}(BaseCmd));
egret.registerClass(NetEnterCmd,'NetEnterCmd');
//# sourceMappingURL=NetEnterCmd.js.map