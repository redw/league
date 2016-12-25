/**
 * Created by hh on 2016/12/20.
 */
var FontPhysicalAtkEff = (function (_super) {
    __extends(FontPhysicalAtkEff, _super);
    function FontPhysicalAtkEff() {
        _super.call(this);
        this.bitmapText = new egret.BitmapText();
        this.bitmapText = new egret.BitmapText();
        this.bitmapText.anchorOffsetX = -0.5;
        this.bitmapText.anchorOffsetY = -0.5;
        this.addChild(this.bitmapText);
    }
    var d = __define,c=FontPhysicalAtkEff,p=c.prototype;
    p.show = function (content) {
        var _this = this;
        if (!content) {
            this.dispose();
            return;
        }
        var str = "";
        var scale = Number(content.scale) || 1;
        var point = new egret.Point(0, 0);
        if (typeof content == "string")
            str = content;
        else {
            str = content.str;
            point.x = content.x;
            point.y = content.y;
        }
        this.x = point.x;
        this.y = point.y;
        this.bitmapText.scaleX = this.bitmapText.scaleY = scale;
        this.bitmapText.font = RES.getRes("physical_damage_fnt");
        this.addChild(this.bitmapText);
        this.bitmapText.text = str;
        this.bitmapText.x = this.bitmapText.width * -0.5;
        egret.Tween.get(this).
            to({ y: this.y - 30 }, 300).
            to({ alpha: 0.2 }, 200).call(function () {
            _this.dispose();
        }, this);
    };
    p.dispose = function () {
        egret.Tween.removeTweens(this);
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return FontPhysicalAtkEff;
}(egret.DisplayObjectContainer));
egret.registerClass(FontPhysicalAtkEff,'FontPhysicalAtkEff');
//# sourceMappingURL=FontPhysicalAtkEff.js.map