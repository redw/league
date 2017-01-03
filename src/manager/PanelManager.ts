/**
 * 面板管理
 * @author j
 *
 */
class PanelManager extends egret.HashObject
{
    private static _instance:PanelManager;

    static get inst():PanelManager
    {
        if (PanelManager._instance == null)
        {
            PanelManager._instance = new PanelManager();
        }
        return PanelManager._instance;
    }

    //----------------------------------------//

    public static BOTTOM_LAYER:string = "bottom";
    public static MIDDLE_LAYER:string = "middle";
    public static TOP_LAYER:string = "top";
    public static ALERT_LAYER:string = "alert";
    public static LAYER_LIST:string[] = [PanelManager.BOTTOM_LAYER,
        PanelManager.MIDDLE_LAYER, PanelManager.TOP_LAYER, PanelManager.ALERT_LAYER];

    private _layerMap:any = {};
    private _panelMap:any = {};

    public constructor()
    {
        super();
    }

    public init(root:egret.DisplayObjectContainer):void
    {
        for (var i:number = 0; i < PanelManager.LAYER_LIST.length; i++)
        {
            var name:string = PanelManager.LAYER_LIST[i];

            var layer:eui.Group = new eui.Group();
            layer.name = name;
            layer.width = Global.getStageWidth();
            layer.height = Global.getStageHeight();
            layer.touchEnabled = false;
            layer.touchChildren = true;
            root.addChild(layer);
            this._layerMap[layer.name] = layer;
        }
    }

    public getLayer(name:string):eui.Group
    {
        return this._layerMap[name];
    }

    public isShow(name:string):boolean
    {
        return name in this._panelMap;
    }

    public getPanelList():BasePanel[]
    {
        var list:BasePanel[] = [];

        for (var id in this._panelMap)
        {
            var panel:BasePanel = this._panelMap[id];
            list.push(panel);
        }
        return list;
    }

    public showPanel(name:string, data?:any):void
    {
        console.log("[ShowPanel] >>> ", name);

        var cls:any = egret.getDefinitionByName(name);
        var panel:BasePanel = this._panelMap[name];

        if (cls == null)
        {
            console.warn("[" + name + "] Class Not Defined....");
        }
        else
        {
            if (panel == null)
            {
                panel = new cls();
                panel.name = name;
            }
            this._panelMap[panel.name] = panel;

            if (panel.parent == null)
            {
                if (panel.mutex)
                {
                    var hideList:string[] = [];

                    for (var id in this._panelMap)
                    {
                        var hidePanel:BasePanel = this._panelMap[id];

                        if (hidePanel)
                        {
                            if (hidePanel.mutex && hidePanel != panel)
                            {
                                hideList.push(hidePanel.name);
                            }
                        }
                    }

                    for (var hidePanelName of hideList)
                    {
                        this.hidePanel(hidePanelName);
                    }
                }

                var layer:eui.Group = this._layerMap[panel.layer];

                // if (panel.modal)
                // {
                //     var modal:egret.Sprite = DisplayUtil.createMask(panel.modalAlpha);
                //     modal.name = panel.name + "_modal";
                //     layer.addChild(modal);
                // }

                layer.addChild(panel);
                this.playEffect(panel);
            }

            panel.setData(data);

            if (panel.soundOpen)
            {
                SoundManager.inst.playEffect("panel_open_mp3");
            }
            EventManager.inst.dispatch(ContextEvent.SHOW_PANEL, name);
        }
    }

    public hidePanel(name:string):void
    {
        console.log("[HidePanel] <<< ", name);
        var panel:BasePanel = this._panelMap[name];

        if (panel)
        {
            egret.Tween.removeTweens(panel);

            if (panel.parent)
            {
                var layer:eui.Group = this._layerMap[panel.layer];

                if (panel.modal)
                {
                    var asset:egret.DisplayObject = DisplayUtil.getChildByName(layer, panel.name + "_modal");

                    if (asset)
                    {
                        layer.removeChild(asset);
                    }
                }

                panel.destory();
                layer.removeChild(panel);
            }

            if (panel.soundClose)
            {
                SoundManager.inst.playEffect("panel_close_mp3");
            }
        }

        delete this._panelMap[name];
        EventManager.inst.dispatch(ContextEvent.HIDE_PANEL, name);
    }

    private playEffect(panel:BasePanel):void
    {
        egret.Tween.removeTweens(panel);

        var stageWidth:number = Global.getStageWidth();
        var stageHeight:number = Global.getStageHeight();

        switch (panel.effectType)
        {
            case 1:

                panel.x = panel.width / 2;
                panel.y = panel.height / 2;

                panel.scaleX = 0.5;
                panel.scaleY = 0.5;
                egret.Tween.get(panel).to({scaleX: 1, scaleY: 1, x: 0, y: 0}, 400, egret.Ease.backOut);

                break;

            case 2:

                panel.y = -800;
                egret.Tween.get(panel).to({y: (stageHeight - panel.height) / 2}, 400, egret.Ease.backOut);

                break;

            case 3:

                panel.y = 800;
                egret.Tween.get(panel).to({y: (stageHeight - panel.height) / 2}, 400, egret.Ease.backOut);

                break;

            case 4:

                panel.x = -480;
                egret.Tween.get(panel).to({x: (stageWidth - panel.width) / 2}, 400, egret.Ease.backOut);

                break;

            case 5:

                panel.x = 480;
                egret.Tween.get(panel).to({x: (stageWidth - panel.width) / 2}, 400, egret.Ease.backOut);

                break;
        }
    }
}