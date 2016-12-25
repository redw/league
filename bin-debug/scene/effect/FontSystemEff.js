var FontSystemEff = (function (_super) {
    __extends(FontSystemEff, _super);
    function FontSystemEff() {
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
        this.textField.strokeColor = 0x672B23;
    }
    var d = __define,c=FontSystemEff,p=c.prototype;
    p.show = function (content) {
        var _this = this;
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
        this.textField.scaleX = this.textField.scaleY = scale;
        this.textField.textColor = content.color || 0x0000ff;
        this.textField.text = str;
        this.textField.alpha = 1;
        this.addChild(this.textField);
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
    return FontSystemEff;
}(egret.DisplayObjectContainer));
egret.registerClass(FontSystemEff,'FontSystemEff');
//# sourceMappingURL=FontSystemEff.js.map