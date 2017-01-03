/**
 * Created by wanhong on 17/1/2.
 */
class MainView extends egret.DisplayObjectContainer {
    private randomTxt:egret.TextField;
    private testDataTxt:egret.TextField;
    private pvpTxt:egret.TextField;

    private curStateTxt:egret.TextField;
    private curMode:string = null;

    public constructor() {

        super();

        this.curStateTxt = new egret.TextField();
        this.curStateTxt.width = 460;
        this.curStateTxt.height = 200;
        this.curStateTxt.y = 500;
        this.curStateTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.addChild(this.curStateTxt);

        this.randomTxt = new egret.TextField();
        this.randomTxt.x = 0;
        this.randomTxt.y = 700;
        this.randomTxt.name = "random";
        this.randomTxt.touchEnabled = true;
        this.randomTxt.width = 150;
        this.randomTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.randomTxt.text = "随机测试";
        this.addChild(this.randomTxt);

        this.testDataTxt = new egret.TextField();
        this.testDataTxt.x = 150;
        this.testDataTxt.y = 700;
        this.testDataTxt.width = 150;
        this.testDataTxt.name = "test";
        this.testDataTxt.touchEnabled = true;
        this.testDataTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.testDataTxt.text = "验证数据";
        this.addChild(this.testDataTxt);

        this.pvpTxt = new egret.TextField();
        this.pvpTxt.x = 300;
        this.pvpTxt.y = 700;
        this.pvpTxt.width = 150;
        this.pvpTxt.name = "pvp";
        this.pvpTxt.touchEnabled = true;
        this.pvpTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.pvpTxt.text = "pvp测试";
        this.addChild(this.pvpTxt);

        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
    }

    private onTouch(e:egret.TouchEvent) {
        let mode = e.target.name;
        if (mode == this.curMode) {
            this.curMode = null;
        } else {
            this.curMode = e.target.name;
        }
        if (this.curMode == "random") {
            this.curStateTxt.text = "进行随机战斗,每次都前后端，匹配数据";
        } else if (this.curMode == "test") {
            this.curStateTxt.text = "进行数据测试";
        } else if (this.curMode == "pvp") {
            this.curStateTxt.text = "进行pvp测试";
        } else {
            this.curStateTxt.text = "";
        }
        fight.TEST_RANDOM = this.curMode == "random";
        fight.TEST_DATA = this.curMode == "test";
        if (fight.TEST_DATA) {
            fight.randomReq();
        }
        EventManager.inst.dispatch("change_mode");
    }
}