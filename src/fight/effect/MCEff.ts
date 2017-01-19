/**
 * mc效果
 * Created by hh on 16/12/25.
 */
class MCEff extends egret.DisplayObjectContainer {
    private mc:egret.MovieClip;
    public autoDisAppear:boolean = false;
    private _scaleX:number = 1;
    private frameBacks = [];
    private _source:string = "";

    public constructor(value:string, autoDisAppear:boolean=true, scaleX:number = 1){
        super();
        this.autoDisAppear = autoDisAppear;
        this.source = value;
        this._scaleX = scaleX;
    }

    /**
     * 注册回调
     * @param frame
     * @param fun
     * @param scope
     * @param param
     */
    public registerBack(frame:number, fun:Function, scope:Object=null, param:any=null){
        if (!this.frameBacks || this.frameBacks.length == 0) {
            this.frameBacks = [];
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
        for (let i = 0; i <= len; i++) {
            this.triggerFun(i);
        }
    }

    public get source(){
        return this._source;
    }

    public set source(value:string) {
        this._source = value;
        // let dataRes:any = RES.getRes(value + "_json");
        // let textureRes:any = RES.getRes(value + "_png");
        // if (!dataRes || !textureRes) {
        //     return;
        // }
        this.mc = FightRole.createMovieClip(value);
        egret.callLater(()=>{
            if (!this.mc || this.mc.totalFrames == 0) {
                this.onComplete();
            } else {
                let totalFrame = this.mc.totalFrames;
                if (this.frameBacks) {
                    let keys = Object.keys(this.frameBacks);
                    for (let i = 0; i < keys.length; i++) {
                        let key = +keys[i];
                        if (key <= 0 || key > totalFrame) {
                            let callInfo = this.frameBacks[key];
                            delete this.frameBacks[key];
                            this.frameBacks[totalFrame] = callInfo;
                        }
                    }
                }

                this.mc.scaleX = this._scaleX;
                this.mc.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);

                if (this.autoDisAppear) {
                    this.mc.gotoAndPlay(1, 1);
                    this.mc.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
                } else {
                    this.mc.gotoAndPlay(1, -1);
                }

                this.addChild(this.mc);
            }
        }, null);
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

            this.mc.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.mc.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);
            if (this.mc.parent)
                this.mc.parent.removeChild(this.mc);
            this.mc = null;
        }
        this.triggerFunArr();
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.frameBacks = [];
    }

    public getMC(){
        return this.mc;
    }

    public dispose(){
        this.onComplete();
    }
}