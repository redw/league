/**
 * 新章节效果
 * Created by hh on 2016/12/27.
 */
class NewChapterEff extends egret.DisplayObjectContainer{
    private bitmap:AutoBitmap;

    public constructor() {
        super();
        this.bitmap = new AutoBitmap();
        this.bitmap.source = "link_map_png";
        this.addChild(this.bitmap);

        this.bitmap.x = 80;
        this.bitmap.y = 40;
        egret.Tween.get(this.bitmap).wait(500).call(()=>{
            egret.Tween.removeTweens(this.bitmap);
            if (this.parent) {
                this.parent.removeChild(this);
            }
            this.dispatchEventWith(egret.Event.COMPLETE, true);
        }, this);
    }
}
