/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 近景
 */
class PVEForeground extends PVEBackGround{

    public constructor(){
        super();
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
        let name:string = Config.StageData[level].map;
        return URLConfig.getSceneResURL(name, 1);
    }

    // 缓动
    protected move(off:number=0){
        let tween = egret.Tween.get(this.background);
        tween.to({x:(this.background.x + off)}, fight.FORE_GROUND_MOVE_TIME, egret.Ease[fight.FORE_GROUND_MOVE_EASE]).
        call(this.moveComplete, this, [this.background]);

        tween = egret.Tween.get(this.freeBackground);
        tween.to({x:(this.freeBackground.x + off)}, fight.FORE_GROUND_MOVE_TIME, egret.Ease[fight.FORE_GROUND_MOVE_EASE]).
        call(this.moveComplete, this, [this.freeBackground]);
    }
}