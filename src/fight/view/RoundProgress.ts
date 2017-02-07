/**
 * 回合进度
 * Created by hh on 2017/1/18.
 */
class RoundProgress extends egret.DisplayObjectContainer {
    private bgBitmap:AutoBitmap;
    private roundImg:egret.BitmapText;
    private _round:number;

    public constructor(){
        super();

        this.bgBitmap = new AutoBitmap("pvp_time_png");
        this.addChild(this.bgBitmap);

        this.roundImg = new egret.BitmapText();
        this.roundImg.y = 2;
        this.roundImg.x = 0;
        this.addChild(this.roundImg);
        this.roundImg.font = RES.getRes("stage_fnt");
        this.roundImg.letterSpacing = -3;
        this.roundImg.$setTextAlign(egret.HorizontalAlign.CENTER);
        this.roundImg.width = 100;
        this.roundImg.text = `回合${1}`;
    }

    public set round(value:number) {
        if (this._round != value) {
            this._round = value;
            this.roundImg.text = `回合${value}`;
        }
    }
}
