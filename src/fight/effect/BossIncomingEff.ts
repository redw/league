/**
 * Boss来龚效果
 * Created by hh on 2016/12/27.
 */
class BossIncomingEff extends egret.DisplayObjectContainer {
    private bitmap:AutoBitmap;

    public constructor() {
        super();

        this.bitmap = new AutoBitmap();
        this.bitmap.source = "boss_stage_title_png";
        this.addChild(this.bitmap);

        this.bitmap.x = 17;
        this.bitmap.y = 180;
        egret.setTimeout(()=>{
            if (this.parent) {
                this.parent.removeChild(this);
            }
            this.dispatchEventWith(egret.Event.COMPLETE, true);
        }, this, 2000);
        // egret.Tween.get(this.bitmap).wait(500).call(()=>{
        //     egret.Tween.removeTweens(this.bitmap);
        //     if (this.parent) {
        //         this.parent.removeChild(this);
        //     }
        //     this.dispatchEventWith(egret.Event.COMPLETE, true);
        // }, this);
    }
}
