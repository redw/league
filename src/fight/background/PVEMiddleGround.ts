/**
 * Created by Administrator on 2016/12/21.
 */
/**
 * PVE 中景
 */
class PVEMiddleGround extends PVEBackGround {

    public constructor(hasTween:boolean=true){
        super(hasTween, fight.LOAD_PRIORITY_MAP_MIDDLE);
        egret.startTick(this.checkResHeight, this);
    }

    private checkResHeight(){
        if (this.background && this.background.height > 0) {
            this.background.y = (fight.HEIGHT - this.background.height) * 0.5;
        }
        if (this.freeBackground && this.freeBackground.height > 0) {
            this.freeBackground.y = (fight.HEIGHT - this.freeBackground.height) * 0.5;
        }
        return false;
    }

    protected getSceneResourcePath(level:number){
        let stageConfig:StageCommonConfig = Config.StageCommonData[Math.ceil(level / fight.MAP_SWITCH_SIZE)];
        let map:string = stageConfig.map;
        return `${map}_2_png`;
    }

    public set source(value:string){
        let path = `${value}_2_png`;
        this.background.source = path;
    }

    // 缓动
    protected move(off:number=0){
        let tween = egret.Tween.get(this.background);
        tween.to({x:(this.background.x + off)}, fight.MIDDLE_GROUND_MOVE_TIME).
        call(this.moveComplete, this, [this.background]);

        tween = egret.Tween.get(this.freeBackground);
        tween.to({x:(this.freeBackground.x + off)}, fight.MIDDLE_GROUND_MOVE_TIME).
        call(this.moveComplete, this, [this.freeBackground]);
    }
}