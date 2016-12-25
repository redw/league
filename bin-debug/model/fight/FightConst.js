/**
 * Created by hh on 16/12/20.
 */
var FightStateEnum;
(function (FightStateEnum) {
    FightStateEnum[FightStateEnum["Wait"] = 1] = "Wait";
    FightStateEnum[FightStateEnum["Fight"] = 2] = "Fight";
    FightStateEnum[FightStateEnum["End"] = 3] = "End";
})(FightStateEnum || (FightStateEnum = {}));
var FightTypeEnum;
(function (FightTypeEnum) {
    FightTypeEnum[FightTypeEnum["PVE"] = 1] = "PVE";
    FightTypeEnum[FightTypeEnum["PVP"] = 2] = "PVP";
    FightTypeEnum[FightTypeEnum["DUP"] = 3] = "DUP";
})(FightTypeEnum || (FightTypeEnum = {}));
var FightFontEffEnum;
(function (FightFontEffEnum) {
    FightFontEffEnum[FightFontEffEnum["OTHER"] = 0] = "OTHER";
    FightFontEffEnum[FightFontEffEnum["PHYSICAL_ATK"] = 1] = "PHYSICAL_ATK";
    FightFontEffEnum[FightFontEffEnum["MAGIC_ATK"] = 2] = "MAGIC_ATK";
    FightFontEffEnum[FightFontEffEnum["ADD_HP"] = 3] = "ADD_HP";
    FightFontEffEnum[FightFontEffEnum["SYSTEM"] = 4] = "SYSTEM";
})(FightFontEffEnum || (FightFontEffEnum = {}));
var FightSideEnum;
(function (FightSideEnum) {
    FightSideEnum[FightSideEnum["LEFT_SIDE"] = 1] = "LEFT_SIDE";
    FightSideEnum[FightSideEnum["RIGHT_SIDE"] = 2] = "RIGHT_SIDE";
})(FightSideEnum || (FightSideEnum = {}));
var fight;
(function (fight) {
    fight.TEST_BUNCH = null;
    fight.TEST_OTHER_HERO = null;
    fight.TEST_SELF_HERO = [101];
    fight.WIDTH = 480;
    fight.HEIGHT = 460;
    fight.ROLE_UP_LIMIT = 9;
    // 判断角色死亡的血量上限
    fight.DIE_HP = 1;
    // 同时出战的时间间隔
    fight.MEANWHILE_FIGHT_DELAY_TIME = 200;
    // 完成一步的时间间隔
    fight.STEP_DELAY_TIME = 10;
    // 能否同时出战
    fight.CAN_MEANWHILE_FIGHT = false;
    // 回退的时间间隔
    fight.RETREAT_TIME = 150;
    // 移动的时间
    fight.MOVE_TIME = 150;
    // 移动攻击时,距离目标点的位置
    fight.MOVE_ATTACK_OFF = 100;
    // 子弹飞行时间
    fight.BULLET_RUN_TIME = 100;
    // 子弹间间隔
    fight.BULLET_RUN_DELAY_TIME = 50;
    // 死亡延迟时间
    fight.DIE_DELAY_TIME = 1000;
    // 生命条缓动时间
    fight.LIFE_BAR_TWEEN_TIME = 200;
    // 战斗步骤上限
    fight.STEP_UP_LIMIT = 50;
    /** pve场景偏移 */
    fight.PVE_SCENE_OFF = -60;
    /** pvp 场景偏移 */
    fight.PVP_SCENE_OFF = 100;
    fight.ATTACK_ACTION_NORMAL = "normal_attack";
    fight.ATTACK_ACTION_ROW = "row_attack";
    fight.ATTACK_ACTION_JUMP = "jump_attack";
    fight.ATTACK_ACTION_AREA = "area";
    fight.ATTACK_ACTION_TURN = "turn";
    fight.ATTACK_ACTION_MISSLE = "missle";
    fight.ATTACK_ACTION_NO_MISSLE = "no_missle";
    fight.LOG_FIGHT_INFO = 1;
    fight.LOG_FIGHT_REPORT = 2;
    fight.LOG_FIGHT_STEP_START = 5;
    fight.LOG_FIGHT_ROLE_DIE = 10;
    fight.LOG_FIGHT_STEP_END = 15;
    fight.LOG_FIGHT_WARN = 50;
    fight.LOG_FIGHT_ERROR = 100;
    fight.FORE_GROUND_MOVE_TIME = 400;
    fight.MIDDLE_GROUND_MOVE_TIME = 500;
    fight.BACK_GROUND_MOVE_TIME = 650;
    fight.FORE_GROUND_MOVE_EASE = "quintInOut";
    fight.MIDDLE_GROUND_MOVE_EASE = "quintInOut";
    fight.BACK_GROUND_MOVE_EASE = "quintInOut";
    // 前后端检测的属性
    fight.CHECK_PROP = "id,pos,skillId,buff,round,phyAtk,phyDef,magAtk,magDef,hp,target";
    fight.AREA_POS = [new egret.Point(360, 230), new egret.Point(120, 230)];
    fight.POS_MAP = [
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
})(fight || (fight = {}));
//# sourceMappingURL=FightConst.js.map