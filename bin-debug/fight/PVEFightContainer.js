/**
 * PVE关卡面板
 * Created by hh on 2016/12/8.
 */
var PVEScenePanel = (function (_super) {
    __extends(PVEScenePanel, _super);
    function PVEScenePanel() {
        _super.call(this);
        this.level = 1;
        this.fightContainer = new FightContainer();
        this.addChild(this.fightContainer);
        this.stageProgress = new StageProgress();
        this.stageProgress.x = 150;
        this.stageProgress.y = 64;
        this.stageProgress.visible = false;
        this.addChild(this.stageProgress);
        this.addEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.addEventListener(ContextEvent.FIGHT_END, this.onFightEnd, this, true);
        this.addEventListener("fight_start", this.onFightStart, this);
        EventManager.inst.addEventListener(ContextEvent.PVE_SYNC_RES, this.onPveSyncComplete, this);
        EventManager.inst.addEventListener(ContextEvent.PVE_CHANGE_FORMATION_RES, this.onChangeFormation, this);
        EventManager.inst.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onRoleDataUpdate, this);
    }
    var d = __define,c=PVEScenePanel,p=c.prototype;
    p.onFightStart = function () {
        var config = Config.StageCommonData[Math.ceil(this.level / 50)];
        fight.playSound(config.bgm, false);
    };
    p.onFightEnd = function () {
        this.stageProgress.visible = false;
        this.level++;
        this.startLevel(this.level);
    };
    p.onPveSyncComplete = function (e) {
        var curArea = UserProxy.inst.curArea;
        // let wheelTimes = e.data.wheelTimes;         // 转盘 每100关boss奖励一次
        // let itemList = e.data.wheelTimes.concat();  // 道具对象，如果使用道具就会返回
        var serverData = e.data.battleReport;
        var clientData = this.fightContainer.getSteps();
        if (fight.check(clientData, serverData)) {
            this.level = UserProxy.inst.curArea;
            this.startLevel(this.level);
        }
        else {
            this.level = UserProxy.inst.curArea;
            this.startLevel(this.level);
        }
    };
    p.onChangeFormation = function (e) {
        this.loadRes();
    };
    p.onRoleHPChange = function (e) {
        var curTotalLife = this.fightContainer.getCurTotalLife(FightSideEnum.RIGHT_SIDE);
        var ratio = +BigNum.div(curTotalLife, this.fightContainer.rightTotalLife);
        this.stageProgress.setProgress(ratio);
    };
    p.onRoleDataUpdate = function (e) {
        var keys = e.data;
        for (var i = 0; i < keys.length; i++) {
            var heroVO = UserProxy.inst.heroData.getHeroData(keys[i]);
            this.fightContainer.showUPLevelEff(heroVO);
        }
    };
    p.startLevel = function (level) {
        this.reset();
        if (!level) {
            level = UserProxy.inst.curArea;
        }
        this.level = level;
        if (!UserProxy.inst.fightData.syncPVEFormation()) {
            this.loadRes();
        }
    };
    p.loadRes = function () {
        this.heroArr = UserProxy.inst.fightData.getPVEBattleHero();
        this.monsterArr = UserProxy.inst.fightData.getMonster(this.level);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        fight.loadPVEFightRes([].concat(this.heroArr, this.monsterArr));
    };
    p.loadResComplete = function (e) {
        if (e.groupName == "pve_fight_role") {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
            this.stageProgress.startLevel(this.level);
            this.stageProgress.visible = true;
            var heroArr = this.heroArr;
            var heroInfoArr = [];
            for (var i = 0; i < heroArr.length; i++) {
                var obj = {};
                obj.id = heroArr[i].id;
                obj.pos = heroArr[i].pos;
                obj.side = heroArr[i].side;
                var heroVO = UserProxy.inst.heroData.getHeroData(obj.id);
                obj.level = heroVO ? heroVO.level : 0;
                obj.starLevel = heroVO ? heroVO.starLevel : 1;
                obj.strengthenLevel = heroVO ? heroVO.strengthenLevel : 0;
                obj.starPiece = heroVO ? heroVO.starPiece : 0;
                obj.skill = heroVO ? heroVO.skill : 0;
                heroInfoArr.push(obj);
            }
            var monsterArr = this.monsterArr;
            var monsterInfoArr = [];
            for (var i = 0; i < monsterArr.length; i++) {
                var obj = {};
                obj.id = monsterArr[i].id;
                obj.pos = monsterArr[i].pos;
                obj.side = monsterArr[i].side;
                obj.level = this.level;
                monsterInfoArr.push(obj);
            }
            var autoFight = true;
            if (this.level % 10 == 0) {
                autoFight = false;
            }
            else if (Config.StageData[this.level - 1] && Config.StageData[this.level].map != Config.StageData[this.level - 1].map) {
                autoFight = false;
            }
            //console.log("战场上的角色:", [].concat(heroInfoArr, monsterInfoArr));
            this.fightContainer.fightDeployment([].concat(heroInfoArr, monsterInfoArr), autoFight, this.level, false, true);
        }
    };
    p.reset = function () {
    };
    return PVEScenePanel;
}(egret.DisplayObjectContainer));
egret.registerClass(PVEScenePanel,'PVEScenePanel');
//# sourceMappingURL=PVEFightContainer.js.map