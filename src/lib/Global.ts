/**
 * 全局配置
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
module Global
{
    export function initConfig(data:any):void
    {
        Global.DEBUG = data["DEBUG"];
        Global.GAME_ID = data["GAME_ID"];
        Global.TEST_TOKEN = data["TEST_TOKEN"];
        Global.SERVER_ADDR = data["TEST_SERVER"];
        Global.PAY_ENABLED = data["PAY_ENABLED"];
        Global.FOCUS_ENABLED = data["FOCUS_ENABLED"];
        Global.SOUND_ENABLED = data["SOUND_ENABLED"];
        Global.SHARE_ENABLED = data["SHARE_ENABLED"];
    }

    export var DEBUG:boolean;// 是否调试模式
    export var GAME_ID:number;// 游戏ID
    export var TEST_TOKEN:string;// 测试TOKEN
    export var SERVER_ADDR:string;// 服务器地址
    export var PAY_ENABLED:string;// 支付地址
    export var FOCUS_ENABLED:string;// 关注地址
    export var SOUND_ENABLED:boolean = true;// 声音是否开启
    export var SHARE_ENABLED:boolean;// 是否可分享
    export var SYS_FONT:string = "微软雅黑";// 系统字体
    export var COIN_TOP_HEIGHT:number = 620;// 货币栏 高
    export var COIN_BOTTOM_HEIGHT:number = 360;//货币栏 低
    export var TOKEN:string;

    export function getStage():egret.Stage
    {
        return egret.MainContext.instance.stage;
    }

    export function getStageWidth():number
    {
        return egret.MainContext.instance.stage.stageWidth;
    }

    export function getStageHeight():number
    {
        return egret.MainContext.instance.stage.stageHeight;
    }

    export function getResURL(name:string):string
    {
        return "resource/" + name;
    }
    export function getHeroURL(name:string):string
    {
        return getResURL("gui/hero/" + name);
    }
    export function getWeaponURL(id:number):string
    {
        return getResURL("gui/weapon_icon/" + id + ".png");
    }


    /****/
    export function getUIURL(name:string):string
    {
        return getResURL("gui/" + name);
    }
    export function getConfigURL(name:string):string
    {
        return getResURL("config/" + name);
    }

    export function getMcURL(name:string):string
    {
        return getResURL("gui/mc/" + name);
    }

    export function getAudioURL(name:string):string
    {
        return getResURL("audio/" + name);
    }

    export function getMonsterURL(id):string
    {
        return getResURL("gui/monster/" + id + ".png");
    }
    
    export function getBossURL(id):string
    {
        return getResURL("gui/boss/" + id + ".png");
    }
    
    export function getChaIconURL(id): string 
    {
        return getResURL("gui/cha_icon/cha_" + id + ".png");
    }
    export function getChaBossURL(id):string
    {
        return getResURL("gui/cha_boss/cha_b_" + id + ".png");
    }
    
    export function getItemURL(id):string
    {
        return getResURL("gui/item/item_" + id + ".png");
    }
    
    export function getChaStay(id): any 
    {
        return getResURL("gui/cha/" + id);
    }
    
    export function getEffectURL(name):any
    {
        return getResURL("gui/effect/effect_" + name);
    }

    export function getPvPEffectURL(name):any
    {
        return getResURL("gui/effect/pvp_" + name);
    }

}
