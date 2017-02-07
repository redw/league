/**
 * Created by Administrator on 2017/1/18.
 */
var SkillNameEff = (function (_super) {
    __extends(SkillNameEff, _super);
    function SkillNameEff(content) {
        _super.call(this);
        this.bitmap = new PriorityImage(fight.LOAD_PRIORITY_SKILL_NAME);
        this.bitmap.source = content + "_png";
        this.addChild(this.bitmap);
        this.timeOut = egret.setTimeout(this.disappear, this, 2000);
    }
    var d = __define,c=SkillNameEff,p=c.prototype;
    p.disappear = function () {
        egret.clearTimeout(this.timeOut);
        this.removeChild(this.bitmap);
        this.bitmap = null;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return SkillNameEff;
}(egret.DisplayObjectContainer));
egret.registerClass(SkillNameEff,'SkillNameEff');
//# sourceMappingURL=SkillNameEff.js.map