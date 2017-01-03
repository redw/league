
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
	"bin-debug/component/RoleHPBar.js",
	"bin-debug/events/ContextEvent.js",
	"bin-debug/manager/AssetAdapter.js",
	"bin-debug/manager/BaseSound.js",
	"bin-debug/manager/EventManager.js",
	"bin-debug/manager/PanelManager.js",
	"bin-debug/manager/SoundManager.js",
	"bin-debug/manager/ThemeAdapter.js",
	"bin-debug/model/Config.js",
	"bin-debug/model/Global.js",
	"bin-debug/model/ModelDict.js",
	"bin-debug/model/URLConfig.js",
	"bin-debug/model/UserProxy.js",
	"bin-debug/model/buff/BuffConfig.js",
	"bin-debug/model/fight/BattleCheck.js",
	"bin-debug/model/fight/FightConst.js",
	"bin-debug/model/fight/FightDataModel.js",
	"bin-debug/model/fight/FightDropConfig.js",
	"bin-debug/model/fight/FightReportItem.js",
	"bin-debug/model/role/RoleData.js",
	"bin-debug/model/fight/FightRoleData.js",
	"bin-debug/model/fight/StageConfig.js",
	"bin-debug/model/role/HeroModel.js",
	"bin-debug/model/role/RoleConfig.js",
	"bin-debug/model/skill/SkillConfig.js",
	"bin-debug/model/test/StageData.js",
	"bin-debug/net/BaseCmd.js",
	"bin-debug/net/CmdID.js",
	"bin-debug/net/Http.js",
	"bin-debug/net/NetEnterCmd.js",
	"bin-debug/net/NetFightCmd.js",
	"bin-debug/net/TestCmd.js",
	"bin-debug/scene/FightContainer.js",
	"bin-debug/scene/FightDropContainer.js",
	"bin-debug/scene/FightProcessGenerator.js",
	"bin-debug/scene/FightRole.js",
	"bin-debug/scene/FightRoleFactory.js",
	"bin-debug/scene/FightUtils.js",
	"bin-debug/scene/PVEFightScene.js",
	"bin-debug/scene/PVPFightPanel.js",
	"bin-debug/scene/StageProgress.js",
	"bin-debug/scene/background/PVEBackGround.js",
	"bin-debug/scene/background/PVEForeground.js",
	"bin-debug/scene/background/PVEMiddleGround.js",
	"bin-debug/scene/background/PVEProspect.js",
	"bin-debug/scene/background/PVETransitionEff.js",
	"bin-debug/scene/effect/BaseMCEffect.js",
	"bin-debug/scene/effect/BloodWarnEff.js",
	"bin-debug/scene/effect/BossIncomingEff.js",
	"bin-debug/scene/effect/FightWarnEff.js",
	"bin-debug/scene/effect/MCEff.js",
	"bin-debug/scene/effect/MoveDustEff.js",
	"bin-debug/scene/effect/NewChapterEff.js",
	"bin-debug/scene/effect/RoleDieEff.js",
	"bin-debug/scene/effect/RoleSkillEff.js",
	"bin-debug/scene/effect/ShakeScreenEff.js",
	"bin-debug/scene/effect/font/FontAddHPEff.js",
	"bin-debug/scene/effect/font/FontMagicAtkEff.js",
	"bin-debug/scene/effect/font/FontOtherEff.js",
	"bin-debug/scene/effect/font/FontPhysicalAtkEff.js",
	"bin-debug/scene/effect/font/FontSystemEff.js",
	"bin-debug/utils/ArrayUtil.js",
	"bin-debug/utils/BigNum.js",
	"bin-debug/utils/DisplayUtil.js",
	"bin-debug/utils/MathUtils.js",
	"bin-debug/view/main/MainView.js",
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