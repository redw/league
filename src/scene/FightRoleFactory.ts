/**
 * Created by Administrator on 2016/12/23.
 */
class FightRoleFactory{
    private static map = {};

    public static createRole(fightContainer:FightContainer, vo:FightRoleVO) {
        let arr = FightRoleFactory.map[vo.id];
        let role:FightRole;
        if (arr && arr.length > 0) {
            role = arr.shift();
            role.active(fightContainer, vo);
            role.idle();
        } else {
            role = new FightRole(fightContainer, vo);
        }
        return role;
    }

    public static freeRole(role:FightRole) {
        if (!FightRoleFactory.map[role.id]) {
            FightRoleFactory.map[role.id] = [];
        }
        FightRoleFactory.map[role.id].push(role);
    }
}