/**
 * Created by hh on 2016/12/8.
 */
var PVEFightPanel = (function (_super) {
    __extends(PVEFightPanel, _super);
    function PVEFightPanel() {
        _super.call(this);
        this.fightContainer = new FightContainer();
        this.addChild(this.fightContainer);
        this.levelLabel = new eui.Label();
        this.levelLabel.textAlign = "center";
        this.levelLabel.width = 480;
        this.levelLabel.y = 80;
        this.addChild(this.levelLabel);
        this.fightDropContainer = new FightDropContainer();
        this.addChild(this.fightDropContainer);
        this.addEventListener("fight_end", this.onFightEnd, this, true);
        // EventManager.inst.addEventListener(ContextEvent.PVE_SYNC_RES, this.onPveSyncComplete, this);
    }
    var d = __define,c=PVEFightPanel,p=c.prototype;
    p.onFightEnd = function () {
        // let enemyIds:number[] = this.fightContainer.getMonsterArr();
        // Http.inst.send(CmdID.FIGHT_SYNC, {
        //     area: UserProxy.inst.curArea,
        //     ots: this.fightContainer.getStepCount(),
        //     tp: this.fightContainer.getTriggerChanceType(),
        //     ePos: JSON.stringify(enemyIds)
        // });
    };
    p.onPveSyncComplete = function (e) {
        // let clientData = this.fightContainer.getSteps();
        // let serverData = e.data.battleReport;
        // if (fight.check(clientData, serverData)) {
        //     this.level = UserProxy.inst.curArea;
        //     this.startLevel(this.level);
        // }
    };
    p.startLevel = function (level) {
        this.reset();
        // if (!level) {
        //     level = UserProxy.inst.curArea;
        // }
        this.level = level;
        this.levelLabel.text = "Stage:" + level;
        this.fightDropContainer.startLevel();
        // UserProxy.inst.fightData.syncPVEFormation();
        this.myHeroArr = fight.dataModel.getMyPVEHeroArr();
        this.monsterArr = StageConfig.getMonster(Config.StageData[level]);
        var resGroupRes = fight.getFightNeedRes([].concat(this.myHeroArr, this.monsterArr));
        console.log(resGroupRes, "...");
        RES.createGroup("scene" + this.level, resGroupRes);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        RES.loadGroup("scene" + this.level);
    };
    p.loadResComplete = function (e) {
        if (e.groupName == "scene" + this.level) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
            this.fightContainer.fightDeployment([].concat(this.myHeroArr, this.monsterArr), true, this.level);
        }
    };
    p.reset = function () {
    };
    return PVEFightPanel;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEFightPanel,'PVEFightPanel');
//# sourceMappingURL=PVEFightPanel.js.map