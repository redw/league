var HurtFontEff = (function (_super) {
    __extends(HurtFontEff, _super);
    function HurtFontEff() {
        _super.call(this);
        this.textField = new egret.TextField;
        this.textField.touchEnabled = false;
        this.textField.textAlign = egret.HorizontalAlign.CENTER;
        this.textField.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.textField.fontFamily = Global.SYS_FONT;
        this.textField.width = 100;
        this.textField.x = -50;
        this.textField.size = 14;
        this.textField.bold = true;
    }
    var d = __define,c=HurtFontEff,p=c.prototype;
    p.show = function (text, color) {
        this.textField.textColor = color || 0xffffff;
        this.textField.text = text;
        this.textField.alpha = 1;
        this.addChild(this.textField);
        egret.Tween.get(this.textField).to({ alpha: 0.5, y: -20 }, 1000).call(function () {
            this.y = 0;
            egret.Tween.removeTweens(this);
            this.parent.removeChild(this);
        }, this.textField);
    };
    return HurtFontEff;
}(egret.DisplayObjectContainer));
egret.registerClass(HurtFontEff,'HurtFontEff');
