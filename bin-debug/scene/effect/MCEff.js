/**
 * Created by wanhong on 16/12/25.
 */
var MCEff = (function (_super) {
    __extends(MCEff, _super);
    function MCEff(value, autoDisAppear) {
        if (autoDisAppear === void 0) { autoDisAppear = true; }
        _super.call(this);
        this.autoDisAppear = false;
        this.frameBacks = [];
        this.autoDisAppear = autoDisAppear;
        this.source = value;
    }
    var d = __define,c=MCEff,p=c.prototype;
    /**
     * 注册回调
     * @param frame
     * @param fun
     * @param scope
     * @param param
     */
    p.registerBack = function (frame, fun, scope, param) {
        var totalFrame = this.mc.totalFrames;
        if (!this.frameBacks) {
            this.frameBacks = Array(totalFrame);
        }
        if (frame >= totalFrame || frame == 0) {
            frame = totalFrame;
        }
        this.frameBacks[frame] = [fun, scope, param];
    };
    p.triggerFun = function (frame) {
        var len = this.frameBacks.length;
        if (this.frameBacks[frame]) {
            var fun = this.frameBacks[frame][0];
            var scope = this.frameBacks[frame][1];
            var param = this.frameBacks[frame][2];
            fun.call(scope, param);
            this.frameBacks[frame] = null;
        }
    };
    p.triggerFunArr = function () {
        var len = this.frameBacks.length;
        for (var i = 1; i <= len; i++) {
            this.triggerFun(i);
        }
    };
    d(p, "source",undefined
        ,function (value) {
            this.mc = FightRole.createMovieClip(value);
            if (!this.mc || this.mc.totalFrames == 0) {
                this.onComplete();
            }
            else {
                this.mc.gotoAndPlay(1, 1);
                this.mc.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
                if (this.autoDisAppear)
                    this.mc.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
                this.addChild(this.mc);
            }
        }
    );
    p.onEnterFrame = function () {
        var curFrame = this.mc.currentFrame;
        if (this.frameBacks[curFrame]) {
            var fun = this.frameBacks[curFrame][0];
            var scope = this.frameBacks[curFrame][1];
            var param = this.frameBacks[curFrame][2];
            fun.call(scope, param);
            this.frameBacks[curFrame] = null;
        }
        return false;
    };
    p.onComplete = function () {
        if (this.mc) {
            this.triggerFunArr();
            this.mc.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.mc.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
            if (this.mc.parent)
                this.mc.parent.removeChild(this.mc);
            this.mc = null;
        }
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.frameBacks = [];
    };
    return MCEff;
}(egret.DisplayObjectContainer));
egret.registerClass(MCEff,'MCEff');
//# sourceMappingURL=MCEff.js.map