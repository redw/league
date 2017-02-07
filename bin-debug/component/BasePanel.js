/**
 * 面板基类
 * @author j
 *
 */
var BasePanel = (function (_super) {
    __extends(BasePanel, _super);
    function BasePanel() {
        _super.call(this);
        this._dataInited = false;
        this._childrenCreated = false;
        //层级
        this._layer = PanelManager.BOTTOM_LAYER;
        //互斥
        this._mutex = false;
        //灰底
        this._modal = false;
        //灰底ALPHA
        this._modalAlpha = 0.6;
        /*
         打开特效
         0：没有动画
         1：中间弹出
         2：上进
         3：下进
         4：左进
         5：右进
         */
        this._effectType = 0;
        this._soundOpen = false;
        this._soundClose = false;
    }
    var d = __define,c=BasePanel,p=c.prototype;
    d(p, "soundOpen"
        ,function () {
            return this._soundOpen;
        }
        ,function (val) {
            this._soundOpen = val;
        }
    );
    d(p, "soundClose"
        ,function () {
            return this._soundClose;
        }
        ,function (val) {
            this._soundClose = val;
        }
    );
    d(p, "effectType"
        ,function () {
            return this._effectType;
        }
        ,function (val) {
            this._effectType = val;
        }
    );
    p.setData = function (data) {
        this._data = data;
        this._dataInited = true;
        if (this._childrenCreated) {
            this.initData();
        }
    };
    p.childrenCreated = function () {
        _super.prototype.childrenCreated.call(this);
        this.init();
        this._childrenCreated = true;
        if (this._dataInited) {
            this.initData();
        }
    };
    d(p, "data"
        ,function () {
            return this._data;
        }
    );
    d(p, "layer"
        ,function () {
            return this._layer;
        }
    );
    d(p, "mutex"
        ,function () {
            return this._mutex;
        }
    );
    d(p, "modal"
        ,function () {
            return this._modal;
        }
    );
    d(p, "modalAlpha"
        ,function () {
            return this._modalAlpha;
        }
    );
    //初始化
    p.init = function () {
    };
    //初始化数据
    p.initData = function () {
    };
    //销毁处理
    p.destory = function () {
    };
    return BasePanel;
}(eui.Component));
egret.registerClass(BasePanel,'BasePanel');
//# sourceMappingURL=BasePanel.js.map