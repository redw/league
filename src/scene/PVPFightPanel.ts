/**
 * pvp战斗面板
 */
class PVPFightPanel extends BasePanel {
    private fightContainer:FightContainer;
    private selfRoles:{id:number, pos:number, side:number}[];
    private matchRoles:{id:number, pos:number, side:number}[];
    private selfPosArr:number[] = [];
    private isResOk:boolean = false;
    private fightData:{ret:number, store:number, challengeTimes:number, pvpCoin:number, diamond:number, pvpRecord:any, battleReport:any};

    public constructor(){
        super();
		this._layer = PanelManager.TOP_LAYER;
        // this.skinName = PVPFightPanelSkin;

        this.addEventListener("fight_end", this.onFightEnd, this, true);
    }

    public initData(): void {
        this.selfPosArr = this._data[0].concat();
        while (this.selfPosArr.length < fight.ROLE_UP_LIMIT) {
            this.selfPosArr.push(0);
        }
        this.selfRoles = fight.generateFightHeroDataArr(this._data[1].hero, this.selfPosArr, FightSideEnum.LEFT_SIDE);
        this.matchRoles = fight.generateFightHeroDataArr(this._data[2].hero, this._data[2].pos, FightSideEnum.RIGHT_SIDE);

        let resGroupRes = fight.getFightNeedRes([].concat(this.selfRoles, this.matchRoles));
        RES.createGroup("pvpResGroup", resGroupRes);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        RES.loadGroup("pvpResGroup");

        // Http.inst.send(CmdID.FIGHT_PVP_BEGIN, {
        //     pos: JSON.stringify(this.selfPosArr),
        //     tp: this.fightContainer.getTriggerChanceType()
        // });
    }

    public init(){
        this.fightContainer = new FightContainer(FightTypeEnum.PVP);
        this.addChild(this.fightContainer);
        EventManager.inst.addEventListener(ContextEvent.PVP_FIGHT_DATA_RES, this.onPVPFightDataRes, this);
    }

    private loadResComplete(e:RES.ResourceEvent) {
        if (e.groupName == "pvpResGroup") {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
            let heroArr = [].concat(this.selfRoles, this.matchRoles);
            this.fightContainer.fightDeployment(heroArr);
            this.isResOk = true;
            this.startFight();
        }
    }

    private onPVPFightDataRes(e:egret.Event) {
        this.fightData = e.data;
        this.startFight();
    }

    private startFight(){
        if (this.isResOk && this.fightData) {
            let step = [].concat(this.fightData.battleReport);
            for (let i = 0; i < step.length; i++) {
                step[i].index = i;
            }
            this.fightContainer.start(step);
        }
    }

    private onFightEnd(){
        EventManager.inst.dispatch(ContextEvent.PVP_REFRESH_ROLE_REQ);
        PanelManager.inst.hidePanel("PVPFightPanel");
    }

    public dispose(): void {
        super.destory();
    }
}