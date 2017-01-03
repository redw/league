/**
 * PVE关卡面板
 * Created by hh on 2016/12/8.
 */
class PVEScenePanel extends egret.DisplayObjectContainer {
    private level:number;
    private roleArr:any[];
    private totalLife:string;
    private stageProgress:StageProgress;
    private fightContainer:FightContainer;
    private fightDropContainer:FightDropContainer;
    private preFight:boolean = false;

    // 击杀boss全局减速
    public constructor() {
        super();

        this.fightContainer = new FightContainer();
        this.addChild(this.fightContainer);

        this.stageProgress = new StageProgress();
        this.stageProgress.x = 100;
        this.stageProgress.y = 64;
        this.stageProgress.visible = false;
        this.addChild(this.stageProgress);

        this.fightDropContainer = new FightDropContainer();
        this.addChild(this.fightDropContainer);

        this.addEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.addEventListener("fight_ready_complete", this.onReadyComplete, this, true);
        this.addEventListener(ContextEvent.FIGHT_END, this.onFightEnd, this, true);
        EventManager.inst.addEventListener(ContextEvent.PVE_SYNC_RES, this.onPveSyncComplete, this);
        EventManager.inst.addEventListener(ContextEvent.PVE_CHANGE_FORMATION_RES, this.onChangeFormation, this);

        EventManager.inst.addEventListener("change_mode", this.onChangeMode, this);
    }

    private onFightEnd() {
        this.stageProgress.visible = false;
        let enemyIds:number[] = this.fightContainer.getMonsterArr();

        let selfIds = Array(fight.ROLE_UP_LIMIT);
        let selfHeroArr = UserProxy.inst.fightData.getPVEBattleHero();
        for (let i = 0 ; i < selfHeroArr.length; i++) {
            selfIds[selfHeroArr[i].pos] = selfHeroArr[i].id;
        }
        console.log("我的英雄:", String(selfIds));

        UserProxy.inst.curArea++;
        this.level = UserProxy.inst.curArea;
        this.startLevel(this.level);

        // Http.inst.send(CmdID.FIGHT_SYNC, {
        //     area: UserProxy.inst.curArea,
        //     ots: this.fightContainer.getStepCount(),
        //     tp: this.fightContainer.getTriggerChanceType(),
        //     ePos: JSON.stringify(enemyIds)
        // });
    }

    private onPveSyncComplete(e:egret.Event){
        let clientData = this.fightContainer.getSteps();
        let serverData = e.data.battleReport;
        this.fightContainer.reset();
        if (fight.check(clientData, serverData)) {
            this.level = UserProxy.inst.curArea;
            this.startLevel(this.level);
        } else {
            // this.level = UserProxy.inst.curArea;
            // this.startLevel(this.level);
        }
    }

    private onChangeFormation(e:egret.Event){
        this.loadRes();
    }

    private onRoleHPChange(e:egret.Event) {
        let curTotalLife = this.fightContainer.getCurTotalLife(FightSideEnum.RIGHT_SIDE);
        let ratio:number = +BigNum.div(curTotalLife, this.totalLife);
        this.stageProgress.setProgress(ratio);
    }

    private onReadyComplete(e:egret.Event) {
        this.totalLife = e.data || "1";
    }

    public startLevel(level?:number) {
        this.reset();
        if (!level) {
            level = UserProxy.inst.curArea;
        }
        this.level = level;
        if (!UserProxy.inst.fightData.syncPVEFormation()) {
            this.loadRes();
        }
    }

    private loadRes(){
        this.preFight = true;
        if (fight.TEST_DATA) {
            return;
        }
        if (fight.TEST_RANDOM) {
            this.roleArr = UserProxy.inst.fightData.getRandomBattleRoleArr();
        } else {
            let myHeroArr = UserProxy.inst.fightData.getPVEBattleHero();
            let monsterArr = StageConfig.getMonster(Config.StageData[this.level]);
            this.roleArr = [].concat(myHeroArr, monsterArr);
        }
        let resGroupRes = fight.getFightNeedRes(this.roleArr);
        RES.createGroup("scene" + this.level, resGroupRes);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        RES.loadGroup("scene" + this.level);
    }

    private loadResComplete(e:RES.ResourceEvent) {
        if (e.groupName == "scene" + this.level) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
            this.preFight = false;
            if (this.level > 1 && this.level % 10 == 1) {
                let eff = new NewChapterEff();
                this.addChild(eff);
                eff.addEventListener(egret.Event.COMPLETE, this.fightDeployment, this);
            } else if (this.level > 1 && this.level % 10 == 0) {
                let eff = new BossIncomingEff();
                eff.addEventListener(egret.Event.COMPLETE, this.fightDeployment, this);
                this.addChild(eff);
            } else {
                this.fightDeployment();
            }
        }
    }

    private fightDeployment(e?:egret.Event){
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.fightDeployment, this);
        }
        this.fightDropContainer.startLevel();
        let sound = Config.StageData[this.level].bgm;
        fight.playSound(sound, false);

        this.stageProgress.startLevel(this.level);
        this.stageProgress.visible = true;
        this.fightContainer.fightDeployment(this.roleArr, true, this.level);
    }

    private onChangeMode(){
        if (!fight.TEST_DATA && this.preFight) {
            this.loadRes();
        }
    }

    private reset() {

    }
}
