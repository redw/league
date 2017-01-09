/**
 * 基本的mc效果
 * Created by hh on 2016/11/24.
 */
class BaseMCEffect extends egret.DisplayObjectContainer {
    private mc:egret.MovieClip;
    private _back:Function;
    private param:any;
    private autoDisAppear:boolean = false;
    private frameBacks:Function[];
    private _scaleX:number = 1;

    public constructor(value:string, param?:any, autoDisAppear:boolean=true, scaleX:number=1) {
        super();
        this.param = param;
        this.autoDisAppear = autoDisAppear;
        this._scaleX = scaleX;
        if (value) {
            this.source = value;
        }
    }

    public registerFrameBack(fun:Function, frame:number){
        if (!this.mc) {
            fun(this.param);
            return;
        }
        let totalFrame = this.mc.totalFrames;
        if (!this.frameBacks) {
            this.frameBacks = Array(totalFrame);
            egret.startTick(this.onTick, this);
        }
        if (frame >= totalFrame || frame == 0) {
            frame = totalFrame;
        }
        this.frameBacks[frame] = fun;
    }

    private onTick(){
        let curFrame = this.mc.currentFrame;
        if (this.frameBacks[curFrame]) {
            this.frameBacks[curFrame]();
            delete this.frameBacks[curFrame];
        }
        return false;
    }

    public set back(value:Function) {
        this._back = value;
    }

    public set source(value:string) {
        this.mc = FightRole.createMovieClip(value);
        if (this.mc.totalFrames == 0) {
            this.dispose();
            console.error(`资源 ${value} 有问题`);
            return;
        }
        this.mc.scaleX = this._scaleX;
        this.mc.gotoAndPlay(1, 1);
        if (this.autoDisAppear)
            this.mc.addEventListener(egret.Event.COMPLETE, this.dispose, this);
        this.addChild(this.mc);
    }

    public dispose() {
        egret.stopTick(this.onTick, this);

        // 回调当前帧,防止跳帧?
        if (this.frameBacks) {
            for (let key in this.frameBacks) {
                this.frameBacks[key] || this.frameBacks[key]();
            }
        }
        if (this.mc){
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
    }
}