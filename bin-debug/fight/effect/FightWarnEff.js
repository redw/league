/**
 * 预警效果
 * Created by hh on 2016/12/26.
 */
var FightWarnEff = (function (_super) {
    __extends(FightWarnEff, _super);
    function FightWarnEff(container) {
        _super.call(this);
        this.hasTween = false;
        this.container = container;
        this.image = new AutoBitmap();
        this.image.x = -30;
        this.image.y = -30;
        this.image.source = "danger_png";
        this.addChild(this.image);
    }
    var d = __define,c=FightWarnEff,p=c.prototype;
    p.show = function (width, height) {
        if (width === void 0) { width = 460; }
        if (height === void 0) { height = 800; }
        if (!this.hasTween) {
            this.image.width = width + 2 * 30;
            this.image.height = height + 2 * 30;
            this.container.addChild(this);
            this.alpha = 0.8;
            var tween = egret.Tween.get(this);
            tween.to({ alpha: 1 }, 100);
            tween.wait(100);
            tween.to({ alpha: 0.5 }, 100).call(this.hide, this);
            this.hasTween = true;
        }
    };
    p.hide = function () {
        if (this.parent) {
            egret.Tween.removeTweens(this);
            this.parent.removeChild(this);
            this.hasTween = false;
        }
    };
    p.dispose = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        egret.Tween.removeTweens(this);
        this.hasTween = false;
        this.container = null;
    };
    return FightWarnEff;
}(egret.DisplayObjectContainer));
egret.registerClass(FightWarnEff,'FightWarnEff');
//# sourceMappingURL=FightWarnEff.js.map