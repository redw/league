/**
 * Created by Administrator on 2017/1/14.
 */
// 如来神掌特效
var BuddhaPalmEff = (function (_super) {
    __extends(BuddhaPalmEff, _super);
    function BuddhaPalmEff() {
        _super.call(this);
        this.mc = FightRole.createMovieClip("126_attack_source");
        this.addChild(this.mc);
        this.mc.addEventListener(egret.MovieClipEvent.COMPLETE, this.onIdle, this);
        this.mc.gotoAndPlay("up", 1);
    }
    var d = __define,c=BuddhaPalmEff,p=c.prototype;
    p.onIdle = function () {
        this.mc.removeEventListener(egret.MovieClipEvent.COMPLETE, this.onIdle, this);
        this.mc.gotoAndPlay("idle", -1);
    };
    p.free = function () {
        this.mc.gotoAndPlay("down", 1);
        this.mc.addEventListener(egret.MovieClipEvent.COMPLETE, this.onComplete, this);
    };
    p.onComplete = function () {
        this.mc.removeEventListener(egret.MovieClipEvent.COMPLETE, this.onComplete, this);
        this.removeChild(this.mc);
        this.mc.stop();
        this.dispatchEventWith(egret.Event.COMPLETE);
    };
    return BuddhaPalmEff;
}(egret.DisplayObjectContainer));
egret.registerClass(BuddhaPalmEff,'BuddhaPalmEff');
//# sourceMappingURL=BuddhaPalmEff.js.map