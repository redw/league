/**
 * Created by hh on 2016/11/22.
 */
class PVEFightBackground extends egret.DisplayObjectContainer {

    private _level:number = -1;
    private moveCompleteCount:number = 0;
    private background1:AutoBitmap = new AutoBitmap();
    private background2:AutoBitmap = new AutoBitmap();
    private background3:AutoBitmap = new AutoBitmap();
    private background4:AutoBitmap = new AutoBitmap();
    private WIDTH:number = 480;
    private curx:number = 0;


    public constructor() {
        super();
    }

    public set level(value:number) {
        if (this._level != value) {

            if (this._level == -1) {
                this._level = value;
                let off = 0;
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

            let addOff:number = 0;
            if (value > this._level) {
                this.curx -= this.WIDTH;
                addOff = this.WIDTH * -1;
            }
            else {
                this.curx += this.WIDTH;
                addOff = this.WIDTH;
            }

            if (this.curx < -480 || this.curx > 0) {
                let bitmap1;
                let bitmap2;
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
                    tween.to({x:(this["background" + i].x + addOff)}, 500).call(this.moveComplete, this);
                }
            }
            this._level = value;
        }
    }

    private getSceneResourcePath(level:number, deep:number){
        let sceneIndex = Math.ceil(level / 10);
        return "resource/assets/scene/" + sceneIndex + "_" + deep + ".png";
    }

    // 当移动完成后,把不在可视范围内的图片删除
    private moveComplete() {
        this.moveCompleteCount++;
        if (this.moveCompleteCount >= 4) {
            for (let i = 1; i <= 4; i++) {
                let bitmap = this["background" + i];
                egret.Tween.removeTweens(bitmap);
                if (bitmap.x < -480 || bitmap.x > 480) {
                    if (bitmap.parent) {
                        bitmap.parent.removeChild(bitmap);
                    }
                }
            }
        }
    }

    // 得到可视范围内的x坐标
    private getCurX() {
        for (let i = 1; i <= 4; i++) {
            if (this["background" + i].parent) {
                return this["background" + i].x;
            }
        }
    }

    // 得到不在显示对象上的图片
    private getFreeBitmap() {
        for (let i = 1; i <= 4; i++) {
            if (this["background" + i].parent == null) {
                return this["background" + i];
            }
        }
    }
}
