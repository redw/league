/**
 * Created by Administrator on 2016/12/23.
 */
var FightRoleFactory = (function () {
    function FightRoleFactory() {
    }
    var d = __define,c=FightRoleFactory,p=c.prototype;
    FightRoleFactory.createRole = function (fightContainer, roleData) {
        var arr = FightRoleFactory.map[roleData.config.id];
        var role;
        if (arr && arr.length > 0) {
            role = arr.shift();
            role.active(fightContainer, roleData);
            role.idle();
        }
        else {
            role = new FightRole(fightContainer, roleData);
        }
        return role;
    };
    FightRoleFactory.freeRole = function (role) {
        if (!FightRoleFactory.map[role.roleData.id]) {
            FightRoleFactory.map[role.roleData.id] = [];
        }
        FightRoleFactory.map[role.roleData.id].push(role);
    };
    FightRoleFactory.map = {};
    return FightRoleFactory;
}());
egret.registerClass(FightRoleFactory,'FightRoleFactory');
//# sourceMappingURL=FightRoleFactory.js.map