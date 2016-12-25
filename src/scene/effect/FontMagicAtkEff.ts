/**
 * Created by hh on 2016/12/20.
 */
class FontMagicAtkEff extends egret.DisplayObjectContainer{
    private bitmapText:egret.BitmapText = new egret.BitmapText();
    constructor(){
        super();
        this.bitmapText = new egret.BitmapText();
        this.addChild(this.bitmapText);
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
        this.x = point.x;
        this.y = point.y;
        this.bitmapText.scaleX = this.bitmapText.scaleY = scale;
        this.bitmapText.font = RES.getRes("magical_damage_fnt");
        this.addChild(this.bitmapText);
        this.bitmapText.text = str;
        this.bitmapText.x = this.bitmapText.width * -0.5;

        egret.Tween.get(this).
        to({y:this.y - 30}, 300).
        to({alpha:0.2}, 200).call(
            ()=>{
                this.dispose();
            },
            this
        );
    }

    public dispose(){
        egret.Tween.removeTweens(this);
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}