/**
 * PVE或BOSS战背景图
 * Created by hh on 2016/12/21.
 */
var PVEBackGround = (function (_super) {
    __extends(PVEBackGround, _super);
    function PVEBackGround(hasTween, priority) {
        if (hasTween === void 0) { hasTween = true; }
        _super.call(this);
        this._level = -1;
        this.priority = 0;
        this.hasTween = false;
        this.hasTween = hasTween;
        this.priority = priority;
        this.background = new PriorityImage(this.priority);
        this.addChild(this.background);
        if (hasTween) {
            this.freeBackground = new PriorityImage(this.priority);
            this.addChild(this.freeBackground);
        }
    }
    var d = __define,c=PVEBackGround,p=c.prototype;
    p.getSceneResourcePath = function (level) {
        return "";
    };
    d(p, "level",undefined
        ,function (value) {
            if (value != this._level) {
                var stageConfig = Config.StageCommonData[Math.ceil(value / fight.MAP_SWITCH_SIZE)];
                if (!stageConfig)
                    return;
                this.background.source = this.getSceneResourcePath(value);
                this.freeBackground.source = this.getSceneResourcePath(value);
                if (value % 2 == 0) {
                    this.background.x = fight.WIDTH * -1;
                    this.freeBackground.x = fight.WIDTH;
                }
                else {
                    this.background.x = 0;
                    this.freeBackground.x = fight.WIDTH * -2;
                }
                var off = 0;
                if (this.hasTween && this._level != -1) {
                    var prevConfig = Config.StageCommonData[Math.ceil(this._level / fight.MAP_SWITCH_SIZE)];
                    if (stageConfig.map == prevConfig.map) {
                        if (value > this._level) {
                            off = fight.WIDTH * -1;
                        }
                        else if (value < this._level) {
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
    );
    // 缓动
    p.move = function (off) {
        if (off === void 0) { off = 0; }
    };
    // 当移动完成后,把不在可视范围内的图片删除
    p.moveComplete = function (bitmap) {
        egret.Tween.removeTweens(bitmap);
    };
    return PVEBackGround;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEBackGround,'PVEBackGround');
//# sourceMappingURL=PVEBackGround.js.map