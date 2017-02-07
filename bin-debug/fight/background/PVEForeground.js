/**
 * PVE 近景
 * Created by hh on 2016/12/21.
 */
var PVEForeground = (function (_super) {
    __extends(PVEForeground, _super);
    function PVEForeground(hasTween) {
        if (hasTween === void 0) { hasTween = true; }
        _super.call(this);
        this.hasTween = true;
        this.priority = 0;
        this._level = -1;
        this.dir = 1;
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
    var d = __define,c=PVEForeground,p=c.prototype;
    p.checkResHeight = function () {
        if (this.background1 && this.background1.height > 0) {
            this.background1.y = fight.MAP_SIZE_HEIGHT - this.background1.height + (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        if (this.background2 && this.background2.height > 0) {
            this.background2.y = fight.MAP_SIZE_HEIGHT - this.background2.height + (fight.HEIGHT - fight.MAP_SIZE_HEIGHT) * 0.5;
        }
        return false;
    };
    p.getSceneResourcePath = function (level) {
        var stageConfig = Config.StageCommonData[Math.ceil(level / fight.MAP_SWITCH_SIZE)];
        var map = stageConfig.map;
        return map + "_1_png";
    };
    d(p, "source",undefined
        ,function (value) {
            var path = value + "_1_png";
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
        var off = fight.FORE_GROUND_MOVE_DISTANCE * dir;
        var time = fight.FORE_GROUND_MOVE_TIME;
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
    return PVEForeground;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEForeground,'PVEForeground');
//# sourceMappingURL=PVEForeground.js.map