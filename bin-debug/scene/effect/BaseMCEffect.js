/**
 * Created by hh on 2016/11/24.
 */
var BaseMCEffect = (function (_super) {
    __extends(BaseMCEffect, _super);
    function BaseMCEffect(value, param, autoDisAppear) {
        if (autoDisAppear === void 0) { autoDisAppear = true; }
        _super.call(this);
        this.autoDisAppear = false;
        this.param = param;
        this.autoDisAppear = autoDisAppear;
        if (!!value) {
            this.source = value;
        }
    }
    var d = __define,c=BaseMCEffect,p=c.prototype;
    p.registerFrameBack = function (fun, frame) {
        var totalFrame = this.mc.totalFrames;
        if (!this.frameBacks) {
            this.frameBacks = Array(totalFrame);
            egret.startTick(this.onTick, this);
        }
        if (frame >= totalFrame || frame == 0) {
            frame = totalFrame;
        }
        this.frameBacks[frame] = fun;
    };
    p.onTick = function () {
        var curFrame = this.mc.currentFrame;
        if (this.frameBacks[curFrame]) {
            this.frameBacks[curFrame]();
            delete this.frameBacks[curFrame];
        }
        return false;
    };
    d(p, "back",undefined
        ,function (value) {
            this._back = value;
        }
    );
    d(p, "source",undefined
        ,function (value) {
            this.mc = FightRole.createMovieClip(value);
            if (this.mc.totalFrames == 0) {
                this.dispose();
                console.error("\u8D44\u6E90 " + value + " \u6709\u95EE\u9898");
                return;
            }
            this.mc.gotoAndPlay(1, 1);
            if (this.autoDisAppear)
                this.mc.addEventListener(egret.Event.COMPLETE, this.dispose, this);
            this.addChild(this.mc);
        }
    );
    p.dispose = function () {
        egret.stopTick(this.onTick, this);
        // 回调当前帧,防止跳帧?
        if (this.frameBacks) {
            for (var key in this.frameBacks) {
                this.frameBacks[key] || this.frameBacks[key]();
            }
        }
        if (this.mc) {
            this.mc.removeEventListener(egret.Event.COMPLETE, this.dispose, this);
            if (this.mc.parent)
                this.mc.parent.removeChild(this.mc);
            this.mc = null;
        }
        if (this.parent) {
            this.parent.removeChild(this);
        }
        if (this._back) {
            this._back(this.param);
        }
        this._back = null;
        this.frameBacks = [];
    };
    return BaseMCEffect;
}(egret.DisplayObjectContainer));
egret.registerClass(BaseMCEffect,'BaseMCEffect');
//# sourceMappingURL=BaseMCEffect.js.map