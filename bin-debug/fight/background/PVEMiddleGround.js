/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 中景
 */
var PVEMiddleGround = (function (_super) {
    __extends(PVEMiddleGround, _super);
    function PVEMiddleGround(hasTween) {
        if (hasTween === void 0) { hasTween = true; }
        _super.call(this, hasTween, fight.LOAD_PRIORITY_MAP_MIDDLE);
        egret.startTick(this.checkResHeight, this);
    }
    var d = __define,c=PVEMiddleGround,p=c.prototype;
    p.checkResHeight = function () {
        if (this.background && this.background.height > 0) {
            this.background.y = (fight.HEIGHT - this.background.height) * 0.5;
        }
        if (this.freeBackground && this.freeBackground.height > 0) {
            this.freeBackground.y = (fight.HEIGHT - this.freeBackground.height) * 0.5;
        }
        return false;
    };
    p.getSceneResourcePath = function (level) {
        var stageConfig = Config.StageCommonData[Math.ceil(level / fight.MAP_SWITCH_SIZE)];
        var map = stageConfig.map;
        return map + "_2_png";
    };
    d(p, "source",undefined
        ,function (value) {
            var path = value + "_2_png";
            this.background.source = path;
        }
    );
    // 缓动
    p.move = function (off) {
        if (off === void 0) { off = 0; }
        var tween = egret.Tween.get(this.background);
        tween.to({ x: (this.background.x + off) }, fight.MIDDLE_GROUND_MOVE_TIME).
            call(this.moveComplete, this, [this.background]);
        tween = egret.Tween.get(this.freeBackground);
        tween.to({ x: (this.freeBackground.x + off) }, fight.MIDDLE_GROUND_MOVE_TIME).
            call(this.moveComplete, this, [this.freeBackground]);
    };
    return PVEMiddleGround;
}(PVEBackGround));
egret.registerClass(PVEMiddleGround,'PVEMiddleGround');
//# sourceMappingURL=PVEMiddleGround.js.map