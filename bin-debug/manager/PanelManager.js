/**
 * 面板管理
 * @author j
 *
 */
var PanelManager = (function (_super) {
    __extends(PanelManager, _super);
    function PanelManager() {
        _super.call(this);
        this._layerMap = {};
        this._panelMap = {};
    }
    var d = __define,c=PanelManager,p=c.prototype;
    d(PanelManager, "inst"
        ,function () {
            if (PanelManager._instance == null) {
                PanelManager._instance = new PanelManager();
            }
            return PanelManager._instance;
        }
    );
    p.init = function (root) {
        for (var i = 0; i < PanelManager.LAYER_LIST.length; i++) {
            var name = PanelManager.LAYER_LIST[i];
            var layer = new eui.Group();
            layer.name = name;
            layer.width = Global.getStageWidth();
            layer.height = Global.getStageHeight();
            layer.touchEnabled = false;
            layer.touchChildren = true;
            root.addChild(layer);
            this._layerMap[layer.name] = layer;
        }
    };
    p.getLayer = function (name) {
        return this._layerMap[name];
    };
    p.isShow = function (name) {
        return name in this._panelMap;
    };
    p.getPanelList = function () {
        var list = [];
        for (var id in this._panelMap) {
            var panel = this._panelMap[id];
            list.push(panel);
        }
        return list;
    };
    p.showPanel = function (name, data) {
        console.log("[ShowPanel] >>> ", name);
        var cls = egret.getDefinitionByName(name);
        var panel = this._panelMap[name];
        if (cls == null) {
            console.warn("[" + name + "] Class Not Defined....");
        }
        else {
            if (panel == null) {
                panel = new cls();
                panel.name = name;
            }
            this._panelMap[panel.name] = panel;
            if (panel.parent == null) {
                if (panel.mutex) {
                    var hideList = [];
                    for (var id in this._panelMap) {
                        var hidePanel = this._panelMap[id];
                        if (hidePanel) {
                            if (hidePanel.mutex && hidePanel != panel) {
                                hideList.push(hidePanel.name);
                            }
                        }
                    }
                    for (var _i = 0, hideList_1 = hideList; _i < hideList_1.length; _i++) {
                        var hidePanelName = hideList_1[_i];
                        this.hidePanel(hidePanelName);
                    }
                }
                var layer = this._layerMap[panel.layer];
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
            if (panel.soundOpen) {
                SoundManager.inst.playEffect("panel_open_mp3");
            }
            EventManager.inst.dispatch(ContextEvent.SHOW_PANEL, name);
        }
    };
    p.hidePanel = function (name) {
        console.log("[HidePanel] <<< ", name);
        var panel = this._panelMap[name];
        if (panel) {
            egret.Tween.removeTweens(panel);
            if (panel.parent) {
                var layer = this._layerMap[panel.layer];
                if (panel.modal) {
                    var asset = DisplayUtil.getChildByName(layer, panel.name + "_modal");
                    if (asset) {
                        layer.removeChild(asset);
                    }
                }
                panel.destory();
                layer.removeChild(panel);
            }
            if (panel.soundClose) {
                SoundManager.inst.playEffect("panel_close_mp3");
            }
        }
        delete this._panelMap[name];
        EventManager.inst.dispatch(ContextEvent.HIDE_PANEL, name);
    };
    p.playEffect = function (panel) {
        egret.Tween.removeTweens(panel);
        var stageWidth = Global.getStageWidth();
        var stageHeight = Global.getStageHeight();
        switch (panel.effectType) {
            case 1:
                panel.x = panel.width / 2;
                panel.y = panel.height / 2;
                panel.scaleX = 0.5;
                panel.scaleY = 0.5;
                egret.Tween.get(panel).to({ scaleX: 1, scaleY: 1, x: 0, y: 0 }, 400, egret.Ease.backOut);
                break;
            case 2:
                panel.y = -800;
                egret.Tween.get(panel).to({ y: (stageHeight - panel.height) / 2 }, 400, egret.Ease.backOut);
                break;
            case 3:
                panel.y = 800;
                egret.Tween.get(panel).to({ y: (stageHeight - panel.height) / 2 }, 400, egret.Ease.backOut);
                break;
            case 4:
                panel.x = -480;
                egret.Tween.get(panel).to({ x: (stageWidth - panel.width) / 2 }, 400, egret.Ease.backOut);
                break;
            case 5:
                panel.x = 480;
                egret.Tween.get(panel).to({ x: (stageWidth - panel.width) / 2 }, 400, egret.Ease.backOut);
                break;
        }
    };
    //----------------------------------------//
    PanelManager.BOTTOM_LAYER = "bottom";
    PanelManager.MIDDLE_LAYER = "middle";
    PanelManager.TOP_LAYER = "top";
    PanelManager.ALERT_LAYER = "alert";
    PanelManager.LAYER_LIST = [PanelManager.BOTTOM_LAYER,
        PanelManager.MIDDLE_LAYER, PanelManager.TOP_LAYER, PanelManager.ALERT_LAYER];
    return PanelManager;
}(egret.HashObject));
egret.registerClass(PanelManager,'PanelManager');
//# sourceMappingURL=PanelManager.js.map