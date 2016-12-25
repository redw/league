/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 中景
 */
var PVEMiddleGround = (function (_super) {
    __extends(PVEMiddleGround, _super);
    function PVEMiddleGround() {
        _super.call(this);
    }
    var d = __define,c=PVEMiddleGround,p=c.prototype;
    p.getSceneResourcePath = function (level) {
        var sceneIndex = Config.StageData[level].map;
        return "resource/assets/scene/" + sceneIndex + "_" + 2 + ".png";
    };
    // 缓动
    p.move = function (off) {
        if (off === void 0) { off = 0; }
        var tween = egret.Tween.get(this.background);
        tween.to({ x: (this.background.x + off) }, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).
            call(this.moveComplete, this, [this.background]);
        tween = egret.Tween.get(this.freeBackground);
        tween.to({ x: (this.freeBackground.x + off) }, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).
            call(this.moveComplete, this, [this.freeBackground]);
    };
    return PVEMiddleGround;
}(PVEBackGround));
egret.registerClass(PVEMiddleGround,'PVEMiddleGround');
//# sourceMappingURL=PVEMiddleGround.js.map