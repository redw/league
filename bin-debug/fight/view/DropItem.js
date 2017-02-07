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
var DropItem = (function (_super) {
    __extends(DropItem, _super);
    function DropItem() {
        _super.call(this);
        this._dropId = -1;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
    }
    var d = __define,c=DropItem,p=c.prototype;
    p.addToStage = function (e) {
        if (this.propEff) {
            var mc = this.propEff.getMC();
            if (mc && mc.isPlaying == false) {
                mc.gotoAndPlay(1, -1);
            }
        }
    };
    p.stop = function () {
        var mc = this.propEff ? this.propEff.getMC() : null;
        if (mc && mc.isPlaying) {
            mc.stop();
        }
    };
    d(p, "dropId"
        ,function () {
            return this._dropId;
        }
        ,function (value) {
            if (this._dropId != value) {
                if (value) {
                    this.touchEnabled = false;
                    var eff = new MCEff("item_appear_effect");
                    eff.addEventListener(egret.Event.COMPLETE, this.showProp, this);
                    this.addChild(eff);
                }
                else {
                    if (this.propEff) {
                        this.propEff.dispose();
                        this.propEff = null;
                    }
                }
            }
            this._dropId = value;
        }
    );
    p.showProp = function () {
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
        var config = Config.DropData[this._dropId];
        this.propEff = new MCEff(config.resource, false);
        this.addChild(this.propEff);
    };
    p.onTouchTap = function () {
        this.touchEnabled = false;
        this.removeChild(this.propEff);
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
        var eff = new MCEff("item_disappear_effect");
        eff.addEventListener(egret.Event.COMPLETE, this.dispose, this);
        this.addChild(eff);
    };
    p.dispose = function (e) {
        if (e === void 0) { e = null; }
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.dispose, this);
        }
        var propId = this._dropId;
        switch (propId) {
            case 1:
            case 2:
            case 3:
                EventManager.inst.dispatch("use_prop", propId);
                break;
            // 获得转生次数+1
            case 4:
                Http.inst.send(CmdID.PROP_USE, { id: propId });
                break;
            // 小财神
            case 5:
                Http.inst.send(CmdID.PROP_USE, { id: propId });
                break;
            // 大财神
            case 6:
                Http.inst.send(CmdID.PROP_USE, { id: propId });
                break;
        }
        this._dropId = 0;
        this.propEff = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return DropItem;
}(egret.DisplayObjectContainer));
egret.registerClass(DropItem,'DropItem');
//# sourceMappingURL=DropItem.js.map