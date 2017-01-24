/**
 * PVE 近景
 * Created by hh on 2016/12/21.
 */
class PVEForeground extends egret.DisplayObjectContainer {

    protected hasTween:boolean = true;
    protected priority:number = 0;
    protected background1:PriorityImage;
    protected background2:PriorityImage;
    protected _level:number = -1;
    protected dir = 1;

    public constructor(hasTween:boolean = true) {
        super();
        this.hasTween = hasTween;
        this.priority = fight.LOAD_PRIORITY_MAP_PROSPECT;
        this.background1 = new PriorityImage(this.priority);
        this.addChild(this.background1);
        if (hasTween) {
            this.background2 = new PriorityImage(this.priority);
            this.background2.x = fight.WIDTH * 2;
            this.addChild(this.background2);
        }
        egret.startTick(this.checkResHeight, this);
    }

    private checkResHeight() {
        if (this.background1 && this.background1.height > 0) {
            this.background1.y = fight.MAP_SIZE_HEIGHT - this.background1.height + (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        if (this.background2 && this.background2.height > 0) {
            this.background2.y = fight.MAP_SIZE_HEIGHT - this.background2.height + (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        return false;
    }

    protected getSceneResourcePath(level:number) {
        let stageConfig:StageCommonConfig = Config.StageCommonData[Math.ceil(level / fight.MAP_SWITCH_SIZE)];
        let map:string = stageConfig.map;
        return `${map}_1_png`;
    }

    public set source(value:string){
       let path = `${value}_1_png`;
       this.background1.source = path;
    }

    /**
     * 关卡等级
     * @param value
     */
    public set level(value:number) {
        if (value != this._level) {
            let stageConfig:StageCommonConfig = Config.StageCommonData[Math.ceil(value / fight.MAP_SWITCH_SIZE)];
            if (!stageConfig)  return;
            this.background1.source = this.getSceneResourcePath(value);
            if (this.hasTween) {
                this.background2.source = this.getSceneResourcePath(value);
                let off:number = 0;
                if (this._level != -1) {
                    let prevConfig:StageCommonConfig = Config.StageCommonData[Math.ceil(this._level / fight.MAP_SWITCH_SIZE)];
                    if (stageConfig.bgm == prevConfig.bgm) {
                        if (value > this._level) {
                            off = -1;
                        } else if (value < this._level) {
                            off = 1;
                        }
                    }
                }
                if (off) {
                    this.move(off);
                }
            }
            this._level = value;
        }
    }

    // 缓动
    protected move(dir:number) {
        this.dir = dir;
        let off = fight.FORE_GROUND_MOVE_DISTANCE * dir;
        let time = fight.FORE_GROUND_MOVE_TIME;

        let leftBitmap = this.background1;
        let rightBitmap = this.background2;
        if (this.background1.x > this.background2.x) {
            leftBitmap = this.background2;
            rightBitmap = this.background1;
        }
        if (this.dir == 1) {
            if (rightBitmap.x >= fight.WIDTH * 2) {
                rightBitmap.x = rightBitmap.x - fight.WIDTH * 4;
            }
        } else {
            if (leftBitmap.x <= fight.WIDTH * -2) {
                leftBitmap.x = leftBitmap.x + fight.WIDTH * 4;
            }
        }

        let tween = egret.Tween.get(this.background1);
        tween.to({x:(this.background1.x + off)}, time);

        tween = egret.Tween.get(this.background2);
        tween.to({x:(this.background2.x + off)}, time);
    }
}
