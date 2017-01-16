/**
 * PVE或BOSS战背景图
 * Created by hh on 2016/12/21.
 */
class PVEBackGround extends egret.DisplayObjectContainer {
    private _level:number = -1;
    protected priority:number = 0;
    protected hasTween:boolean = false;
    protected background:PriorityImage;
    protected freeBackground:PriorityImage;

    public constructor(hasTween:boolean=true, priority:number) {
        super();
        this.hasTween = hasTween;
        this.priority = priority;
        this.background = new PriorityImage(this.priority);
        this.freeBackground = new PriorityImage(this.priority);
        this.addChild(this.background);
        this.addChild(this.freeBackground);
    }

    protected getSceneResourcePath(level:number) {
        return "";
    }

    public set level(value:number) {
        if (value != this._level) {
            let stageConfig:StageConfig = Config.StageData[value];
            if (!stageConfig)  return;
            this.background.source = this.getSceneResourcePath(value);
            this.freeBackground.source = this.getSceneResourcePath(value);
            if (value % 2 == 0) {
                this.background.x = fight.WIDTH * -1;
                this.freeBackground.x = fight.WIDTH;
            } else {
                this.background.x = 0;
                this.freeBackground.x = fight.WIDTH * -2;
            }

            let off:number = 0;
            if (this.hasTween && this._level != -1) {
                let prevConfig:StageConfig = Config.StageData[this._level];
                if (stageConfig.bgm == prevConfig.bgm) {
                    if (value > this._level) {
                        off = fight.WIDTH * -1;
                    } else if (value < this._level) {
                        off = fight.WIDTH;
                    }
                }
            }
            if (off) {
                this.move(off);
            }
            this._level = value;
        }
    }

    // 缓动
    protected move(off:number=0){

    }

    // 当移动完成后,把不在可视范围内的图片删除
    protected moveComplete(bitmap:egret.DisplayObject) {
        egret.Tween.removeTweens(bitmap);
    }
}