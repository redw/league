/**
 * Created by Administrator on 2016/12/21.
 */
var PVEBackGround = (function (_super) {
    __extends(PVEBackGround, _super);
    function PVEBackGround() {
        _super.call(this);
        this.background = new AutoBitmap();
        this.freeBackground = new AutoBitmap();
        this.moveCompleteCount = 0;
        this._level = -1;
        this.curX = 0;
    }
    var d = __define,c=PVEBackGround,p=c.prototype;
    p.getSceneResourcePath = function (level) {
        return "";
    };
    d(p, "level",undefined
        ,function (value) {
            if (this._level != value) {
                if (this._level == -1) {
                    this._level = value;
                    var off = 0;
                    if (value % 2 == 0) {
                        off = -PVEBackGround.WIDTH;
                    }
                    this.background.source = this.getSceneResourcePath(value);
                    this.background.x = off;
                    this.addChild(this.background);
                    this.curX = off;
                    return;
                }
                var addOff = 0;
                if (value > this._level) {
                    this.curX -= PVEBackGround.WIDTH;
                    addOff = PVEBackGround.WIDTH * -1;
                }
                else {
                    this.curX += PVEBackGround.WIDTH;
                    addOff = PVEBackGround.WIDTH;
                }
                if (this.curX < -PVEBackGround.WIDTH || this.curX > 0) {
                    var curBitmap = this.background;
                    var bitmap = void 0;
                    if (this.curX < -PVEBackGround.WIDTH) {
                        bitmap = this.getFreeBitmap();
                        this.addChild(bitmap);
                        bitmap.x = PVEBackGround.WIDTH;
                        this.curX = 0;
                    }
                    if (this.curX > 0) {
                        bitmap = this.getFreeBitmap();
                        this.addChild(bitmap);
                        bitmap.x = -PVEBackGround.WIDTH * 2;
                        this.curX = -PVEBackGround.WIDTH;
                    }
                    bitmap.source = this.getSceneResourcePath(value);
                    this.freeBackground = curBitmap;
                    this.background = bitmap;
                }
                this.moveCompleteCount = 0;
                this.move(addOff);
                this._level = value;
            }
        }
    );
    // 缓动
    p.move = function (off) {
        if (off === void 0) { off = 0; }
        var tween = egret.Tween.get(this.background);
        tween.to({ x: (this.background.x + off) }, 500).call(this.moveComplete, this, [this.background]);
        tween = egret.Tween.get(this.freeBackground);
        tween.to({ x: (this.freeBackground.x + off) }, 500).call(this.moveComplete, this, [this.freeBackground]);
    };
    // 当移动完成后,把不在可视范围内的图片删除
    p.moveComplete = function (bitmap) {
        this.moveCompleteCount++;
        egret.Tween.removeTweens(bitmap);
        if (this.moveCompleteCount >= 2) {
        }
    };
    // 得到不在显示对象上的图片
    p.getFreeBitmap = function () {
        return this.freeBackground;
    };
    PVEBackGround.WIDTH = 480;
    PVEBackGround.HEIGHT = 460;
    return PVEBackGround;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEBackGround,'PVEBackGround');
//# sourceMappingURL=PVEBackGround.js.map