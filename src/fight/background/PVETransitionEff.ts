/**
 * 关卡过渡效果
 * Created by hh on 2016/12/27.
 */
class PVETransitionEff extends egret.DisplayObjectContainer {
    private shape:egret.Shape;
    private _level:number = -1;
    private size:{x:number, y:number};

    public constructor(size:{x:number, y:number}){
        super();
        this.size = size;
        this.shape = new egret.Shape();
        this.shape.graphics.beginFill(0x0, 1);
        this.shape.graphics.drawRect(0,0,size.x, size.y);
        this.shape.graphics.endFill();
        this.shape.visible = false;
        this.addChild(this.shape)
    }

    public set level(value:number) {
        this.shape.visible = true;
        this.shape.alpha = 1;
        let tween = egret.Tween.get(this.shape);
        tween.to({alpha:0}, 500).call(
            ()=>{
                this.shape.visible = false;
                egret.Tween.removeTweens(this.shape);
            }, this
        );
        this._level = value;
    }
}