/**
 * PVE关卡面板
 * Created by hh on 2016/12/8.
 */
class PVEScenePanel extends egret.DisplayObjectContainer {
    private level:number;
    private heroArr:{id:number, pos:number, side:number}[];
    private monsterArr:{id:number, pos:number, side:number}[];
    private stageProgress:StageProgress;
    private fightContainer:FightContainer;
    private fightDropContainer:FightDropContainer;

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
        this.addEventListener(ContextEvent.FIGHT_END, this.onFightEnd, this, true);
        EventManager.inst.addEventListener(ContextEvent.PVE_SYNC_RES, this.onPveSyncComplete, this);
        EventManager.inst.addEventListener(ContextEvent.PVE_CHANGE_FORMATION_RES, this.onChangeFormation, this);
    }

    private onFightEnd() {

        this.level++;
        this.startLevel(this.level);
        return;

        this.stageProgress.visible = false;
        let enemyIds:number[] = this.fightContainer.getMonsterArr();

        let selfIds = Array(fight.ROLE_UP_LIMIT);
        let selfHeroArr = UserProxy.inst.fightData.getPVEBattleHero();
        for (let i =0 ; i < selfHeroArr.length; i++) {
            selfIds[selfHeroArr[i].pos] = selfHeroArr[i].id;
        }
        console.log("我的英雄:", String(selfIds));

        Http.inst.send(CmdID.FIGHT_SYNC, {
            area: UserProxy.inst.curArea,
            rs: this.fightContainer.result,
            tp: this.fightContainer.getTriggerChanceType(),
            it: JSON.stringify([])
        });
    }

    private onPveSyncComplete(e:egret.Event){
        let ret = e.data.ret;
        let curArea = UserProxy.inst.curArea;
        // let wheelTimes = e.data.wheelTimes;         // 转盘 每100关boss奖励一次
        // let itemList = e.data.wheelTimes.concat();  // 道具对象，如果使用道具就会返回
        if (curArea > 0) {
            this.level = curArea;
            this.startLevel(this.level);
        }
    }

    private onChangeFormation(e:egret.Event){
        this.loadRes();
    }

    private onRoleHPChange(e:egret.Event) {
        let curTotalLife = this.fightContainer.getCurTotalLife(FightSideEnum.RIGHT_SIDE);
        let ratio:number = +BigNum.div(curTotalLife, this.fightContainer.rightTotalLife);
        this.stageProgress.setProgress(ratio);
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
        this.heroArr = UserProxy.inst.fightData.getPVEBattleHero();
        this.monsterArr = StageConfig.getMonster(Config.StageData[this.level]);
        let resGroupRes = fight.getFightNeedRes([].concat(this.heroArr, this.monsterArr));
        RES.createGroup("scene" + this.level, resGroupRes);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        RES.loadGroup("scene" + this.level);
    }

    private loadResComplete(e:RES.ResourceEvent) {
        if (e.groupName == "scene" + this.level) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
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

        let heroArr = this.heroArr;
        let heroInfoArr = [];
        for (let i = 0; i < heroArr.length; i++) {
            let obj:any = {};
            obj.id = heroArr[i].id;
            obj.pos = heroArr[i].pos;
            obj.side = heroArr[i].side;
            let heroVO = UserProxy.inst.heroData.getHeroData(obj.id);
            obj.level = heroVO ? heroVO.level : 0;
            obj.starLevel = heroVO ? heroVO.starLevel : 1;
            obj.strengthenLevel = heroVO ? heroVO.strengthenLevel : 0;
            obj.starPiece = heroVO ? heroVO.starPiece : 0;
            obj.skill = heroVO ? heroVO.skill : 0;
            heroInfoArr.push(obj);
        }

        let monsterArr = this.monsterArr;
        let monsterInfoArr = [];
        for (let i = 0; i < monsterArr.length; i++) {
            let obj:any = {};
            obj.id = monsterArr[i].id;
            obj.pos = monsterArr[i].pos;
            obj.side = monsterArr[i].side;
            obj.level = this.level;
            monsterInfoArr.push(obj);
        }
        this.fightContainer.fightDeployment([].concat(heroInfoArr, monsterInfoArr), true, this.level);
    }

    private reset() {

    }
}
