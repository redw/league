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

    export const WIDTH:number = 480;
    export const HEIGHT:number = 460;

    // 同时出战的时间间隔
    export let MEANWHILE_FIGHT_DELAY_TIME:number = 200;
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
    export let DIE_DELAY_TIME:number = 1000;
    // 生命条缓动时间
    export let LIFE_BAR_TWEEN_TIME:number = 200;

    // 战斗步骤上限
    export const STEP_UP_LIMIT:number = 300;

    export const ATTACK_ACTION_NORMAL:string = "normal_attack";
    export const ATTACK_ACTION_ROW:string = "row_attack";
    export const ATTACK_ACTION_JUMP:string = "jump_attack";
    export const ATTACK_ACTION_AREA:string = "area";
    export const ATTACK_ACTION_TURN:string = "turn";
    export const ATTACK_ACTION_MISSLE:string = "missle";
    export const ATTACK_ACTION_NO_MISSLE:string = "no_missle";

    export const LOG_FIGHT_INFO:number = 1;
    export const LOG_FIGHT_STEP_START:number = 5;
    export const LOG_FIGHT_ROLE_DIE:number = 10;
    export const LOG_FIGHT_STEP_END:number = 15;
    export const LOG_FIGHT_WARN:number = 50;
    export const LOG_FIGHT_ERROR:number = 100;

    export const FORE_GROUND_MOVE_TIME:number = 440;
    export const MIDDLE_GROUND_MOVE_TIME:number = 500;
    export const BACK_GROUND_MOVE_TIME:number = 560;
    export const FORE_GROUND_MOVE_EASE:string = "quintInOut";
    export const MIDDLE_GROUND_MOVE_EASE:string = "quintInOut";
    export const BACK_GROUND_MOVE_EASE:string = "quintInOut";

    export let AREA_POS:egret.Point[] = [new egret.Point(360, 230), new egret.Point(120, 230)];
    export let POS_MAP:egret.Point[][] = [
        [
            new egret.Point(160, 250), new egret.Point(160, 320), new egret.Point(160, 400),
            new egret.Point(80, 250), new egret.Point(80, 320), new egret.Point(80, 400),
            new egret.Point(40, 250), new egret.Point(40, 320), new egret.Point(40, 400),
        ],
        [
            new egret.Point(320, 250), new egret.Point(320, 320), new egret.Point(320, 400),
            new egret.Point(400, 250), new egret.Point(400, 320), new egret.Point(400, 400),
            new egret.Point(440, 250), new egret.Point(440, 320), new egret.Point(440, 400),
        ]
    ];
}