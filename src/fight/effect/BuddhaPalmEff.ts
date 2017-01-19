/**
 * Created by Administrator on 2017/1/14.
 */
// 如来神掌特效
class BuddhaPalmEff extends egret.DisplayObjectContainer{
    private mc:egret.MovieClip;

    public constructor(){
        super();

        this.mc = FightRole.createMovieClip("126_attack_source");
        this.addChild(this.mc);

        this.mc.addEventListener(egret.MovieClipEvent.COMPLETE, this.onIdle, this);
        this.mc.gotoAndPlay("up", 1);
    }

    private onIdle() {
        this.mc.removeEventListener(egret.MovieClipEvent.COMPLETE, this.onIdle, this);
        this.mc.gotoAndPlay("idle", -1);
    }

    public free(){
        this.mc.gotoAndPlay("down", 1);
        this.mc.addEventListener(egret.MovieClipEvent.COMPLETE, this.onComplete, this);
    }

    private onComplete(){
        this.mc.removeEventListener(egret.MovieClipEvent.COMPLETE, this.onComplete, this);
        this.removeChild(this.mc);
        this.mc.stop();
        this.dispatchEventWith(egret.Event.COMPLETE);
    }
}