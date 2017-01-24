/**
 * Created by Administrator on 2016/12/16.
 */
class Config extends egret.HashObject {
    static HeroData:any;
    static EnemyData:any;
    static SkillData:any;
    static BuffData:any;
    static StageData:any;
    static FightConfig:any;
    static DropData:any;
    static TriggerChanceData:any;
    static StageCommonData:any;
    static WeaponFb:any;

    static init() {
        Config.FightConfig = RES.getRes("fight_config_json");
        Config.HeroData = RES.getRes("n2_hero_json");
        Config.EnemyData =RES.getRes("n2_pve_enemy_json");
        Config.SkillData = RES.getRes("n2_hero_skill_json");
        Config.TriggerChanceData = RES.getRes("n2_trigger_chance_json");
        Config.BuffData = RES.getRes("n2_buff_json");
        Config.DropData = RES.getRes("n2_pve_item_json");
        Config.StageData = RES.getRes("n2_pve_stage_json");
        Config.StageCommonData = RES.getRes("n2_pve_asset_json");
        Config.WeaponFb = RES.getRes("n2_weapon_fb_json");


        // 同时出战的时间间隔
        fight.MEANWHILE_FIGHT_DELAY_TIME = +Config.FightConfig.meanwhile_fight_delay_time;
        // 完成一步的时间间隔
        fight.STEP_DELAY_TIME = +Config.FightConfig.step_delay_time;
        // 能否同时出战
        fight.CAN_MEANWHILE_FIGHT = Boolean(Config.FightConfig.can_meanwhile_fight);
        // 回退的时间间隔
        fight.RETREAT_TIME = +Config.FightConfig.retreat_time;
        // 移动的时间
        fight.MOVE_TIME = +Config.FightConfig.move_time;
        // 移动攻击时,距离目标点的位置
        fight.MOVE_ATTACK_OFF = +Config.FightConfig.move_attack_position_off;
        // 子弹间间隔
        fight.BULLET_RUN_DELAY_TIME = +Config.FightConfig.bullet_run_delay_time;
        // 死亡延迟时间
        fight.DIE_DELAY_TIME = +Config.FightConfig.die_delay_time;

        if (Config.FightConfig.left_roles)
            fight.TEST_SELF_HERO = Config.FightConfig.left_roles.concat();
        if (Config.FightConfig.right_roles)
            fight.TEST_OTHER_HERO = Config.FightConfig.right_roles.concat();
        UserProxy.inst.curArea = +Config.FightConfig.init_level || 1;

        if (Config.FightConfig.area_right_pos) {
            let arr = Config.FightConfig.area_right_pos.split(",");
            fight.AREA_POS[0].x = +arr[0];
            fight.AREA_POS[0].y = +arr[1];
        }

        if (Config.FightConfig.area_left_pos) {
            let arr = Config.FightConfig.area_left_pos.split(",");
            fight.AREA_POS[1].x = +arr[0];
            fight.AREA_POS[1].y = +arr[1];
        }

        let leftPos = Config.FightConfig.left_role_pos;
        for (var i = 0; i < leftPos.length; i++) {
            fight.POS_MAP[0][i].x = leftPos[i][0];
            fight.POS_MAP[0][i].y = leftPos[i][1];
        }

        let rightPos = Config.FightConfig.right_role_pos;
        for (var i = 0; i < rightPos.length; i++) {
            fight.POS_MAP[1][i].x = rightPos[i][0];
            fight.POS_MAP[1][i].y = rightPos[i][1];
        }

        fight.ADD_AREA_IN_INDEX = +Config.FightConfig.add_area_in_index;
        fight.ADD_DROP_IN_INDEX = Config.FightConfig.add_drop_in_index.concat();

        fight.FORE_GROUND_MOVE_TIME = +Config.FightConfig.fore_ground_move_time;
        fight.MIDDLE_GROUND_MOVE_TIME = +Config.FightConfig.middle_ground_move_time;
        fight.BACK_GROUND_MOVE_TIME = +Config.FightConfig.back_ground_move_time;

        fight.FORE_GROUND_MOVE_DISTANCE = +Config.FightConfig.fore_ground_move_distance;
        fight.MIDDLE_GROUND_MOVE_DISTANCE = +Config.FightConfig.middle_ground_move_distance;
        fight.BACK_GROUND_MOVE_DISTANCE = +Config.FightConfig.back_ground_move_distance;

        let dropPos = Config.FightConfig.drop_pos;
        for (let i = 0; i < dropPos.length; i++) {
            fight.DROP_POS[i].x = dropPos[i][0];
            fight.DROP_POS[i].y = dropPos[i][1];
        }
    }
}