/**
 * Created by Administrator on 2016/12/23.
 */
class FightRoleFactory{
    private static map = {};

    public static createRole(fightContainer:FightContainer, roleData:FightRoleData) {
        let arr = FightRoleFactory.map[roleData.config.id];
        let role:FightRole;
        if (arr && arr.length > 0) {
            role = arr.shift();
            role.active(fightContainer, roleData);
            role.idle();
        } else {
            role = new FightRole(fightContainer, roleData);
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