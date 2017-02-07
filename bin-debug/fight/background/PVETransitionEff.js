/**
 * 关卡过渡效果
 * Created by hh on 2016/12/27.
 */
var PVETransitionEff = (function (_super) {
    __extends(PVETransitionEff, _super);
    function PVETransitionEff(size) {
        _super.call(this);
        this._level = -1;
        this.size = size;
        this.shape = new egret.Shape();
        this.shape.graphics.beginFill(0x0, 1);
        this.shape.graphics.drawRect(0, 0, size.x, size.y);
        this.shape.graphics.endFill();
        this.shape.visible = false;
        this.addChild(this.shape);
    }
    var d = __define,c=PVETransitionEff,p=c.prototype;
    d(p, "level",undefined
        ,function (value) {
            var _this = this;
            this.shape.visible = true;
            this.shape.alpha = 1;
            var tween = egret.Tween.get(this.shape);
            tween.to({ alpha: 0 }, 500).call(function () {
                _this.shape.visible = false;
                egret.Tween.removeTweens(_this.shape);
            }, this);
            this._level = value;
        }
    );
    return PVETransitionEff;
}(egret.DisplayObjectContainer));
egret.registerClass(PVETransitionEff,'PVETransitionEff');
//# sourceMappingURL=PVETransitionEff.js.map