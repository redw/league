/**
 * 技能配置
 *
 * Created by honghong on 16/11/26.
 */
interface SkillConfig {
    "buff_id": number;
    "damage": number;
    "type": string;
    "effect_damage_frame": number;
    "is_block": number;
    "scource_effect": string;
    "target_group": string;
    "target_effect": string;
    "action_type": string;
    "jump_frame": number;
    "target_area": string;
    "damage_type": string;
    "id":number;
    "target_cond": string;
    "one_cond": number;
    "name": string;
    "tip": string;
    "damage_frame": number;
    "is_dodge": number;
    "trigger_chance": number;
    "action": string;
    "repeat": number;
    "scource_sound":string;
    "target_sound":string;
    "dead_sound":string;
    "target_point":string[];
    "shoot_point":string[];
    "missle_speed":number;
     "area_effect_point":string;
     "shake_type":number;
     "move_position":number[];
}
