/**
 * Created by Administrator on 2017/1/19.
 */
var PVEFailEff = (function (_super) {
    __extends(PVEFailEff, _super);
    function PVEFailEff() {
        _super.call(this);
        this.bitmap = new AutoBitmap();
        this.bitmap.source = "pve_fail_tip_png";
        this.addChild(this.bitmap);
        this.bitmap.x = 136;
        this.bitmap.y = 180;
        this.timer = egret.setTimeout(this.dispose, this, 2000);
    }
    var d = __define,c=PVEFailEff,p=c.prototype;
    p.dispose = function () {
        egret.clearTimeout(this.timer);
        this.dispatchEventWith(egret.Event.COMPLETE, true);
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return PVEFailEff;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEFailEff,'PVEFailEff');
//# sourceMappingURL=PVEFailEff.js.map