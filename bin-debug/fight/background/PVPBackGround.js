/**
 * pvp星河背景
 * Created by hh on 2017/1/18.
 */
var PVPBackGround = (function (_super) {
    __extends(PVPBackGround, _super);
    function PVPBackGround() {
        _super.call(this);
        this.INIT_X = -30;
        this.INIT_Y = -30;
        this.WIDTH = 740;
        this.SPEED = -0.5;
        this.EYE_INTERVAL = 200;
        this.EYE_COUNT = 10;
        this.EYE_DELAY = 3;
        this.intervalCount = 0;
        this.delayCount = 0;
        this.eyeCount = 0;
        this.state = 0;
        this.isOpeningEyes = false;
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
    var d = __define,c=PVPBackGround,p=c.prototype;
    // 生成眨眼参数
    p.generateEyeParam = function () {
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
    };
    p.onEnterFrame = function () {
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
        for (var i = 1; i <= 2; i++) {
            var bitmap = this["background" + i];
            bitmap.x += this.SPEED;
            if (bitmap.x <= (this.INIT_X - this.WIDTH)) {
                bitmap.x += 2 * this.WIDTH;
            }
        }
    };
    p.dispose = function () {
        this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
        this.background1 = null;
        this.background2 = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return PVPBackGround;
}(egret.DisplayObjectContainer));
egret.registerClass(PVPBackGround,'PVPBackGround');
//# sourceMappingURL=PVPBackGround.js.map