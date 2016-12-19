/**
 * Created by wanhong on 16/12/20.
 */
class FrameEventTrigger {
    private mc:egret.MovieClip;
    private frameBacks:any[];

    public constructor(mc:egret.MovieClip) {
        this.mc = mc;
        if (!mc.isPlaying) {
            mc.gotoAndPlay(1, 1);
        }
        this.mc.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    }

    private onEnterFrame(e:egret.Event) {
        var curFrame = this.mc.currentFrame;
        var totalFrame = this.mc.totalFrames;
        let frameBack = this.frameBacks[curFrame - 1];
        if (frameBack) {
            frameBack[0].call(frameBack[1], frameBack[2]);
            this.frameBacks[curFrame - 1] = null;
        }

        if (curFrame >= totalFrame) {
            this.mc.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            for (var i = 0; i < this.frameBacks.length; i++) {
                let frameBack = this.frameBacks[curFrame - 1];
                if (frameBack) {
                    frameBack[0].call(frameBack[1], frameBack[2]);
                    this.frameBacks[curFrame - 1] = null;
                }
            }
            this.dispose();
        }
    }

    public registerFrameBack(frame:number, fun:Function, score?:any, param?:any){
        var totalFrame = this.mc.totalFrames;
        if (!this.frameBacks) {
            this.frameBacks = Array(totalFrame);
        }
        if (frame >= totalFrame || frame == 0) {
            frame = totalFrame;

        }
        this.frameBacks[frame - 1] = [fun, score, param];
    }

    private dispose(){
        this.mc = null;
        this.frameBacks = null;
    }
}