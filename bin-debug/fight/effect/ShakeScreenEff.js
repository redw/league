/**
 * 震屏效果
 * Created by hh on 2016/12/26.
 */
var ShakeScreenEff = (function () {
    function ShakeScreenEff(target) {
        this.lastShakeTime = 0;
        this.groundShakeSpeed = new egret.Point(0, 0);
        this.startX = 0;
        this.startY = 0;
        this.target = target;
        this.startX = target.x;
        this.startY = target.y;
    }
    var d = __define,c=ShakeScreenEff,p=c.prototype;
    p.startShake = function (type) {
        if (type === void 0) { type = 1; }
        if (!ShakeScreenEff.isShaking) {
            ShakeScreenEff.isShaking = true;
            var now = egret.getTimer();
            if (now - this.lastShakeTime >= 200) {
                this.lastShakeTime = now;
                this.stopShake();
                this.groundShakeSpeed.x = 4;
                this.groundShakeSpeed.y = 4;
                this.groundShakeStrength = -6 - (type - 1) * 3;
                egret.startTick(this.onShakeTicker, this);
            }
        }
    };
    p.stopShake = function () {
        ShakeScreenEff.isShaking = false;
        this.target.x = this.startX;
        this.target.y = this.startY;
        egret.stopTick(this.onShakeTicker, this);
    };
    p.onShakeTicker = function () {
        this.target.x = this.target.x + this.groundShakeSpeed.x;
        this.target.y = this.target.y + this.groundShakeSpeed.y;
        if (this.groundShakeStrength < 0) {
            this.groundShakeSpeed.x = this.groundShakeSpeed.x - 2;
            this.groundShakeSpeed.y = this.groundShakeSpeed.y - 2;
            if (this.groundShakeSpeed.x <= this.groundShakeStrength) {
                this.groundShakeStrength = -(this.groundShakeStrength + 1);
            }
        }
        else if (this.groundShakeStrength > 0) {
            this.groundShakeSpeed.x = this.groundShakeSpeed.x + 2;
            this.groundShakeSpeed.y = this.groundShakeSpeed.y + 2;
            if (this.groundShakeSpeed.x >= this.groundShakeStrength) {
                this.groundShakeStrength = -(this.groundShakeStrength - 1);
            }
        }
        else {
            this.stopShake();
        }
        return false;
    };
    p.dispose = function () {
        this.stopShake();
        this.groundShakeSpeed = null;
        this.target = null;
    };
    ShakeScreenEff.isShaking = false;
    return ShakeScreenEff;
}());
egret.registerClass(ShakeScreenEff,'ShakeScreenEff');
//# sourceMappingURL=ShakeScreenEff.js.map