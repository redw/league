/**
 * pvp星河背景
 * Created by hh on 2017/1/18.
 */
class PVPBackGround extends egret.DisplayObjectContainer {
    private INIT_X:number = -30;
    private INIT_Y:number = -30;
    private WIDTH:number = 740;
    private SPEED:number = -0.5;
    private EYE_INTERVAL:number = 200;
    private EYE_COUNT:number = 10;
    private EYE_DELAY:number = 3;
    private intervalCount:number = 0;
    private delayCount:number = 0;
    private eyeCount:number = 0;
    private state:number = 0;
    private isOpeningEyes:boolean = false;

    protected background1:PriorityImage;
    protected background2:PriorityImage;
    protected eysBackGround1:PriorityImage;
    protected eysBackGround2:PriorityImage;

    public constructor(){
        super();

        this.background1 = new PriorityImage(fight.LOAD_PRIORITY_STAR_SKY_BG, "star_sky_background_png");
        this.background2 = new PriorityImage(fight.LOAD_PRIORITY_STAR_SKY_BG, "star_sky_background_png");

        this.background1.x = this.INIT_X;
        this.background1.y = this.INIT_Y;
        this.addChild(this.background1);

        this.background2.x = this.INIT_X + this.WIDTH;
        this.background2.y = this.INIT_Y;
        this.addChild(this.background2);

        this.eysBackGround1 = new PriorityImage(fight.LOAD_PRIORITY_EYES, "eyes_open_png");
        this.eysBackGround1.x = 200;
        this.eysBackGround1.y = 0;
        this.addChild(this.eysBackGround1);

        this.eysBackGround2 = new PriorityImage(fight.LOAD_PRIORITY_EYES, "eyes_close_png");
        this.eysBackGround2.x = 200;
        this.eysBackGround2.y = 0;
        this.addChild(this.eysBackGround2);

        this.generateEyeParam();
        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
    }

    // 生成眨眼参数
    private generateEyeParam() {
        this.state = 0;
        this.intervalCount = 0;
        this.delayCount = 0;
        this.eyeCount = 0;
        this.EYE_INTERVAL = 48 + Math.floor(12 * Math.random());
        this.EYE_COUNT = 3 + Math.floor(2 * Math.random());
        if (this.EYE_COUNT % 2 == 1) {
            this.EYE_COUNT += 1;
        }
        this.EYE_DELAY = 2;
    }

    private onEnterFrame() {
        if (this.state == 0) {
            this.intervalCount++;
            if (this.intervalCount >= this.EYE_INTERVAL) {
                this.intervalCount = 0;
                this.state = 1;
            }
        }
        if (this.state == 1) {
            this.delayCount++;
            if (this.delayCount >= this.EYE_DELAY) {
                this.delayCount = 0;
                this.state = 2;
            }
        }
        if (this.state == 2) {
            this.eyeCount++;
            this.isOpeningEyes = !this.isOpeningEyes;
            this.eysBackGround2.visible = this.isOpeningEyes;
            this.eysBackGround1.visible = !this.isOpeningEyes;
            if (this.eyeCount >= this.EYE_COUNT) {
                this.generateEyeParam();
            }
        }

        for (let i = 1; i <= 2; i++) {
            let bitmap:egret.DisplayObject = this["background" + i];
            bitmap.x += this.SPEED;
            if (bitmap.x <= (this.INIT_X - this.WIDTH)) {
                bitmap.x += 2 * this.WIDTH;
            }
        }
    }

    public dispose(){
        this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
        this.background1 = null;
        this.background2 = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}
