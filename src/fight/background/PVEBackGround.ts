/**
 * Created by hh on 2016/12/21.
 */
class PVEBackGround extends egret.DisplayObjectContainer {
    protected background:AutoBitmap = new AutoBitmap();
    protected freeBackground:AutoBitmap = new AutoBitmap();
    private moveCompleteCount:number = 0;
    private _level:number = -1;
    private curX:number = 0;
    protected hasTween:boolean = false;

    public constructor(hasTween:boolean=true){
        super();
        this.hasTween = hasTween;
    }

    protected getSceneResourcePath(level:number){
        return "";
    }

    public set level(value:number) {
        if (this._level != value || !this.hasTween) {
            if (this._level == -1) {
                this._level = value;
                let off = 0;
                if (value % 2 == 0) {
                    off = -fight.WIDTH;
                }
                this.background.source = this.getSceneResourcePath(value);
                this.background.x = off;
                this.addChild(this.background);
                this.curX = off;
                return;
            }
            let addOff:number = 0;
            if (value > this._level) {
                this.curX -= fight.WIDTH;
                addOff = fight.WIDTH * -1;
            }
            else {
                this.curX += fight.WIDTH;
                addOff = fight.WIDTH;
            }

            if (this.curX < -fight.WIDTH || this.curX > 0) {
                let curBitmap = this.background;
                let bitmap;
                if (this.curX < -fight.WIDTH) {
                    bitmap = this.getFreeBitmap();
                    this.addChild(bitmap);
                    bitmap.x = fight.WIDTH;
                    this.curX = 0;
                }
                if (this.curX > 0) {
                    bitmap = this.getFreeBitmap();
                    this.addChild(bitmap);
                    bitmap.x = -fight.WIDTH * 2;
                    this.curX = -fight.WIDTH;
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