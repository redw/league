/**
 * 血量预警效果
 * Created by hh on 2016/12/26.
 */
var BloodWarnEff = (function (_super) {
    __extends(BloodWarnEff, _super);
    function BloodWarnEff(w, h) {
        _super.call(this);
        this.bitmap = new AutoBitmap();
        this.bitmap.width = w;
        this.bitmap.height = h;
        this.addChild(this.bitmap);
        // EventManager.inst.addEventListener(ContextEvent.FIGHT_ROLE_HP_CHANGE, this.onHPChange, this);
    }
    var d = __define,c=BloodWarnEff,p=c.prototype;
    p.onHPChange = function () {
        var _this = this;
        this.bitmap.source = "pvp_blood_bar_png";
        this.bitmap.alpha = 0.5;
        var tween = egret.Tween.get(this.bitmap);
        tween.to({ alpha: 1 }, 100);
        tween.to({ alpha: 0.5 }, 100).call(function () {
            egret.Tween.removeTweens(_this.bitmap);
            _this.bitmap.parent.removeChild(_this.bitmap);
        }, this);
    };
    p.dispose = function () {
        egret.Tween.removeTweens(this.bitmap);
        this.bitmap = null;
        // EventManager.inst.removeEventListener(ContextEvent.FIGHT_ROLE_HP_CHANGE, this.onHPChange, this);
    };
    return BloodWarnEff;
}(egret.DisplayObjectContainer));
egret.registerClass(BloodWarnEff,'BloodWarnEff');
//# sourceMappingURL=BloodWarnEff.js.map