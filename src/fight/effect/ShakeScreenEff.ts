/**
 * 震屏效果
 * Created by hh on 2016/12/26.
 */
class ShakeScreenEff{
    public lastShakeTime: number = 0;
    private groundShakeSpeed:egret.Point = new egret.Point(0, 0);
    private groundShakeStrength:number;

    private target:egret.DisplayObject;
    private startX:number = 0;
    private startY:number = 0;
    private static isShaking:boolean = false;

    public constructor(target:egret.DisplayObject) {
        this.target = target;
        this.startX = target.x;
        this.startY = target.y;
    }

    public startShake(type:number=1): void {
        if (!ShakeScreenEff.isShaking){
            ShakeScreenEff.isShaking = true;
            let now: number = egret.getTimer();
            if (now - this.lastShakeTime >= 200) {
                this.lastShakeTime = now;
                this.stopShake();
                this.groundShakeSpeed.x = 2 * type;
                this.groundShakeSpeed.y = 2 * type;
                this.groundShakeStrength = -3 * type;
                egret.startTick(this.onShakeTicker, this);
            }
        }
    }

    public stopShake(): void {
        ShakeScreenEff.isShaking = false;
        this.target.x = this.startX;
        this.target.y = this.startY;
        egret.stopTick(this.onShakeTicker, this);
    }

    private onShakeTicker() {
        this.target.x = this.target.x + this.groundShakeSpeed.x;
        this.target.y = this.target.y + this.groundShakeSpeed.y;
        if (this.groundShakeStrength < 0) {
            this.groundShakeSpeed.x = this.groundShakeSpeed.x - 2;
            this.groundShakeSpeed.y = this.groundShakeSpeed.y - 2;
            if(this.groundShakeSpeed.x <= this.groundShakeStrength) {
                this.groundShakeStrength = -(this.groundShakeStrength + 1);
            }
        } else if(this.groundShakeStrength > 0) {
            this.groundShakeSpeed.x = this.groundShakeSpeed.x + 2;
            this.groundShakeSpeed.y = this.groundShakeSpeed.y + 2;
            if(this.groundShakeSpeed.x >= this.groundShakeStrength) {
                this.groundShakeStrength = -(this.groundShakeStrength - 1);
            }
        } else {
            this.stopShake();
        }
        return false;
    }

    public dispose(){
        this.stopShake();
        this.groundShakeSpeed = null;
        this.target = null;
    }
}
