/**
 * Created by hh on 2016/12/9.
 */
/** 同步战斗 */
var NetFightSyncCmd = (function (_super) {
    __extends(NetFightSyncCmd, _super);
    function NetFightSyncCmd() {
        _super.apply(this, arguments);
    }
    var d = __define,c=NetFightSyncCmd,p=c.prototype;
    p.execute = function () {
        UserProxy.inst.curArea = this.data.curArea;
        EventManager.inst.dispatch(ContextEvent.PVE_SYNC_RES, this.data);
    };
    return NetFightSyncCmd;
}(BaseCmd));
egret.registerClass(NetFightSyncCmd,'NetFightSyncCmd');
/** 布阵 */
var NetFormationCmd = (function (_super) {
    __extends(NetFormationCmd, _super);
    function NetFormationCmd() {
        _super.apply(this, arguments);
    }
    var d = __define,c=NetFormationCmd,p=c.prototype;
    p.execute = function () {
        if (this.data && this.data.msg) {
            UserProxy.inst.fightData.changePVEFormation(UserProxy.inst.battle_pos);
            UserProxy.inst.fightData.ensurePVEFormation();
        }
    };
    return NetFormationCmd;
}(BaseCmd));
egret.registerClass(NetFormationCmd,'NetFormationCmd');
/** PVP请求战斗数据 */
var NetPVPReqFightDataCmd = (function (_super) {
    __extends(NetPVPReqFightDataCmd, _super);
    function NetPVPReqFightDataCmd() {
        _super.apply(this, arguments);
    }
    var d = __define,c=NetPVPReqFightDataCmd,p=c.prototype;
    p.execute = function () {
        EventManager.inst.dispatch(ContextEvent.PVP_FIGHT_DATA_RES, this.data);
    };
    return NetPVPReqFightDataCmd;
}(BaseCmd));
egret.registerClass(NetPVPReqFightDataCmd,'NetPVPReqFightDataCmd');
//# sourceMappingURL=NetFightCmd.js.map