/**
 * Created by hh on 17/1/8.
 */
var FontEff = (function (_super) {
    __extends(FontEff, _super);
    function FontEff(fntName) {
        _super.call(this);
        this.bitmapText = new egret.BitmapText();
        this.bitmapText = new egret.BitmapText();
        this.addChild(this.bitmapText);
        this.bitmapText.font = RES.getRes(fntName);
        this.bitmapText.letterSpacing = -3;
    }
    var d = __define,c=FontEff,p=c.prototype;
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
        str = str.toLowerCase();
        this.x = point.x;
        this.y = point.y;
        this.bitmapText.scaleX = this.bitmapText.scaleY = scale;
        this.addChild(this.bitmapText);
        this.bitmapText.text = str;
        this.bitmapText.x = this.bitmapText.width * -0.5;
        egret.Tween.get(this).
            to({ y: this.y - 60, alpha: 0.4 }, 800 * scale, egret.Ease.cubicIn).call(function () {
            _this.dispose();
        }, this);
    };
    p.dispose = function () {
        egret.Tween.removeTweens(this);
        if (this.bitmapText && this.bitmapText.parent) {
            this.bitmapText.parent.removeChild(this.bitmapText);
        }
        this.bitmapText = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return FontEff;
}(egret.DisplayObjectContainer));
egret.registerClass(FontEff,'FontEff');
//# sourceMappingURL=FontEff.js.map