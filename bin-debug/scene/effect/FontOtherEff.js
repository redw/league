/**
 * Created by hh on 2016/12/20.
 */
var FontOtherEff = (function (_super) {
    __extends(FontOtherEff, _super);
    function FontOtherEff() {
        _super.call(this);
        this.bitmapText = new egret.BitmapText();
        this.bitmapText = new egret.BitmapText();
        this.addChild(this.bitmapText);
    }
    var d = __define,c=FontOtherEff,p=c.prototype;
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
        this.bitmapText.font = RES.getRes("other_fnt");
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
    return FontOtherEff;
}(egret.DisplayObjectContainer));
egret.registerClass(FontOtherEff,'FontOtherEff');
//# sourceMappingURL=FontOtherEff.js.map