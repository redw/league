/**
 * Created by hh on 16/12/25.
 */
class MCEff extends egret.DisplayObjectContainer {
    private mc:egret.MovieClip;
    private autoDisAppear:boolean = false;
    private _scaleX:number = 1;
    private frameBacks = [];

    public constructor(value?:string, autoDisAppear:boolean=true, scaleX:number = 1){
        super();
        this.autoDisAppear = autoDisAppear;
        this._scaleX = scaleX;
        this.source = value;
    }

    /**
     * 注册回调
     * @param frame
     * @param fun
     * @param scope
     * @param param
     */
    public registerBack(frame:number, fun:Function, scope:Object=null, param:any=null){
        let totalFrame = this.mc.totalFrames;
        if (!this.frameBacks) {
            this.frameBacks = Array(totalFrame + 1);
        }
        if (frame >= totalFrame || frame == 0) {
            frame = totalFrame;
        }
        this.frameBacks[frame] = [fun, scope, param];
    }

    private triggerFun(frame:number){
        if (this.frameBacks[frame]) {
            let fun = this.frameBacks[frame][0];
            let scope = this.frameBacks[frame][1];
            let param = this.frameBacks[frame][2];
            fun.call(scope, param);
            this.frameBacks[frame] = null;
        }
    }

    private triggerFunArr(){
        let len = this.frameBacks.length;
        for (let i = 1; i <= len; i++) {
            this.triggerFun(i);
        }
    }

    public set source(value:string) {
        this.mc = FightRole.createMovieClip(value);
        if (!this.mc || this.mc.totalFrames == 0) {
            this.onComplete();
        } else {
            this.mc.scaleX = this._scaleX;
            this.mc.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.mc.gotoAndPlay(1, 1);
            if (this.autoDisAppear)
                this.mc.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
            this.addChild(this.mc);
        }
    }

    private onEnterFrame(){
        let curFrame = this.mc.currentFrame;
        if (this.frameBacks[curFrame]) {
            let fun = this.frameBacks[curFrame][0];
            let scope = this.frameBacks[curFrame][1];
            let param = this.frameBacks[curFrame][2];
            fun.call(scope, param);
            this.frameBacks[curFrame] = null;
        }
        return false;
    }

    private onComplete() {
        this.dispatchEventWith(egret.Event.COMPLETE);
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
    }
}