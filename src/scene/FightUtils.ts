/**
 * Created by Administrator on 2016/11/30.
 */
module fight{
    // 左边角色
    export const SIDE_LEFT:number = 1;
    // 右边角色
    export const SIDE_RIGHT:number = 2;

    // 同时出战的时间间隔
    export const MEANWHILE_FIGHT_DELAY_TIME:number = 200;
    // 能否同时出战
    export const CAN_MEANWHILE_FIGHT:boolean = false;
    // 回退的时间间隔
    export const RETREAT_TIME:number = 150;
    // 移动的时间
    export const MOVE_TIME:number = 150;
    // 移动攻击时,距离目标点的位置
    export const MOVE_ATTACK_OFF:number = 100;

    export const LOG_FIGHT_INFO:number = 1;
    export const LOG_FIGHT_STEP_START:number = 5;
    export const LOG_FIGHT_ROLE_DIE:number = 10;
    export const LOG_FIGHT_STEP_END:number = 15;
    export const LOG_FIGHT_WARN:number = 50;
    export const LOG_FIGHT_ERROR:number = 100;


    let POS_MAP:egret.Point[][] = [
        [
            new egret.Point(160, 200), new egret.Point(160, 280), new egret.Point(160, 380),
            new egret.Point(110, 240), new egret.Point(110, 280), new egret.Point(110, 340),
            new egret.Point(60, 200), new egret.Point(60, 280), new egret.Point(60, 380),
        ],
        [
            new egret.Point(320, 200), new egret.Point(320, 280), new egret.Point(350, 380),
            new egret.Point(370, 240), new egret.Point(370, 280), new egret.Point(370, 340),
            new egret.Point(420, 200), new egret.Point(420, 280), new egret.Point(420, 380),
        ]
    ];

    /**
     * 得到角色的描述信息
     * @param role RoleData或FightRole
     * @returns {string}
     */
    export function getRolePosDes(role:any){
        let result = "";
        let arr = [];
        if (role.length >= 1) {
            arr = role.concat();
        } else {
            arr = [role];
        }
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            if (arr[i].roleData)
                result += (arr[i].roleData.side + "_" + arr[i].roleData.pos);
            else
                result += (arr[i].side + "_" + arr[i].pos);

            if (i < len - 1)
                result += ",";
        }
        return result;
    }

    /**
     * 选取目标通用规则
     * @param value 排或列
     * @returns {[number,number,number]}
     */
    export function getCommonOrders(value: number) {
        if (value == 1) {
            return [1, 0, 2];
        } else if (value == 2) {
            return [2, 1, 0];
        } else {
            return [0, 1, 2];
        }
    }

    /**
     * 是否是英雄
     * @param roleId
     * @returns {boolean}
     */
    export function isHero(roleId:number){
        return roleId < 200;
    }

    /**
     * 是否是boss
     * @param roleId
     * @returns {boolean}
     */
    export function isBoss(roleId:number) {
        let result = false;
        if (!isHero(roleId)) {
            result = Config.EnemyData[roleId].boss
        }
        return result;
    }

    /**
     * 得到近战攻击玩家时的攻击位置
     * @param role
     * @returns {Point}
     */
    export function getNearFightPoint(role:{side:number, pos:number}){
        let point = getRoleInitPoint(role);
        if (role.side == SIDE_LEFT) {
            point.x += MOVE_ATTACK_OFF;
        } else {
            point.x -= MOVE_ATTACK_OFF;
        }
        return point;
    }

    /**
     * 得到角色出生位置
     * @param role  角色数据
     * @returns {Point}
     */
    export function  getRoleInitPoint(role:{side:number, pos:number}){
        let side = role.side - 1;
        let pos = role.pos;
        return POS_MAP[side][pos].clone();
    }

    /**
     * 记录日志
     * @param content
     * @param level
     */
    export function recordLog(content:any, level:number=0){
        if (level >= LOG_FIGHT_ERROR) {
            egret.error(content);
        } else if (level >= LOG_FIGHT_WARN) {
            egret.warn(content);
        } else {
            egret.log(content);
        }
    }

    /**
     * 需要移动攻击
     * @param action
     */
    export function needMoveAttack(action:string){
        return action == "normal_attack" || action == "jump_attack" || action == "row_attack";
    }

    /**
     * 播放mc的帧标签
     * @param label
     * @param mc
     * @param count
     * @param id
     * @returns {boolean}   成功播放,返回true,否则返回false
     */
    export function playFrameLabel(label:string, mc:egret.MovieClip, count:number=1, id:number|string=0) {
        let result = false;
        if (mc && mc["frameLabels"] && mc["frameLabels"].indexOf(label)) {
            result = true;
            try {
                mc.gotoAndPlay(label, count);
            } catch (e) {
                result = false;
                recordLog(`播放资源${id}帧${label}错误`, LOG_FIGHT_WARN);
            }
        } else {
            recordLog(`资源${id} 不存在在帧标签`, LOG_FIGHT_WARN);
        }
        return result;
    }

    /**
     * 添加战斗伤害效果
     * @param parent
     * @param text
     * @param off
     */
    export  function addHurtText(parent:egret.DisplayObjectContainer, text:string, off:{x:number,y:number} = {x:0,y:0}) {
        let container:egret.DisplayObjectContainer = parent;
        let txtHp: egret.TextField = new egret.TextField;
        txtHp.textAlign = egret.HorizontalAlign.CENTER;
        txtHp.verticalAlign = egret.VerticalAlign.MIDDLE;
        txtHp.textColor = 0xFA725D;
        txtHp.fontFamily = Global.SYS_FONT;
        txtHp.size = 16;
        txtHp.bold = true;
        txtHp.stroke = 2;
        txtHp.strokeColor = 0x672B23;
        txtHp.text = text;
        txtHp.x = container.scaleX < 0 ? off.x - 10 : off.x + 10;
        txtHp.y = off.y ;
        txtHp.scaleX = container.scaleX;
        container.addChild(txtHp);
        egret.Tween.get(txtHp).to({ y: off.y - 20, x: container.scaleX < 0 ? off.x - 20 : off.x + 20 },300,egret.Ease.bounceOut).wait(200).to({scaleX:0.5,scaleY:0.5, alpha: 0 },300).call(function() {
            egret.Tween.removeTweens(txtHp);
            DisplayUtil.removeFromParent(txtHp);
        },txtHp);
    }
}