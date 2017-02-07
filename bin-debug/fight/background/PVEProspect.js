/**
 * PVE 远景
 * Created by hh on 2016/12/21.
 */
var PVEProspect = (function (_super) {
    __extends(PVEProspect, _super);
    function PVEProspect(hasTween) {
        if (hasTween === void 0) { hasTween = true; }
        _super.call(this);
        this.priority = 0;
        this.hasTween = false;
        this.moveCompleteCount = 0;
        this._level = -1;
        this.dir = 1;
        this.hasTween = hasTween;
        this.priority = fight.LOAD_PRIORITY_MAP_BACKGROUND;
        this.moveDistance = fight.BACK_GROUND_MOVE_DISTANCE;
        this.background1 = new PriorityImage(this.priority);
        this.addChild(this.background1);
        if (hasTween) {
            this.background2 = new PriorityImage(this.priority);
            this.background2.x = fight.WIDTH * 2;
            this.addChild(this.background2);
        }
        egret.startTick(this.checkResHeight, this);
    }
    var d = __define,c=PVEProspect,p=c.prototype;
    p.checkResHeight = function () {
        if (this.background1 && this.background1.height > 0) {
            this.background1.y = (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        if (this.background2 && this.background2 && this.background2.height > 0) {
            this.background2.y = (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        return false;
    };
    p.getSceneResourcePath = function (level) {
        var stageConfig = Config.StageCommonData[Math.ceil(level / fight.MAP_SWITCH_SIZE)];
        var map = stageConfig.map;
        return map + "_3_png";
    };
    d(p, "source",undefined
        ,function (value) {
            var path = value + "_3_png";
            this.background1.source = path;
        }
    );
    d(p, "level",undefined
        /**
         * 关卡等级
         * @param value
         */
        ,function (value) {
            if (value != this._level) {
                var stageConfig = Config.StageCommonData[Math.ceil(value / fight.MAP_SWITCH_SIZE)];
                if (!stageConfig)
                    return;
                this.background1.source = this.getSceneResourcePath(value);
                if (this.hasTween) {
                    this.moveCompleteCount = 0;
                    this.background2.source = this.getSceneResourcePath(value);
                    var off = 0;
                    if (this._level != -1) {
                        var prevConfig = Config.StageCommonData[Math.ceil(this._level / fight.MAP_SWITCH_SIZE)];
                        if (stageConfig.bgm == prevConfig.bgm) {
                            if (value > this._level) {
                                off = -1;
                            }
                            else if (value < this._level) {
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
    );
    // 缓动
    p.move = function (dir) {
        this.dir = dir;
        var off = this.moveDistance * dir;
        var time = fight.BACK_GROUND_MOVE_TIME;
        var leftBitmap = this.background1;
        var rightBitmap = this.background2;
        if (this.background1.x > this.background2.x) {
            leftBitmap = this.background2;
            rightBitmap = this.background1;
        }
        if (this.dir == 1) {
            if (rightBitmap.x >= fight.WIDTH * 2) {
                rightBitmap.x = rightBitmap.x - fight.WIDTH * 4;
            }
        }
        else {
            if (leftBitmap.x <= fight.WIDTH * -2) {
                leftBitmap.x = leftBitmap.x + fight.WIDTH * 4;
            }
        }
        var tween = egret.Tween.get(this.background1);
        tween.to({ x: (this.background1.x + off) }, time);
        tween = egret.Tween.get(this.background2);
        tween.to({ x: (this.background2.x + off) }, time);
    };
    return PVEProspect;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEProspect,'PVEProspect');
//# sourceMappingURL=PVEProspect.js.map