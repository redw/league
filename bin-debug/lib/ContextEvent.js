var ContextEvent = (function (_super) {
    __extends(ContextEvent, _super);
    function ContextEvent() {
        _super.apply(this, arguments);
    }
    var d = __define,c=ContextEvent,p=c.prototype;
    ContextEvent.HTTP_OK = "HTTP_OK";
    ContextEvent.HTTP_ERROR = "HTTP_ERROR";
    ContextEvent.REFRESH_BASE = "REFRESH_BASE";
    ContextEvent.REFRESH_WEAPON = "REFRESH_WEAPON";
    ContextEvent.SHOW_PANEL = "SHOW_PANEL";
    ContextEvent.HIDE_PANEL = "HIDE_PANEL";
    ContextEvent.ROLE_DATA_UPDATE = "RoleData_Update";
    ContextEvent.PVE_SYNC_COMPETE = "PVE_SYNC_COMPETE";
    ContextEvent.REFRESH_TASK = "REFRESH_TASK";
    //
    ContextEvent.CHA_REMOVE = "CHA_REMOVE";
    ContextEvent.CHA_RESET = "CHA_RESET";
    ContextEvent.CHA_HURT = "CHA_HURT";
    ContextEvent.CHA_MOVE = "CHA_MOVE";
    return ContextEvent;
}(egret.HashObject));
egret.registerClass(ContextEvent,'ContextEvent');
