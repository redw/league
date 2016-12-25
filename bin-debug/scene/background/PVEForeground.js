/**
 * Created by hh on 2016/12/21.
 */
var PVEForeground = (function (_super) {
    __extends(PVEForeground, _super);
    function PVEForeground() {
        _super.call(this);
        egret.startTick(this.checkResHeight, this);
    }
    var d = __define,c=PVEForeground,p=c.prototype;
    p.checkResHeight = function () {
        if (this.background.height > 0) {
            this.background.y = PVEBackGround.HEIGHT - this.background.height;
        }
        if (this.freeBackground.height > 0) {
            this.freeBackground.y = PVEBackGround.HEIGHT - this.freeBackground.height;
        }
        return false;
    };
    p.getSceneResourcePath = function (level) {
        var sceneIndex = Config.StageData[level].map;
        return "resource/assets/scene/" + sceneIndex + "_" + 1 + ".png";
    };
    // 缓动
    p.move = function (off) {
        if (off === void 0) { off = 0; }
        var tween = egret.Tween.get(this.background);
        tween.to({ x: (this.background.x + off) }, fight.FORE_GROUND_MOVE_TIME, egret.Ease[fight.FORE_GROUND_MOVE_EASE]).
            call(this.moveComplete, this, [this.background]);
        tween = egret.Tween.get(this.freeBackground);
        tween.to({ x: (this.freeBackground.x + off) }, fight.FORE_GROUND_MOVE_TIME, egret.Ease[fight.FORE_GROUND_MOVE_EASE]).
            call(this.moveComplete, this, [this.freeBackground]);
    };
    return PVEForeground;
}(PVEBackGround));
egret.registerClass(PVEForeground,'PVEForeground');
//# sourceMappingURL=PVEForeground.js.map