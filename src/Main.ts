class Main extends egret.DisplayObjectContainer {

    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter",assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter",new ThemeAdapter());

        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
        console.log("开始加载资源");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        console.log(event.itemsLoaded, event.itemsLoaded, event.resItem.url);
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private onResourceLoadError(event:RES.ResourceEvent):void
    {
        this.onResourceLoadComplete(event);
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private fightContainer;
    private fightDropContainer;
    private levelLabel:eui.Label;
    private level = 1;
    private myHeroArr;
    private monsterArr;

    private createGameScene():void {
        Config.init();

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
        this.startStage(this.level);
    }

    private onFightEnd(){
        this.level++;
        this.startStage(this.level);
    }

    private startStage(level:number){
        this.levelLabel.text = "stage " + level;
        let monsterConfig = StageConfig.getMonster(level);
        let heroConfig = Config.FightConfig.hero.concat();

        this.myHeroArr = [];
        for (let i = 0; i < heroConfig.length; i++) {
            if (!!heroConfig[i])
                this.myHeroArr.push({id:heroConfig[i], side:1, pos:i})
        }
        this.monsterArr = StageConfig.getMonster(level);

        this.loadRes(this.myHeroArr, this.monsterArr);
    }

    private loadRes(heroArr:{id:number}[], monsterArr:{id:number}[]){
        let resPath:string[] = [];
        for (let i = 0; i < heroArr.length; i++) {
            let heroConfig:RoleConfig = Config.HeroData[heroArr[i].id];
            this.pushUniqueValue(heroConfig.resource, resPath);
            let skill:string[] = [].concat(heroConfig.skill, heroConfig.begin_skill);
            for (let j = 0; j < skill.length; j++) {
                if (!!skill[j]) {
                    let skillConfig = Config.SkillData[skill[j]];
                    this.pushUniqueValue(skillConfig.scource_effect, resPath);
                    this.pushUniqueValue(skillConfig.target_effect, resPath);
                }
            }
        }
        for (let i = 0; i < monsterArr.length; i++) {
            let enemyConfig:RoleConfig = Config.EnemyData[monsterArr[i].id];
            this.pushUniqueValue(enemyConfig.resource, resPath);
            let skill:string[] = [].concat(enemyConfig.skill, enemyConfig.begin_skill);
            for (let j = 0; j < skill.length; j++) {
                if (!!skill[j]) {
                    let skillConfig = Config.SkillData[skill[j]];
                    this.pushUniqueValue(skillConfig.scource_effect, resPath);
                    this.pushUniqueValue(skillConfig.target_effect, resPath);
                }
            }
        }
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        RES.createGroup("scene" + this.level, resPath);
        RES.loadGroup("scene" + this.level);
    }

    private pushUniqueValue(value:any, set:any[]) {
        if (!!value) {
            if (set.indexOf(value + "_png") < 0) {
                set.push(value + "_png", value + "_json");
            }
        }
    }

    private loadResComplete(e:RES.ResourceEvent) {
        if (e.groupName == "scene" + this.level) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
            this.fightContainer.startFight([].concat(this.myHeroArr, this.monsterArr), true, this.level);
            this.fightDropContainer.startLevel();
        }
    }
}


