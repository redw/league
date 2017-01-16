/**
 * Created by hh on 17/1/8.
 */
class FontEff extends egret.DisplayObjectContainer {
    protected bitmapText:egret.BitmapText = new egret.BitmapText();

    constructor(fntName:string) {
        super();
        this.bitmapText = new egret.BitmapText();
        this.addChild(this.bitmapText);
        this.bitmapText.font = RES.getRes(fntName);
        this.bitmapText.letterSpacing = -3;
    }

    public show(content:any){
        if (!content) {
            this.dispose();
            return;
        }

        let str = "";
        let scale:number = Number(content.scale) || 1;
        let point:egret.Point = new egret.Point(0, 0);
        if (typeof content == "string")
            str = content;
        else {
            str = content.str;
            point.x = content.x;
            point.y = content.y;
        }
        str = str.toLowerCase();
        this.x = point.x;
        this.y = point.y;
        this.bitmapText.scaleX = this.bitmapText.scaleY = scale;
        this.addChild(this.bitmapText);
        this.bitmapText.text = str;
        this.bitmapText.x = this.bitmapText.width * -0.5;

        egret.Tween.get(this).
        to({y:this.y - 60, alpha:0.4}, 800 * scale, egret.Ease.cubicIn).call(
            ()=>{
                this.dispose();
            },
            this
        );
    }

    public dispose(){
        egret.Tween.removeTweens(this);
        if (this.bitmapText && this.bitmapText.parent) {
            this.bitmapText.parent.removeChild(this.bitmapText);
        }
        this.bitmapText = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}