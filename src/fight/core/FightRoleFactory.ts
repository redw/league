/**
 * 角色工厂
 * Created by hh on 2016/12/23.
 */
class FightRoleFactory{
    private static map = {};

    public static createRole(fightContainer:FightContainer, fightRoleVO:FightRoleVO) {
        let arr = FightRoleFactory.map[fightRoleVO.config.id];
        let role:FightRole;
        if (arr && arr.length > 0) {
            role = arr.shift();
            role.active(fightContainer, fightRoleVO);
            role.idle();
        } else {
            role = new FightRole(fightContainer, fightRoleVO);
        }
        let point = fight.getRoleInitPoint(fightRoleVO);
        role.x = point.x;
        role.y = point.y;
        return role;
    }

    public static freeRole(role:FightRole) {
        if (!FightRoleFactory.map[role.id]) {
            FightRoleFactory.map[role.id] = [];
        }
        FightRoleFactory.map[role.id].push(role);
    }
}