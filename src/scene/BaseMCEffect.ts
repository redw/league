/**
 * Created by honghong on 2016/11/24.
 */
class BaseMCEffect extends egret.DisplayObjectContainer {
    private mc:egret.MovieClip;
    private _back:Function;
    private param:any;
    private autoDisAppear:boolean = false;
    private frameBacks:Function[];

    public constructor(value:string, param?:any, autoDisAppear:boolean=true) {
        super();
        this.param = param;
        this.autoDisAppear = autoDisAppear;
        if (!!value) {
            this.source = value;
        }
    }

    public registerFrameBack(fun:Function, frame:number){
        var totalFrame = this.mc.totalFrames;
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
        return true;
    }

    public set back(value:Function) {
        this._back = value;
    }

    public set source(value:string) {
        this.mc = FightRole.createMovieClip(value);
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

        this.mc.removeEventListener(egret.Event.COMPLETE, this.dispose, this);
        this.removeChild(this.mc);
        // this.mc = null;
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