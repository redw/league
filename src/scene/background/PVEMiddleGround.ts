/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 中景
 */
class PVEMiddleGround extends PVEBackGround {

    public constructor(){
        super();
    }

    protected getSceneResourcePath(level:number){
        let name:string = Config.StageData[level].map;
        return URLConfig.getSceneResURL(name, 2);
    }

    // 缓动
    protected move(off:number=0){
        let tween = egret.Tween.get(this.background);
        tween.to({x:(this.background.x + off)}, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).
        call(this.moveComplete, this, [this.background]);

        tween = egret.Tween.get(this.freeBackground);
        tween.to({x:(this.freeBackground.x + off)}, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).
        call(this.moveComplete, this, [this.freeBackground]);
    }
}