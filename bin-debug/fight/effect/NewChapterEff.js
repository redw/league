/**
 * 新章节效果
 * Created by hh on 2016/12/27.
 */
var NewChapterEff = (function (_super) {
    __extends(NewChapterEff, _super);
    function NewChapterEff(title) {
        var _this = this;
        _super.call(this);
        this.bitmapText = new egret.BitmapText();
        this.bitmapText = new egret.BitmapText();
        this.addChild(this.bitmapText);
        this.bitmapText.font = RES.getRes(fight.FONT_PVE_TITLE);
        this.bitmapText.letterSpacing = -3;
        this.bitmapText.textAlign = "center";
        this.bitmapText.x = 0;
        this.bitmapText.width = 480;
        this.bitmapText.text = title || "";
        this.bitmapText.y = 200;
        egret.Tween.get(this.bitmapText).wait(500).call(function () {
            egret.Tween.removeTweens(_this.bitmapText);
            _this.dispatchEventWith(egret.Event.COMPLETE, true);
            if (_this.parent) {
                _this.parent.removeChild(_this);
            }
        }, this);
    }
    var d = __define,c=NewChapterEff,p=c.prototype;
    return NewChapterEff;
}(egret.DisplayObjectContainer));
egret.registerClass(NewChapterEff,'NewChapterEff');
//# sourceMappingURL=NewChapterEff.js.map