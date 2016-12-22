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
            this.background.y = PVEBackGround.HEIGHT - this.background.height;
        }
        if (this.freeBackground.height > 0) {
            this.freeBackground.y = PVEBackGround.HEIGHT - this.freeBackground.height;
        }
        return false;
    }

    protected getSceneResourcePath(level:number){
        let mapName = Config.StageData[level].map;
        return "resource/assets/scene/" + mapName + "_" + 1 + ".png";
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