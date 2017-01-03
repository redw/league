/**
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
    DUP
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

module fight{

    export let TEST_BUNCH:string = "a";
    export let TEST_OTHER_HERO = [403,411,417,418,420,422,0,0,0];
    export let TEST_SELF_HERO = [101,102,103,104,105,106,0,0,0];
    export let TEST_RANDOM:boolean = false;
    export let TEST_DATA:boolean = false;
    export let TEST_ROLE:any[];

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
    export let MEANWHILE_FIGHT_DELAY_TIME:number = 200;
    // 完成一步的时间间隔
    export let STEP_DELAY_TIME:number = 10;
    // 能否同时出战
    export let CAN_MEANWHILE_FIGHT:boolean = false;
    // 回退的时间间隔
    export let RETREAT_TIME:number = 150;
    // 移动的时间
    export let MOVE_TIME:number = 150;
    // 移动攻击时,距离目标点的位置
    export let MOVE_ATTACK_OFF:number = 100;
    // 子弹飞行时间
    export let BULLET_RUN_TIME:number = 100;
    // 子弹间间隔
    export let BULLET_RUN_DELAY_TIME:number = 50;
    // 死亡延迟时间
    export let DIE_DELAY_TIME:number = 300;
    // 生命条缓动时间
    export let LIFE_BAR_TWEEN_TIME:number = 200;

    // 战斗步骤上限
    export const STEP_UP_LIMIT:number = 100;

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
    export const LOG_FIGHT_STEP_START:number = 5;
    export const LOG_FIGHT_ROLE_DIE:number = 10;
    export const LOG_FIGHT_STEP_END:number = 15;
    export const LOG_FIGHT_WARN:number = 50;
    export const LOG_FIGHT_ERROR:number = 100;

    export let FORE_GROUND_MOVE_TIME:number = 400;
    export let MIDDLE_GROUND_MOVE_TIME:number = 500;
    export let BACK_GROUND_MOVE_TIME:number = 650;
    export let FORE_GROUND_MOVE_EASE:string = "quintInOut";
    export let MIDDLE_GROUND_MOVE_EASE:string = "quintInOut";
    export let BACK_GROUND_MOVE_EASE:string = "quintInOut";

    // 前后端检测的属性
    export let CHECK_PROP:string = "id,pos,skillId,buff,round,phyAtk,phyDef,magAtk,magDef,hp,target";

    export let AREA_POS:egret.Point[] = [new egret.Point(360, 230), new egret.Point(120, 230)];
    export let POS_MAP:egret.Point[][] = [
        [
            new egret.Point(160, 200), new egret.Point(160, 270), new egret.Point(160, 350),
            new egret.Point(80, 200), new egret.Point(80, 270), new egret.Point(80, 350),
            new egret.Point(40, 200), new egret.Point(40, 270), new egret.Point(40, 350),
        ],
        [
            new egret.Point(320, 200), new egret.Point(320, 270), new egret.Point(320, 350),
            new egret.Point(400, 200), new egret.Point(400, 270), new egret.Point(400, 350),
            new egret.Point(440, 200), new egret.Point(440, 270), new egret.Point(440, 350),
        ]
    ];
}