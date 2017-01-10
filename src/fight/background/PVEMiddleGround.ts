/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 中景
 */
class PVEMiddleGround extends PVEBackGround {

    public constructor(hasTween:boolean=true){
        super(hasTween);
        egret.startTick(this.checkResHeight, this);
    }

    private checkResHeight(){
        if (this.background.height > 0) {
            this.background.y = fight.HEIGHT - this.background.height;
        }
        if (this.freeBackground.height > 0) {
            this.freeBackground.y = fight.HEIGHT - this.freeBackground.height;
        }
        return false;
    }

    protected getSceneResourcePath(level:number){
        let sceneIndex:string = Config.StageData[level].map;
        return "resource/assets/scene/" + sceneIndex + "_" + 2 + ".png";
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