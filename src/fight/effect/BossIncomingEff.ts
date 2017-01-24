/**
 * Boss来龚效果
 * Created by hh on 2016/12/27.
 */
class BossIncomingEff extends egret.DisplayObjectContainer {
    private bitmap:AutoBitmap;
    private timer:number;

    public constructor() {
        super();

        this.bitmap = new AutoBitmap();
        this.bitmap.source = "boss_coming_title_png";
        this.addChild(this.bitmap);

        this.bitmap.x = 50;
        this.bitmap.y = 180;

        this.bitmap.alpha = 0.4;
        let tween = egret.Tween.get(this.bitmap);
        tween.to({alpha:1}, 1000, egret.Ease.cubicIn);
        tween.to({alpha:0.4}, 1000, egret.Ease.cubicOut);
        tween.call(this.dispose, this);
        // this.timer = egret.setTimeout(this.dispose, this, 2000);
    }

    private dispose(){
        egret.Tween.removeTweens(this.bitmap);
        egret.clearTimeout(this.timer);
        this.dispatchEventWith(egret.Event.COMPLETE, true);
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}
