/**
 * PVE关卡面板
 * Created by hh on 2016/12/8.
 */
class PVEScenePanel extends egret.DisplayObjectContainer {
    private level:number;
    private stageProgress:StageProgress;
    private fightContainer:FightContainer;
    private heroArr:{id:number, pos:number, side:number}[];
    private monsterArr:{id:number, pos:number, side:number}[];

    public constructor() {
        super();

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

    private onFightStart(){

    }

    private onFightEnd() {
        this.stageProgress.visible = false;
        this.level++;
        this.startLevel(this.level);
    }

    private onPveSyncComplete(e:egret.Event){
        let curArea = UserProxy.inst.curArea;
        // let wheelTimes = e.data.wheelTimes;         // 转盘 每100关boss奖励一次
        // let itemList = e.data.wheelTimes.concat();  // 道具对象，如果使用道具就会返回
        let serverData = e.data.battleReport;
        let clientData = this.fightContainer.getSteps();
        if (fight.check(clientData, serverData)) {
            this.level = UserProxy.inst.curArea;
            this.startLevel(this.level);
        } else {
            this.level = UserProxy.inst.curArea;
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

    private onRoleDataUpdate(e:egret.Event) {
        let keys = e.data;
        for (let i = 0; i < keys.length; i++) {
            let heroVO = UserProxy.inst.heroData.getHeroData(keys[i]);
            this.fightContainer.showUPLevelEff(heroVO);
        }
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
        this.monsterArr = UserProxy.inst.fightData.getMonster(this.level);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        fight.loadPVEFightRes(this.level, [].concat(this.heroArr, this.monsterArr));
    }

    private loadResComplete(e:RES.ResourceEvent) {
        if (e.groupName == "pve_fight_role") {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);

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
            let autoFight:boolean = true;
            if (this.level % 10 == 0) {
                autoFight = false;
            } else if (Config.StageData[this.level  - 1] && Config.StageData[this.level].map != Config.StageData[this.level - 1].map) {
                autoFight = false;
            }
            //console.log("战场上的角色:", [].concat(heroInfoArr, monsterInfoArr));
            this.fightContainer.fightDeployment([].concat(heroInfoArr, monsterInfoArr), autoFight, this.level);
        }
    }

    private reset() {

    }
}
