/**
 * 关卡进度条
 * Created by hh on 2016/12/27.
 */
class StageProgress extends egret.DisplayObjectContainer {
    private backGround:AutoBitmap;
    private hpBitmap:AutoBitmap;
    private WIDTH:number = 254;
    private levelTxt:egret.TextField;

    public constructor()
    {
        super();

        this.backGround = new AutoBitmap();
        this.addChild(this.backGround);
        this.backGround.source = "blood_stage_background_png";

        this.hpBitmap = new AutoBitmap();
        this.hpBitmap.source = "blood_stage_png";
        this.addChild(this.hpBitmap);

        this.levelTxt = new egret.TextField;
        this.levelTxt.size = 16;
        this.levelTxt.strokeColor = 0x0;
        this.levelTxt.stroke = 2;
        this.levelTxt.width = this.WIDTH;
        this.levelTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.levelTxt.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.addChild(this.levelTxt);
    }

    public startLevel(value:number){
        this.levelTxt.text = "关卡:" + value;
        this.setProgress(1);
    }

    public setProgress(value:number){
        let w = MathUtil.clamp(value,0,1) * this.WIDTH;
        this.hpBitmap.width = w;
        this.hpBitmap.x = this.WIDTH - w;
    }
}