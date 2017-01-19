/**
 * 道具掉落
 * Created by hh on 2016/12/19.
 */
//     点击铜钱财神04播放飞字：+X.XX（金币图标）
//     点击元宝财神01播放飞字：+X.XX（元宝图标）
//     点击月光宝盒播放飞字：轮回次数+1
//     点击五指山播放：skill_ID为1261的技能效果    // 待做
//     点击金箍棒，在我方所有角色身上播放BUFF飞字：攻击翻倍
//     点击蟠桃，在我方所有角色身上播放回血特效和回血飞字

class DropItem extends egret.DisplayObjectContainer {
    private propEff:MCEff;
    private _dropId:number = -1;

    public constructor(){
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
    }

    private addToStage(e:egret.Event) {
        if (this.propEff) {
            const mc = this.propEff.getMC();
            if (mc && mc.isPlaying == false) {
                mc.gotoAndPlay(1, -1);
            }
        }
    }

    public stop(){
        const mc = this.propEff ? this.propEff.getMC() : null;
        if (mc && mc.isPlaying) {
            mc.stop();
        }
    }

    public set dropId(value:number) {
        if (this._dropId != value) {
            if (value) {
                this.touchEnabled = false;
                let eff = new MCEff("item_appear_effect");
                eff.addEventListener(egret.Event.COMPLETE, this.showProp, this);
                this.addChild(eff);
            } else {
                if (this.propEff) {
                    this.propEff.dispose();
                    this.propEff = null;
                }
            }
        }
        this._dropId = value;
    }

    public  get dropId(){
        return this._dropId;
    }

    private showProp(){
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
        let config:FightDropConfig = Config.DropData[this._dropId];
        this.propEff = new MCEff(config.resource, false);
        this.addChild(this.propEff);

    }

    private onTouchTap(){
        this.touchEnabled = false;
        this.removeChild(this.propEff);
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
        let eff = new MCEff("item_disappear_effect");
        eff.addEventListener(egret.Event.COMPLETE, this.dispose, this);
        this.addChild(eff);
    }

    private dispose(e:egret.Event = null){
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.dispose, this);
        }
        let propId = this._dropId;
        switch (propId) {
            case 1:
            case 2:
            case 3:
                EventManager.inst.dispatch("use_prop", propId);
                break;

            // 获得转生次数+1
            case 4:
                Http.inst.send(CmdID.PROP_USE, {id:propId});
                break;

            // 小财神
            case 5:
                Http.inst.send(CmdID.PROP_USE, {id:propId});
                break;

            // 大财神
            case 6:
                Http.inst.send(CmdID.PROP_USE, {id:propId});
                break;
        }
        this._dropId = 0;
        this.propEff = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}