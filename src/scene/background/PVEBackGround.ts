/**
 * Created by hh on 2016/12/21.
 */
class PVEBackGround extends egret.DisplayObjectContainer {
    public static WIDTH:number = 480;
    public static HEIGHT:number = 460;

    protected background:AutoBitmap = new AutoBitmap();
    protected freeBackground:AutoBitmap = new AutoBitmap();
    private moveCompleteCount:number = 0;
    private _level:number = -1;
    private curX:number = 0;

    public constructor(){
        super();
    }

    protected getSceneResourcePath(level:number){
        return "";
    }

    public set level(value:number) {
        if (this._level != value) {
            if (this._level == -1) {
                this._level = value;
                let off = 0;
                if (value % 2 == 0) {
                    off = -PVEBackGround.WIDTH;
                }
                this.background.source = this.getSceneResourcePath(value);
                this.background.x = off;
                this.addChild(this.background);
                this.curX = off;
                return;
            }
            let addOff:number = 0;
            if (value > this._level) {
                this.curX -= PVEBackGround.WIDTH;
                addOff = PVEBackGround.WIDTH * -1;
            }
            else {
                this.curX += PVEBackGround.WIDTH;
                addOff = PVEBackGround.WIDTH;
            }

            if (this.curX < -PVEBackGround.WIDTH || this.curX > 0) {
                let curBitmap = this.background;
                let bitmap;
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

    // 缓动
    protected move(off:number=0){
        let tween = egret.Tween.get(this.background);
        tween.to({x:(this.background.x + off)}, 500).call(this.moveComplete, this, [this.background]);

        tween = egret.Tween.get(this.freeBackground);
        tween.to({x:(this.freeBackground.x + off)}, 500).call(this.moveComplete, this, [this.freeBackground]);
    }

    // 当移动完成后,把不在可视范围内的图片删除
    protected moveComplete(bitmap:AutoBitmap) {
        this.moveCompleteCount++;
        egret.Tween.removeTweens(bitmap);
        if (this.moveCompleteCount >= 2) {

        }
    }

    // 得到不在显示对象上的图片
    private getFreeBitmap() {
        return this.freeBackground;
    }
}