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
    ContextEvent.FRIEND_POINT = "FRIEND_POINT";
    ContextEvent.REFRESH_TASK = "REFRESH_TASK";
    ContextEvent.DELETA_MAIL = "DELETA_MAIL";
    ContextEvent.PVP_CHANGE_POS = "PVP_CHANGE_POS";
    ContextEvent.PVP_CHANGE_END = "PVP_CHANGE_END";
    ContextEvent.PVP_SHOP_BUY = "PVP_SHOP_BUY";
    ContextEvent.BATTLE_CHANGE_POS = "BATTLE_CHANGE_POS";
    ContextEvent.BATTLE_CHANGE_END = "BATTLE_CHANGE_END";
    ContextEvent.BATTLE_CHANGE_CELL = "BATTLE_CHANGE_CELL";
    ContextEvent.CHANGE_ROLE_SHOW = "CHANGE_ROLE_SHOW";
    // pve战斗同步
    ContextEvent.PVE_SYNC_RES = "PVE_SYNC_RES";
    // 变阵
    ContextEvent.PVE_CHANGE_FORMATION_RES = "PVE_CHANGE_FORMATION_RES";
    // 战斗血条进度
    ContextEvent.FIGHT_BLOOD_PROGRESS = "FIGHT_BLOOD_PROGRESS";
    // 战斗预警
    ContextEvent.FIGHT_WARN = "FIGHT_WARN";
    // pvp战斗数据
    ContextEvent.PVP_FIGHT_DATA_RES = "PVP_FIGHT_DATA_RES";
    ContextEvent.FIGHT_ROLE_HP_CHANGE = "FIGHT_ROLE_HP_CHANGE";
    // 战斗结速
    ContextEvent.FIGHT_END = "fight_end";
    ContextEvent.PVP_REFRESH_ROLE_REQ = "PVP_REFRESH_ROLE_REQ";
    //
    ContextEvent.CHA_REMOVE = "CHA_REMOVE";
    ContextEvent.CHA_RESET = "CHA_RESET";
    ContextEvent.CHA_HURT = "CHA_HURT";
    ContextEvent.CHA_MOVE = "CHA_MOVE";
    return ContextEvent;
}(egret.HashObject));
egret.registerClass(ContextEvent,'ContextEvent');
//# sourceMappingURL=ContextEvent.js.map