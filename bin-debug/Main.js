var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.level = 1;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //注入自定义的素材解析器
        var assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
        console.log("开始加载资源");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        console.log(event.itemsLoaded, event.itemsLoaded, event.resItem.url);
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    p.onResourceLoadError = function (event) {
        this.onResourceLoadComplete(event);
    };
    p.createGameScene = function () {
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
    };
    p.onFightEnd = function () {
        this.level++;
        this.startStage(this.level);
    };
    p.startStage = function (level) {
        this.levelLabel.text = "stage " + level;
        var monsterConfig = StageConfig.getMonster(level);
        var heroConfig = Config.FightConfig.hero.concat();
        this.myHeroArr = [];
        for (var i = 0; i < heroConfig.length; i++) {
            if (!!heroConfig[i])
                this.myHeroArr.push({ id: heroConfig[i], side: 1, pos: i });
        }
        this.monsterArr = StageConfig.getMonster(level);
        this.loadRes(this.myHeroArr, this.monsterArr);
    };
    p.loadRes = function (heroArr, monsterArr) {
        var resPath = [];
        for (var i = 0; i < heroArr.length; i++) {
            var heroConfig = Config.HeroData[heroArr[i].id];
            this.pushUniqueValue(heroConfig.resource, resPath);
            var skill = [].concat(heroConfig.skill, heroConfig.begin_skill);
            for (var j = 0; j < skill.length; j++) {
                if (!!skill[j]) {
                    var skillConfig = Config.SkillData[skill[j]];
                    this.pushUniqueValue(skillConfig.scource_effect, resPath);
                    this.pushUniqueValue(skillConfig.target_effect, resPath);
                }
            }
        }
        for (var i = 0; i < monsterArr.length; i++) {
            var enemyConfig = Config.EnemyData[monsterArr[i].id];
            this.pushUniqueValue(enemyConfig.resource, resPath);
            var skill = [].concat(enemyConfig.skill, enemyConfig.begin_skill);
            for (var j = 0; j < skill.length; j++) {
                if (!!skill[j]) {
                    var skillConfig = Config.SkillData[skill[j]];
                    this.pushUniqueValue(skillConfig.scource_effect, resPath);
                    this.pushUniqueValue(skillConfig.target_effect, resPath);
                }
            }
        }
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
        RES.createGroup("scene" + this.level, resPath);
        RES.loadGroup("scene" + this.level);
    };
    p.pushUniqueValue = function (value, set) {
        if (!!value) {
            if (set.indexOf(value + "_png") < 0) {
                set.push(value + "_png", value + "_json");
            }
        }
    };
    p.loadResComplete = function (e) {
        if (e.groupName == "scene" + this.level) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadResComplete, this);
            this.fightContainer.startFight([].concat(this.myHeroArr, this.monsterArr), true, this.level);
            this.fightDropContainer.startLevel();
        }
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
