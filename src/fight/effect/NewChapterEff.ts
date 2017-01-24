/**
 * 新章节效果
 * Created by hh on 2016/12/27.
 */
class NewChapterEff extends egret.DisplayObjectContainer{

    protected bitmapText:egret.BitmapText = new egret.BitmapText();

    public constructor(title:string) {
        super();

        this.bitmapText = new egret.BitmapText();
        this.addChild(this.bitmapText);
        this.bitmapText.font = RES.getRes(fight.FONT_PVE_TITLE);
        this.bitmapText.letterSpacing = -3;
        this.bitmapText.textAlign = "center";


        this.bitmapText.x = 0;
        this.bitmapText.width = 480;
        this.bitmapText.text = title || "";

        this.bitmapText.y = 200;

        egret.Tween.get(this.bitmapText).wait(500).call(()=>{
            egret.Tween.removeTweens(this.bitmapText);
            this.dispatchEventWith(egret.Event.COMPLETE, true);
            if (this.parent) {
                this.parent.removeChild(this);
            }
        }, this);
    }
}
