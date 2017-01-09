/**
 * 弹窗面板
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
class Alert extends BasePanel
{
    public okBtn:eui.Button;
    public sureBtn: eui.Button;
    public cancelBtn: eui.Button;
    public msgTxt:eui.Label;

    private static _queue:any[] = [];
    static show(msg:any,
                modal?:boolean,
                select?:boolean,
                okFunc?:any,
                cancelFunc?:any,
                thisObject?:any,
                okLabel?:string,
                cancelLabel?:string):void
    {
        var isAlertPanelShow:Boolean = PanelManager.inst.isShow("Alert");
        if (isAlertPanelShow)
        {
            Alert._queue.push({
                msg: msg, modal: modal, select: select,
                okFunc: okFunc, cancelFunc: cancelFunc,
                thisObject: thisObject, okLabel: okLabel,
                cancelLabel: cancelLabel
            });
        }
        else
        {
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
    }

    static showNextAlert():void
    {
        if (Alert._queue.length > 0)
        {
            var info:any = Alert._queue.shift();
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
        else
        {
            PanelManager.inst.hidePanel("Alert");
        }
    }

    public constructor()
    {
        super();
        this.skinName = "AlertSkin";
        this._modal = true;
        this.horizontalCenter = 0;
        this.verticalCenter = 0;
        this._layer = PanelManager.TOP_LAYER;
    }

    public initData():void
    {
        super.initData();
        if (this._data["okLabel"] != null)
        {
            this.okBtn["labelDisplay0"].text = this._data["okLabel"];
            this.sureBtn["labelDisplay0"].text = this._data["okLabel"];
        }
        else
        {
            this.okBtn["labelDisplay0"].text  = "确 定";
            this.sureBtn["labelDisplay0"].text = "确 定";
        }
        if (this._data["cancelLabel"] != null)
        {
            this.cancelBtn["labelDisplay0"].text = this._data["cancelLabel"];
        }
        else
        {
            this.cancelBtn["labelDisplay0"].text = "取 消";
        }
        if (typeof(this._data["msg"]) == "string")
        {
            this.msgTxt.text = this._data["msg"];
        }
        else
        {
            this.msgTxt.textFlow = this._data["msg"];
        }
        if (this._data["select"] != null && this._data["select"] == true)
        {
            this.okBtn.visible = false;
            this.sureBtn.visible = true;
            this.cancelBtn.visible = true;
        }
        else
        {
            this.okBtn.visible = true;
            this.sureBtn.visible = false;
            this.cancelBtn.visible = false;
        }
    }

    set okText(value:string)
    {
        this.okBtn.label = value;
        this.sureBtn.label = value;
    }

    set cancelText(value:string)
    {
        this.cancelBtn.label = value;
    }

    public destory():void
    {
        this.okBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onOkButtonClick, this);
        this.sureBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onOkButtonClick,this);
        this.cancelBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onCancelButtonClick,this);
    }

    public init():void
    {
        this.okBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onOkButtonClick,this);
        this.sureBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onOkButtonClick,this);
        this.cancelBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onCancelButtonClick,this);
        super.init();
    }

    private onOkButtonClick(event:egret.TouchEvent):void
    {
        var func:Function = this._data["okFunc"];
        if (func != null)
        {
            func.call(this._data["thisObject"]);
        }
        Alert.showNextAlert();
    }

    private onCancelButtonClick(event:egret.TouchEvent):void
    {
        var func:Function = this._data["cancelFunc"];
        if (func != null)
        {
            func.call(this._data["thisObject"]);
        }
        Alert.showNextAlert();
    }
}