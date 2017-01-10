/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 远景
 */
class PVEProspect extends PVEBackGround{

    public constructor(hasTween:boolean=true){
        super(hasTween);
    }

    protected getSceneResourcePath(level:number){
        let sceneIndex:string = Config.StageData[level].map;
        return "resource/assets/scene/" + sceneIndex + "_" + 3 + ".png";
    }

    // 缓动
    protected move(off:number=0){
        let tween = egret.Tween.get(this.background);
        tween.to({x:(this.background.x + off)}, fight.BACK_GROUND_MOVE_TIME, egret.Ease[fight.BACK_GROUND_MOVE_EASE]).
        call(this.moveComplete, this, [this.background]);

        tween = egret.Tween.get(this.freeBackground);
        tween.to({x:(this.freeBackground.x + off)}, fight.BACK_GROUND_MOVE_TIME, egret.Ease[fight.BACK_GROUND_MOVE_EASE]).
        call(this.moveComplete, this, [this.freeBackground]);
    }
}