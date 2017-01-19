
var game_file_list = [
    //以下为自动修改，请勿修改
    //----auto game_file_list start----
	"libs/modules/egret/egret.js",
	"libs/modules/egret/egret.native.js",
	"libs/modules/game/game.js",
	"libs/modules/game/game.native.js",
	"libs/modules/res/res.js",
	"libs/modules/eui/eui.js",
	"libs/modules/tween/tween.js",
	"bin-debug/Main.js",
	"bin-debug/component/BasePanel.js",
	"bin-debug/component/Alert.js",
	"bin-debug/component/AutoBitmap.js",
	"bin-debug/component/LoadingUI.js",
	"bin-debug/events/ContextEvent.js",
	"bin-debug/fight/PVEFightContainer.js",
	"bin-debug/fight/background/PVEBackGround.js",
	"bin-debug/fight/background/PVEForeground.js",
	"bin-debug/fight/background/PVEMiddleGround.js",
	"bin-debug/fight/background/PVEProspect.js",
	"bin-debug/fight/background/PVETransitionEff.js",
	"bin-debug/fight/core/BattleCheck.js",
	"bin-debug/fight/core/FightConst.js",
	"bin-debug/fight/core/FightProcessGenerator.js",
	"bin-debug/fight/core/FightResStrategy.js",
	"bin-debug/fight/core/FightRoleFactory.js",
	"bin-debug/fight/core/FightUtils.js",
	"bin-debug/fight/core/PriorityImage.js",
	"bin-debug/fight/effect/BaseMCEffect.js",
	"bin-debug/fight/effect/BloodWarnEff.js",
	"bin-debug/fight/effect/BossIncomingEff.js",
	"bin-debug/fight/effect/BuddhaPalmEff.js",
	"bin-debug/fight/effect/FightWarnEff.js",
	"bin-debug/fight/effect/FontEff.js",
	"bin-debug/fight/effect/MCEff.js",
	"bin-debug/fight/effect/MoveDustEff.js",
	"bin-debug/fight/effect/NewChapterEff.js",
	"bin-debug/fight/effect/RoleDieEff.js",
	"bin-debug/fight/effect/RoleSkillEff.js",
	"bin-debug/fight/effect/ShakeScreenEff.js",
	"bin-debug/fight/effect/SkillNameEff.js",
	"bin-debug/fight/model/FightDataModel.js",
	"bin-debug/model/ModelDict.js",
	"bin-debug/fight/model/HeroModel.js",
	"bin-debug/fight/model/config/BuffConfig.js",
	"bin-debug/fight/model/config/DropConfig.js",
	"bin-debug/fight/model/config/FightReportItem.js",
	"bin-debug/fight/model/config/RoleConfig.js",
	"bin-debug/fight/model/config/SkillConfig.js",
	"bin-debug/fight/model/config/StageConfig.js",
	"bin-debug/fight/model/vo/FightRoleVO.js",
	"bin-debug/fight/model/vo/HeroVO.js",
	"bin-debug/fight/model/vo/MonsterVO.js",
	"bin-debug/fight/view/BossStageProgress.js",
	"bin-debug/fight/view/DropItem.js",
	"bin-debug/fight/view/FightContainer.js",
	"bin-debug/fight/view/FightRole.js",
	"bin-debug/fight/view/RoleHPBar.js",
	"bin-debug/fight/view/RoundProgress.js",
	"bin-debug/fight/view/StageProgress.js",
	"bin-debug/manager/AssetAdapter.js",
	"bin-debug/manager/BaseSound.js",
	"bin-debug/manager/EventManager.js",
	"bin-debug/manager/PanelManager.js",
	"bin-debug/manager/SoundManager.js",
	"bin-debug/manager/ThemeAdapter.js",
	"bin-debug/model/Config.js",
	"bin-debug/model/Global.js",
	"bin-debug/model/URLConfig.js",
	"bin-debug/model/UserProxy.js",
	"bin-debug/net/BaseCmd.js",
	"bin-debug/net/CmdID.js",
	"bin-debug/net/Http.js",
	"bin-debug/net/NetEnterCmd.js",
	"bin-debug/net/NetFightCmd.js",
	"bin-debug/net/TestCmd.js",
	"bin-debug/utils/ArrayUtil.js",
	"bin-debug/utils/BigNum.js",
	"bin-debug/utils/DisplayUtil.js",
	"bin-debug/utils/MathUtils.js",
	"bin-debug/utils/McUtil.js",
	//----auto game_file_list end----
];

var window = this;

egret_native.setSearchPaths([""]);

egret_native.requireFiles = function () {
    for (var key in game_file_list) {
        var src = game_file_list[key];
        require(src);
    }
};

egret_native.egretInit = function () {
    if(egret_native.featureEnable) {
        //控制一些优化方案是否开启
        egret_native.featureEnable({
            
        });
    }
    egret_native.requireFiles();
    //egret.dom为空实现
    egret.dom = {};
    egret.dom.drawAsCanvas = function () {
    };
};

egret_native.egretStart = function () {
    var option = {
        //以下为自动修改，请勿修改
        //----auto option start----
		entryClassName: "Main",
		frameRate: 30,
		scaleMode: "showAll",
		contentWidth: 480,
		contentHeight: 800,
		showPaintRect: false,
		showFPS: false,
		fpsStyles: "x:0,y:0,size:12,textColor:0xffffff,bgAlpha:0.9",
		showLog: false,
		logFilter: "",
		maxTouches: 2,
		textureScaleFactor: 1
		//----auto option end----
    };

    egret.native.NativePlayer.option = option;
    egret.runEgret();
    egret_native.Label.createLabel("/system/fonts/DroidSansFallback.ttf", 20, "", 0);
    egret_native.EGTView.preSetOffScreenBufferEnable(true);
};