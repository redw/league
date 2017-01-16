/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 远景
 */
class PVEProspect extends PVEBackGround{

    public constructor(hasTween:boolean=true){
        super(hasTween, fight.LOAD_PRIORITY_MAP_BACKGROUND);
        egret.startTick(this.checkResHeight, this);
    }

    private checkResHeight(){
        if (this.background.height > 0) {
            this.background.y = (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        if (this.freeBackground.height > 0) {
            this.freeBackground.y = (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        return false;
    }

    protected getSceneResourcePath(level:number){
        let map:string = Config.StageData[level].map;
        return `${map}_3_png`;
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