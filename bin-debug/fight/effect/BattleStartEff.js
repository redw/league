/**
 * 战斗开始效果
 * Created by hh on 2016/12/27.
 */
var BattleStartEff = (function (_super) {
    __extends(BattleStartEff, _super);
    function BattleStartEff() {
        _super.call(this);
        this.bitmap = new AutoBitmap();
        this.bitmap.source = "battle_start_png";
        this.addChild(this.bitmap);
        this.bitmap.x = 50;
        this.bitmap.y = 180;
        this.bitmap.alpha = 0.4;
        var tween = egret.Tween.get(this.bitmap);
        tween.to({ alpha: 1 }, 1000, egret.Ease.cubicIn);
        tween.to({ alpha: 0.4 }, 600, egret.Ease.cubicOut);
        tween.call(this.dispose, this);
        // this.timer = egret.setTimeout(this.dispose, this, 2000);
    }
    var d = __define,c=BattleStartEff,p=c.prototype;
    p.dispose = function () {
        egret.Tween.removeTweens(this.bitmap);
        egret.clearTimeout(this.timer);
        this.dispatchEventWith(egret.Event.COMPLETE, true);
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return BattleStartEff;
}(egret.DisplayObjectContainer));
egret.registerClass(BattleStartEff,'BattleStartEff');
//# sourceMappingURL=BattleStartEff.js.map