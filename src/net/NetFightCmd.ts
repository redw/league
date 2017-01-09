/**
 * Created by hh on 2016/12/9.
 */
/** 同步战斗 */
class NetFightSyncCmd extends BaseCmd {
    public execute() {
        UserProxy.inst.curArea = this.data.curArea;
        EventManager.inst.dispatch(ContextEvent.PVE_SYNC_RES, this.data);
    }
}

/** 布阵 */
class NetFormationCmd extends  BaseCmd{
    public execute() {
        if (this.data && this.data.msg) {
            UserProxy.inst.fightData.changePVEFormation(UserProxy.inst.battle_pos);
            UserProxy.inst.fightData.ensurePVEFormation();
        }
    }
}

/** PVP请求战斗数据 */
class NetPVPReqFightDataCmd extends BaseCmd{
    public execute() {
        EventManager.inst.dispatch(ContextEvent.PVP_FIGHT_DATA_RES, this.data);
    }
}