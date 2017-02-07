/**
 * 角色工厂
 * Created by hh on 2016/12/23.
 */
var FightRoleFactory = (function () {
    function FightRoleFactory() {
    }
    var d = __define,c=FightRoleFactory,p=c.prototype;
    FightRoleFactory.createRole = function (fightContainer, fightRoleVO) {
        var arr = FightRoleFactory.map[fightRoleVO.config.id];
        var role;
        if (arr && arr.length > 0) {
            role = arr.shift();
            role.active(fightContainer, fightRoleVO);
            role.idle();
        }
        else {
            role = new FightRole(fightContainer, fightRoleVO);
        }
        var point = fight.getRoleInitPoint(fightRoleVO);
        role.x = point.x;
        role.y = point.y;
        return role;
    };
    FightRoleFactory.freeRole = function (role) {
        if (!FightRoleFactory.map[role.id]) {
            FightRoleFactory.map[role.id] = [];
        }
        FightRoleFactory.map[role.id].push(role);
    };
    FightRoleFactory.map = {};
    return FightRoleFactory;
}());
egret.registerClass(FightRoleFactory,'FightRoleFactory');
//# sourceMappingURL=FightRoleFactory.js.map