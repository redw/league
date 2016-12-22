/**
 * 全局配置
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
var Global;
(function (Global) {
    function initConfig(data) {
        Global.DEBUG = data["DEBUG"];
        Global.GAME_ID = data["GAME_ID"];
        Global.TEST_TOKEN = data["TEST_TOKEN"];
        Global.SERVER_ADDR = data["TEST_SERVER"];
        Global.PAY_ENABLED = data["PAY_ENABLED"];
        Global.FOCUS_ENABLED = data["FOCUS_ENABLED"];
        Global.SOUND_ENABLED = data["SOUND_ENABLED"];
        Global.SHARE_ENABLED = data["SHARE_ENABLED"];
    }
    Global.initConfig = initConfig;
    Global.SOUND_ENABLED = true; // 声音是否开启
    Global.SYS_FONT = "微软雅黑"; // 系统字体
    Global.COIN_TOP_HEIGHT = 620; // 货币栏 高
    Global.COIN_BOTTOM_HEIGHT = 360; //货币栏 低
    function getStage() {
        return egret.MainContext.instance.stage;
    }
    Global.getStage = getStage;
    function getStageWidth() {
        return egret.MainContext.instance.stage.stageWidth;
    }
    Global.getStageWidth = getStageWidth;
    function getStageHeight() {
        return egret.MainContext.instance.stage.stageHeight;
    }
    Global.getStageHeight = getStageHeight;
    function getResURL(name) {
        return "resource/" + name;
    }
    Global.getResURL = getResURL;
    function getHeroURL(name) {
        return getResURL("gui/hero/" + name);
    }
    Global.getHeroURL = getHeroURL;
    function getWeaponURL(id) {
        return getResURL("gui/weapon_icon/" + id + ".png");
    }
    Global.getWeaponURL = getWeaponURL;
    /****/
    function getUIURL(name) {
        return getResURL("gui/" + name);
    }
    Global.getUIURL = getUIURL;
    function getConfigURL(name) {
        return getResURL("config/" + name);
    }
    Global.getConfigURL = getConfigURL;
    function getMcURL(name) {
        return getResURL("gui/mc/" + name);
    }
    Global.getMcURL = getMcURL;
    function getAudioURL(name) {
        return getResURL("audio/" + name);
    }
    Global.getAudioURL = getAudioURL;
    function getMonsterURL(id) {
        return getResURL("gui/monster/" + id + ".png");
    }
    Global.getMonsterURL = getMonsterURL;
    function getBossURL(id) {
        return getResURL("gui/boss/" + id + ".png");
    }
    Global.getBossURL = getBossURL;
    function getChaIconURL(id) {
        return getResURL("gui/cha_icon/cha_" + id + ".png");
    }
    Global.getChaIconURL = getChaIconURL;
    function getChaBossURL(id) {
        return getResURL("gui/cha_boss/cha_b_" + id + ".png");
    }
    Global.getChaBossURL = getChaBossURL;
    function getItemURL(id) {
        return getResURL("gui/item/item_" + id + ".png");
    }
    Global.getItemURL = getItemURL;
    function getChaStay(id) {
        return getResURL("gui/cha/" + id);
    }
    Global.getChaStay = getChaStay;
    function getEffectURL(name) {
        return getResURL("gui/effect/effect_" + name);
    }
    Global.getEffectURL = getEffectURL;
    function getPvPEffectURL(name) {
        return getResURL("gui/effect/pvp_" + name);
    }
    Global.getPvPEffectURL = getPvPEffectURL;
})(Global || (Global = {}));
//# sourceMappingURL=Global.js.map