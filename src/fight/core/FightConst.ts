/**
 * 战斗中的一些常量
 * Created by hh on 16/12/20.
 */
enum FightStateEnum{
    Wait = 1,
    Fight,
    End
}

enum FightTypeEnum {
    PVE = 1,
    PVP,
    BOSS
}

enum FightFontEffEnum{
    OTHER = 0,
    PHYSICAL_ATK,
    MAGIC_ATK,
    ADD_HP,
    SYSTEM
}

enum FightSideEnum{
    LEFT_SIDE = 1,
    RIGHT_SIDE
}

enum BuffTypeEnum
{
    PHYSICAL_ATK = 1,                               // 物攻
    MAGIC_ATK,                                      // 魔攻
    PHYSICAL_DEF,                                   // 物防
    MAGIC_DEF,                                      // 魔防
    HURT_OUT,                                       // 伤害输出
    HURT,                                           // 伤害
    BACK_HURT,                                      // 伤害反弹
    BACK_HURT_OUT,                                  // 伤害输出反弹
    VERTIGO,                                        // 眩晕
    ADD_BLOOD,                                      // 回血
    POISONING,                                      // 中毒
    HIDE,                                           // 隐匿
    INVINCIBLE,                                     // 无敌
    FREE_PHYSICAL,                                  // 物免
    FREE_MAGIC,                                     // 魔免
    ATK_MORE_MORE,                                  // 越来越(物攻/魔攻)
    KILL_MORE_MORE,                                 // 越来越(击杀)
    BLOOD_MORE_MORE,                                // 越来越(血量)
    SEAL_MAGIC,                                     // 封魔
    DEF_MORE_MORE,                                  // 越来越(物防/魔防)
    FORBIDDEN_ADD_BLOOD,                            // 冰封生命
    ATTACK_KEY,                                     // 攻击要害
    XIA_MA_WEI,                                     // 下马威
    FIRE_WILL,                                      // 火的意志
    TO_BOSS,                                        // 成为boss
    CHANGE_DODGE,                                   // 改变闪避率
    CHANGE_BLOCK,                                   // 改变格档率
    CHANGE_CRIT,                                    // 改变暴击率
    CHANGE_CRIT_HURT,                               // 改变暴击伤害
    LIFE                                            // 生命
}

module fight{
    export let TEST_BUNCH:string = "b";
    export let TEST_OTHER_HERO = null;
    export let TEST_SELF_HERO = null;
    export let RUN_METHOD:number = 1;

    export let WIDTH:number = 480;
    export let HEIGHT:number = 460;
    // pve场景偏移
    export const PVE_SCENE_OFF:number = 0;
    // pvp 场景偏移
    export const PVP_SCENE_OFF:number = 100;
    // 角色上限
    export const ROLE_UP_LIMIT:number = 9;
    export const ROLE_SHADOW_OFF:number = -20;
    // 判断角色死亡的血量上限
    export const DIE_HP:number = 1;

    // 同时出战的时间间隔
    export let MEANWHILE_FIGHT_DELAY_TIME:number = 0;
    // 完成一步的时间间隔
    export let STEP_DELAY_TIME:number = 200;
    // 能否同时出战
    export let CAN_MEANWHILE_FIGHT:boolean = true;
    // 回退的时间间隔
    export let RETREAT_TIME:number = 150;
    // 移动的时间
    export let MOVE_TIME:number = 150;
    // 移动攻击时,距离目标点的位置
    export let MOVE_ATTACK_OFF:number = 100;
    // 子弹飞行时间
    export let BULLET_RUN_TIME:number = 300;
    // 子弹间间隔
    export let BULLET_RUN_DELAY_TIME:number = 200;
    // 死亡延迟时间
    export let DIE_DELAY_TIME:number = 600;
    // 生命条缓动时间
    export let LIFE_BAR_TWEEN_TIME:number = 200;

    // 战斗步骤上限
    export const STEP_UP_LIMIT:number = 100;
    export const ROUND_LIMIT:number = 20;

    export const ATTACK_ACTION_NORMAL:string = "normal_attack";
    export const ATTACK_ACTION_ROW:string = "row_attack";
    export const ATTACK_ACTION_JUMP:string = "jump_attack";
    export const ATTACK_ACTION_JUMP_AREA:string = "jump_area";
    export const ATTACK_ACTION_AREA:string = "area";
    export const ATTACK_ACTION_TURN:string = "turn";
    export const ATTACK_ACTION_BOMB:string = "bomb";
    export const ATTACK_ACTION_MISSLE:string = "missle";
    export const ATTACK_ACTION_NO_MISSLE:string = "no_missle";

    export const LOG_FIGHT_INFO:number = 1;
    export const LOG_FIGHT_PLAY:number = 5;
    export const LOG_FIGHT_DATA:number = 10;
    export const LOG_FIGHT_WARN:number = 50;
    export const LOG_FIGHT_ERROR:number = 100;

    export let FORE_GROUND_MOVE_TIME:number = 400;
    export let MIDDLE_GROUND_MOVE_TIME:number = 500;
    export let BACK_GROUND_MOVE_TIME:number = 650;
    export let FORE_GROUND_MOVE_EASE:string = "quintInOut";
    export let MIDDLE_GROUND_MOVE_EASE:string = "quintInOut";
    export let BACK_GROUND_MOVE_EASE:string = "quintInOut";

    export const FONT_PHYSICAL_DAMAGE:string = "physical_damage_fnt";
    export const FONT_ADD_HP:string = "hp_fnt";
    export const FONT_MAGICAL_DAMAGE:string = "magical_damage_fnt";
    export const FONT_STAGE:string = "stage_fnt";
    export const FONT_SYSTEM:string = "buff_fnt";
    export const FONT_OTHER:string = "other_fnt";

    // 前后端检测的属性
    export let CHECK_PROP:string = "id,pos,skillId,round,phyAtk,phyDef,magAtk,magDef,hp,maxhp,target";

    export let AREA_POS:egret.Point[] = [new egret.Point(380, 330), new egret.Point(100, 330)];

    export const ROLE_Z_INDEX_ARR:number[] = [0,3,6,1,4,7,2,5,8]

    export let POS_MAP:egret.Point[][] = [
        [
            new egret.Point(130,260), new egret.Point(130, 340), new egret.Point(130, 420),
            new egret.Point(60, 260), new egret.Point(60, 340), new egret.Point(60, 420),
            new egret.Point(0, 240), new egret.Point(0, 320), new egret.Point(0, 400),
        ],
        [
            new egret.Point(350, 260), new egret.Point(350, 340), new egret.Point(350, 420),
            new egret.Point(420, 260), new egret.Point(420, 340), new egret.Point(420, 420),
            new egret.Point(480, 240), new egret.Point(480, 320), new egret.Point(480, 400),
        ]
    ];
}