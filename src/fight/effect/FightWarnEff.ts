/**
 * 预警效果
 * Created by hh on 2016/12/26.
 */
class FightWarnEff extends egret.DisplayObjectContainer{
    private image:AutoBitmap;
    private hasTween:boolean = false;
    private container:egret.DisplayObjectContainer;

    public constructor(container:egret.DisplayObjectContainer){
        super();
        this.container = container;
        this.image = new AutoBitmap();
        this.image.x = -30;
        this.image.y = -30;
        this.image.source = "danger_png";
        this.addChild(this.image);
    }

    public show(width:number=460, height:number = 800){
        if (!this.hasTween) {
            this.image.width = width + 2 * 30;
            this.image.height = height + 2 * 30;
            this.container.addChild(this);
            this.alpha = 0.8;
            let tween = egret.Tween.get(this);
            tween.to({alpha:1}, 100);
            tween.wait(100);
            tween.to({alpha:0.5}, 100).call(this.hide, this);
            this.hasTween = true;
        }
    }

    public hide(){
        if (this.parent) {
            egret.Tween.removeTweens(this);
            this.parent.removeChild(this);
            this.hasTween = false;
        }
    }

    public dispose(){
        if (this.parent) {
            this.parent.removeChild(this);
        }
        egret.Tween.removeTweens(this);
        this.hasTween = false;
        this.container = null;
    }
}