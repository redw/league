/**
 * 回合进度
 * Created by hh on 2017/1/18.
 */
var RoundProgress = (function (_super) {
    __extends(RoundProgress, _super);
    function RoundProgress() {
        _super.call(this);
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
        this.roundImg.text = "\u56DE\u5408" + 1;
    }
    var d = __define,c=RoundProgress,p=c.prototype;
    d(p, "round",undefined
        ,function (value) {
            if (this._round != value) {
                this._round = value;
                this.roundImg.text = "\u56DE\u5408" + value;
            }
        }
    );
    return RoundProgress;
}(egret.DisplayObjectContainer));
egret.registerClass(RoundProgress,'RoundProgress');
//# sourceMappingURL=RoundProgress.js.map