/**
 * 关卡过渡效果
 * Created by hh on 2016/12/27.
 */
class PVETransitionEff extends egret.DisplayObjectContainer {
    private bitmap:AutoBitmap;
    private _level:number = -1;

    public constructor(){
        super();

        this.bitmap = new AutoBitmap();
        this.bitmap.x = -1000;
        this.addChild(this.bitmap);
        this.bitmap.source = "link_map_png";
    }

    public set level(value:number) {
        if (this._level < 0) {
            this._level = value;
        } else if (this._level != value) {
            let toX:number = 0;
            if (value > this._level && value % 10 == 1) {
                toX = - this.bitmap.width;
                this.bitmap.x = fight.WIDTH - this.bitmap.width;

                let tween = egret.Tween.get(this.bitmap);
                tween.to({x:toX}, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]);
            // } else {
            //     this.bitmap.x = 0;
            //     toX = fight.WIDTH;
            }

            // let tween = egret.Tween.get(this.bitmap);
            // tween.to({x:toX}, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]);

            this._level = value;
        }
    }
}