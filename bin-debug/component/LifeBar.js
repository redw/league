var Tween = egret.Tween;
/**
 * 血条显示
 * Created by Administrator on 11/16 0016.
 */
var LifeBar = (function (_super) {
    __extends(LifeBar, _super);
    function LifeBar(isHero) {
        _super.call(this);
        this._bg = new AutoBitmap();
        this._bar = new AutoBitmap();
        this._bg.source = "pvp_blood_white_png";
        this._bar.source = isHero ? "pvp_blood_png" : "pvp_blood_enemy_png";
        this.addChild(this._bg);
        this.addChild(this._bar);
        // this._bar.x = this._bar.y = 1;
        this._width = 61;
    }
    var d = __define,c=LifeBar,p=c.prototype;
    p.setProgress = function (hp, life) {
        this._bar.width = MathUtil.clamp(Math.floor(hp * this._width / life), 0, this._width);
    };
    p.setRatio = function (value) {
        value = MathUtil.clamp(value, 0, 1);
        // this._bar.width = this._width * value;
        egret.Tween.get(this._bar).to({ width: this._width * value }, 200);
    };
    p.reSet = function () {
        this._bar.width = this._width;
    };
    return LifeBar;
}(egret.DisplayObjectContainer));
egret.registerClass(LifeBar,'LifeBar');
//# sourceMappingURL=LifeBar.js.map