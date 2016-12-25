/**
 * Created by hh on 2016/12/21.
 */
var PVEProspect = (function (_super) {
    __extends(PVEProspect, _super);
    function PVEProspect() {
        _super.call(this);
    }
    var d = __define,c=PVEProspect,p=c.prototype;
    p.getSceneResourcePath = function (level) {
        var sceneIndex = Config.StageData[level].map;
        return "resource/assets/scene/" + sceneIndex + "_" + 3 + ".png";
    };
    // 缓动
    p.move = function (off) {
        if (off === void 0) { off = 0; }
        var tween = egret.Tween.get(this.background);
        tween.to({ x: (this.background.x + off) }, fight.BACK_GROUND_MOVE_TIME, egret.Ease[fight.BACK_GROUND_MOVE_EASE]).
            call(this.moveComplete, this, [this.background]);
        tween = egret.Tween.get(this.freeBackground);
        tween.to({ x: (this.freeBackground.x + off) }, fight.BACK_GROUND_MOVE_TIME, egret.Ease[fight.BACK_GROUND_MOVE_EASE]).
            call(this.moveComplete, this, [this.freeBackground]);
    };
    return PVEProspect;
}(PVEBackGround));
egret.registerClass(PVEProspect,'PVEProspect');
//# sourceMappingURL=PVEProspect.js.map