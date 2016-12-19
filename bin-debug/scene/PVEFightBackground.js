/**
 * Created by hh on 2016/11/22.
 */
var PVEFightBackground = (function (_super) {
    __extends(PVEFightBackground, _super);
    function PVEFightBackground() {
        _super.call(this);
        this._level = -1;
        this.moveCompleteCount = 0;
        this.background1 = new AutoBitmap();
        this.background2 = new AutoBitmap();
        this.background3 = new AutoBitmap();
        this.background4 = new AutoBitmap();
        this.WIDTH = 480;
        this.curx = 0;
    }
    var d = __define,c=PVEFightBackground,p=c.prototype;
    d(p, "level",undefined
        ,function (value) {
            if (this._level != value) {
                if (this._level == -1) {
                    this._level = value;
                    var off = 0;
                    if (value % 2 == 0) {
                        off = -480;
                    }
                    this.background1.source = this.getSceneResourcePath(value, 1);
                    this.background2.source = this.getSceneResourcePath(value, 2);
                    this.background1.x = off;
                    this.background2.x = off;
                    this.addChild(this.background1);
                    this.addChild(this.background2);
                    this.curx = off;
                    return;
                }
                var addOff = 0;
                if (value > this._level) {
                    this.curx -= this.WIDTH;
                    addOff = this.WIDTH * -1;
                }
                else {
                    this.curx += this.WIDTH;
                    addOff = this.WIDTH;
                }
                if (this.curx < -480 || this.curx > 0) {
                    var bitmap1 = void 0;
                    var bitmap2 = void 0;
                    if (this.curx < -480) {
                        bitmap1 = this.getFreeBitmap();
                        this.addChild(bitmap1);
                        bitmap1.x = 480;
                        bitmap2 = this.getFreeBitmap();
                        this.addChild(bitmap2);
                        bitmap2.x = 480;
                        this.curx = 0;
                    }
                    if (this.curx > 0) {
                        bitmap1 = this.getFreeBitmap();
                        this.addChild(bitmap1);
                        bitmap1.x = -960;
                        bitmap2 = this.getFreeBitmap();
                        this.addChild(bitmap2);
                        bitmap2.x = -960;
                        this.curx = -480;
                    }
                    bitmap1.source = this.getSceneResourcePath(value, 1);
                    bitmap2.source = this.getSceneResourcePath(value, 2);
                }
                this.moveCompleteCount = 0;
                for (var i = 1; i <= 4; i++) {
                    if (this["background" + i].parent) {
                        var tween = egret.Tween.get(this["background" + i]);
                        tween.to({ x: (this["background" + i].x + addOff) }, 500).call(this.moveComplete, this);
                    }
                }
                this._level = value;
            }
        }
    );
    p.getSceneResourcePath = function (level, deep) {
        var sceneIndex = Math.ceil(level / 10);
        return "resource/assets/scene/" + sceneIndex + "_" + deep + ".png";
    };
    // 当移动完成后,把不在可视范围内的图片删除
    p.moveComplete = function () {
        this.moveCompleteCount++;
        if (this.moveCompleteCount >= 4) {
            for (var i = 1; i <= 4; i++) {
                var bitmap = this["background" + i];
                egret.Tween.removeTweens(bitmap);
                if (bitmap.x < -480 || bitmap.x > 480) {
                    if (bitmap.parent) {
                        bitmap.parent.removeChild(bitmap);
                    }
                }
            }
        }
    };
    // 得到可视范围内的x坐标
    p.getCurX = function () {
        for (var i = 1; i <= 4; i++) {
            if (this["background" + i].parent) {
                return this["background" + i].x;
            }
        }
    };
    // 得到不在显示对象上的图片
    p.getFreeBitmap = function () {
        for (var i = 1; i <= 4; i++) {
            if (this["background" + i].parent == null) {
                return this["background" + i];
            }
        }
    };
    return PVEFightBackground;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEFightBackground,'PVEFightBackground');
