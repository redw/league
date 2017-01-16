/**
 * boss关卡进度条
 * Created by hh on 2016/12/27.
 */
class BossStageProgress extends egret.DisplayObjectContainer {
    private backGround:AutoBitmap;
    private hpBitmap:AutoBitmap;
    private WIDTH:number = 173;
    private levelImg:egret.BitmapText;

    public constructor()
    {
        super();

        this.backGround = new AutoBitmap();
        this.addChild(this.backGround);
        this.backGround.source = "blood_stage_background_png";

        this.hpBitmap = new AutoBitmap();
        this.hpBitmap.source = "blood_stage_png";
        this.addChild(this.hpBitmap);

        this.levelImg = new egret.BitmapText();
        this.levelImg.x = 60;
        this.addChild(this.levelImg);
        this.levelImg.font = RES.getRes("stage_fnt");
        this.levelImg.letterSpacing = -3;
        this.levelImg.$setTextAlign(egret.HorizontalAlign.CENTER)
    }

    public startLevel(value:number){
        this.levelImg.text = "关卡:" + value;
        this.setProgress(1);
    }

    public setProgress(value:number){
        let w = MathUtil.clamp(value,0,1) * this.WIDTH;
        this.hpBitmap.width = w;
        this.hpBitmap.x = this.WIDTH - w;
    }
}
