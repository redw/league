/**
 * 弹窗面板
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
var Alert = (function (_super) {
    __extends(Alert, _super);
    function Alert() {
        _super.call(this);
        this.skinName = "AlertSkin";
        this._modal = true;
        this.horizontalCenter = 0;
        this.verticalCenter = 0;
        this._layer = PanelManager.TOP_LAYER;
    }
    var d = __define,c=Alert,p=c.prototype;
    Alert.show = function (msg, modal, select, okFunc, cancelFunc, thisObject, okLabel, cancelLabel) {
        var isAlertPanelShow = PanelManager.inst.isShow("Alert");
        if (isAlertPanelShow) {
            Alert._queue.push({
                msg: msg, modal: modal, select: select,
                okFunc: okFunc, cancelFunc: cancelFunc,
                thisObject: thisObject, okLabel: okLabel,
                cancelLabel: cancelLabel
            });
        }
        else {
            PanelManager.inst.showPanel("Alert", {
                msg: msg,
                modal: modal,
                select: select,
                okFunc: okFunc,
                cancelFunc: cancelFunc,
                thisObject: thisObject,
                okLabel: okLabel,
                cancelLabel: cancelLabel
            });
        }
    };
    Alert.showNextAlert = function () {
        if (Alert._queue.length > 0) {
            var info = Alert._queue.shift();
            PanelManager.inst.showPanel("Alert", {
                msg: info["msg"],
                modal: info["modal"],
                select: info["select"],
                okFunc: info["okFunc"],
                cancelFunc: info["cancelFunc"],
                thisObject: info["thisObject"],
                okLabel: info["okLabel"],
                cancelLabel: info["cancelLabel"]
            });
        }
        else {
            PanelManager.inst.hidePanel("Alert");
        }
    };
    p.initData = function () {
        _super.prototype.initData.call(this);
        if (this._data["okLabel"] != null) {
            this.okBtn["labelDisplay0"].text = this._data["okLabel"];
            this.sureBtn["labelDisplay0"].text = this._data["okLabel"];
        }
        else {
            this.okBtn["labelDisplay0"].text = "确 定";
            this.sureBtn["labelDisplay0"].text = "确 定";
        }
        if (this._data["cancelLabel"] != null) {
            this.cancelBtn["labelDisplay0"].text = this._data["cancelLabel"];
        }
        else {
            this.cancelBtn["labelDisplay0"].text = "取 消";
        }
        if (typeof (this._data["msg"]) == "string") {
            this.msgTxt.text = this._data["msg"];
        }
        else {
            this.msgTxt.textFlow = this._data["msg"];
        }
        if (this._data["select"] != null && this._data["select"] == true) {
            this.okBtn.visible = false;
            this.sureBtn.visible = true;
            this.cancelBtn.visible = true;
        }
        else {
            this.okBtn.visible = true;
            this.sureBtn.visible = false;
            this.cancelBtn.visible = false;
        }
    };
    d(p, "okText",undefined
        ,function (value) {
            this.okBtn.label = value;
            this.sureBtn.label = value;
        }
    );
    d(p, "cancelText",undefined
        ,function (value) {
            this.cancelBtn.label = value;
        }
    );
    p.destory = function () {
        this.okBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onOkButtonClick, this);
        this.sureBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onOkButtonClick, this);
        this.cancelBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onCancelButtonClick, this);
    };
    p.init = function () {
        this.okBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onOkButtonClick, this);
        this.sureBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onOkButtonClick, this);
        this.cancelBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCancelButtonClick, this);
        _super.prototype.init.call(this);
    };
    p.onOkButtonClick = function (event) {
        var func = this._data["okFunc"];
        if (func != null) {
            func.call(this._data["thisObject"]);
        }
        Alert.showNextAlert();
    };
    p.onCancelButtonClick = function (event) {
        var func = this._data["cancelFunc"];
        if (func != null) {
            func.call(this._data["thisObject"]);
        }
        Alert.showNextAlert();
    };
    Alert._queue = [];
    return Alert;
}(BasePanel));
egret.registerClass(Alert,'Alert');
//# sourceMappingURL=Alert.js.map