/**
 * 战斗中的一些常量
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
    FightTypeEnum[FightTypeEnum["BOSS"] = 3] = "BOSS";
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
var BuffTypeEnum;
(function (BuffTypeEnum) {
    BuffTypeEnum[BuffTypeEnum["PHYSICAL_ATK"] = 1] = "PHYSICAL_ATK";
    BuffTypeEnum[BuffTypeEnum["MAGIC_ATK"] = 2] = "MAGIC_ATK";
    BuffTypeEnum[BuffTypeEnum["PHYSICAL_DEF"] = 3] = "PHYSICAL_DEF";
    BuffTypeEnum[BuffTypeEnum["MAGIC_DEF"] = 4] = "MAGIC_DEF";
    BuffTypeEnum[BuffTypeEnum["HURT_OUT"] = 5] = "HURT_OUT";
    BuffTypeEnum[BuffTypeEnum["HURT"] = 6] = "HURT";
    BuffTypeEnum[BuffTypeEnum["BACK_HURT"] = 7] = "BACK_HURT";
    BuffTypeEnum[BuffTypeEnum["BACK_HURT_OUT"] = 8] = "BACK_HURT_OUT";
    BuffTypeEnum[BuffTypeEnum["VERTIGO"] = 9] = "VERTIGO";
    BuffTypeEnum[BuffTypeEnum["ADD_BLOOD"] = 10] = "ADD_BLOOD";
    BuffTypeEnum[BuffTypeEnum["POISONING"] = 11] = "POISONING";
    BuffTypeEnum[BuffTypeEnum["HIDE"] = 12] = "HIDE";
    BuffTypeEnum[BuffTypeEnum["INVINCIBLE"] = 13] = "INVINCIBLE";
    BuffTypeEnum[BuffTypeEnum["FREE_PHYSICAL"] = 14] = "FREE_PHYSICAL";
    BuffTypeEnum[BuffTypeEnum["FREE_MAGIC"] = 15] = "FREE_MAGIC";
    BuffTypeEnum[BuffTypeEnum["ATK_MORE_MORE"] = 16] = "ATK_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["KILL_MORE_MORE"] = 17] = "KILL_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["BLOOD_MORE_MORE"] = 18] = "BLOOD_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["SEAL_MAGIC"] = 19] = "SEAL_MAGIC";
    BuffTypeEnum[BuffTypeEnum["DEF_MORE_MORE"] = 20] = "DEF_MORE_MORE";
    BuffTypeEnum[BuffTypeEnum["FORBIDDEN_ADD_BLOOD"] = 21] = "FORBIDDEN_ADD_BLOOD";
    BuffTypeEnum[BuffTypeEnum["ATTACK_KEY"] = 22] = "ATTACK_KEY";
    BuffTypeEnum[BuffTypeEnum["XIA_MA_WEI"] = 23] = "XIA_MA_WEI";
    BuffTypeEnum[BuffTypeEnum["FIRE_WILL"] = 24] = "FIRE_WILL";
    BuffTypeEnum[BuffTypeEnum["TO_BOSS"] = 25] = "TO_BOSS";
    BuffTypeEnum[BuffTypeEnum["CHANGE_DODGE"] = 26] = "CHANGE_DODGE";
    BuffTypeEnum[BuffTypeEnum["CHANGE_BLOCK"] = 27] = "CHANGE_BLOCK";
    BuffTypeEnum[BuffTypeEnum["CHANGE_CRIT"] = 28] = "CHANGE_CRIT";
    BuffTypeEnum[BuffTypeEnum["CHANGE_CRIT_HURT"] = 29] = "CHANGE_CRIT_HURT";
    BuffTypeEnum[BuffTypeEnum["LIFE"] = 30] = "LIFE"; // 生命
})(BuffTypeEnum || (BuffTypeEnum = {}));
var FightRoleState;
(function (FightRoleState) {
    FightRoleState[FightRoleState["IDLE"] = 0] = "IDLE";
    FightRoleState[FightRoleState["ATTACK"] = 1] = "ATTACK";
    FightRoleState[FightRoleState["SKILL_ATTACK"] = 2] = "SKILL_ATTACK";
    FightRoleState[FightRoleState["ATTACKED"] = 3] = "ATTACKED";
    FightRoleState[FightRoleState["BLOCK"] = 4] = "BLOCK";
    FightRoleState[FightRoleState["MOVE"] = 5] = "MOVE";
    FightRoleState[FightRoleState["RETREAT"] = 6] = "RETREAT"; // 撤回
})(FightRoleState || (FightRoleState = {}));
var fight;
(function (fight) {
    fight.TEST_BUNCH = null;
    fight.TEST_OTHER_HERO = null;
    fight.TEST_SELF_HERO = null;
    fight.TEST_BATTLE = false;
    fight.WIDTH = 480;
    fight.HEIGHT = 460;
    fight.MAP_SWITCH_SIZE = 50;
    fight.MAP_SIZE_HEIGHT = 520;
    // 角色上限
    fight.ROLE_UP_LIMIT = 9;
    // 阴影偏移
    fight.ROLE_SHADOW_OFF = -20;
    // 判断角色死亡的血量上限
    fight.DIE_HP = 1;
    // 同时出战的时间间隔
    fight.MEANWHILE_FIGHT_DELAY_TIME = 50;
    // 完成一步的时间间隔
    fight.STEP_DELAY_TIME = 200;
    // 能否同时出战
    fight.CAN_MEANWHILE_FIGHT = true;
    // 回退的时间间隔
    fight.RETREAT_TIME = 150;
    // 移动的时间
    fight.MOVE_TIME = 150;
    // 移动攻击时,距离目标点的位置
    fight.MOVE_ATTACK_OFF = 100;
    // 子弹间间隔
    fight.BULLET_RUN_DELAY_TIME = 0;
    // 死亡延迟时间
    fight.DIE_DELAY_TIME = 600;
    // 回合数上限
    fight.ROUND_LIMIT = 20;
    fight.ATTACK_ACTION_NORMAL = "normal_attack";
    fight.ATTACK_ACTION_ROW = "row_attack";
    fight.ATTACK_ACTION_JUMP = "jump_attack";
    fight.ATTACK_ACTION_JUMP_AREA = "jump_area";
    fight.ATTACK_ACTION_AREA = "area";
    fight.ATTACK_ACTION_TURN = "turn";
    fight.ATTACK_ACTION_BOMB = "bomb";
    fight.ATTACK_ACTION_MISSLE = "missle";
    fight.ATTACK_ACTION_NO_MISSLE = "no_missle";
    fight.LOG_FIGHT_INFO = 1;
    fight.LOG_FIGHT_PLAY = 5;
    fight.LOG_FIGHT_DATA = 10;
    fight.LOG_FIGHT_WARN = 50;
    fight.LOG_FIGHT_ERROR = 100;
    fight.FORE_GROUND_MOVE_TIME = 500;
    fight.MIDDLE_GROUND_MOVE_TIME = 500;
    fight.BACK_GROUND_MOVE_TIME = 500;
    fight.FORE_GROUND_MOVE_DISTANCE = 800;
    fight.MIDDLE_GROUND_MOVE_DISTANCE = 480;
    fight.BACK_GROUND_MOVE_DISTANCE = 100;
    fight.FORE_GROUND_MOVE_EASE = "quintInOut";
    fight.MIDDLE_GROUND_MOVE_EASE = "quintInOut";
    fight.BACK_GROUND_MOVE_EASE = "quintInOut";
    fight.FONT_PHYSICAL_DAMAGE = "physical_damage_fnt";
    fight.FONT_ADD_HP = "hp_fnt";
    fight.FONT_MAGICAL_DAMAGE = "magical_damage_fnt";
    fight.FONT_STAGE = "stage_fnt";
    fight.FONT_SYSTEM = "buff_fnt";
    fight.FONT_OTHER = "other_fnt";
    fight.FONT_PVE_TITLE = "pve_title_fnt";
    // 前后端检测的属性
    fight.CHECK_PROP = "id,pos,skillId,round,phyAtk,phyDef,magAtk,magDef,hp,maxhp,target";
    fight.AREA_POS = [new egret.Point(380, 330), new egret.Point(100, 330)];
    // 角色z排序
    fight.ROLE_Z_INDEX_ARR = [0, 3, 6, 1, 4, 7, 2, 5, 8];
    // 当添加角色index时,添加area容器
    fight.ADD_AREA_IN_INDEX = 6;
    fight.ADD_DROP_IN_INDEX = [6, 7];
    fight.DROP_POS = [new egret.Point(240, 300), new egret.Point(240, 380)];
    fight.POS_MAP = [
        [
            new egret.Point(130, 260), new egret.Point(120, 340), new egret.Point(110, 420),
            new egret.Point(60, 260), new egret.Point(50, 340), new egret.Point(40, 420),
            new egret.Point(0, 240), new egret.Point(0, 320), new egret.Point(0, 400),
        ],
        [
            new egret.Point(370, 260), new egret.Point(360, 340), new egret.Point(350, 420),
            new egret.Point(440, 260), new egret.Point(430, 340), new egret.Point(420, 420),
            new egret.Point(480, 240), new egret.Point(480, 320), new egret.Point(480, 400),
        ]
    ];
    fight.RUN_METHOD = 1;
})(fight || (fight = {}));
//# sourceMappingURL=FightConst.js.map