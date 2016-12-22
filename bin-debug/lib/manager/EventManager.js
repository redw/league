/**
 * 事件管理
 * @author j
 *
 */
var EventManager = (function (_super) {
    __extends(EventManager, _super);
    function EventManager() {
        _super.apply(this, arguments);
    }
    var d = __define,c=EventManager,p=c.prototype;
    d(EventManager, "inst"
        ,function () {
            if (EventManager._instance == null) {
                EventManager._instance = new EventManager();
            }
            return EventManager._instance;
        }
    );
    //----------------------------------------//
    p.dispatch = function (type, data) {
        if (data === void 0) { data = null; }
        this.dispatchEventWith(type, false, data);
    };
    return EventManager;
}(egret.EventDispatcher));
egret.registerClass(EventManager,'EventManager');
