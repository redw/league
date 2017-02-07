/**
 * Created by Administrator on 2017/1/18.
 */
class SkillNameEff extends egret.DisplayObjectContainer {
    private bitmap:PriorityImage;
    private timeOut:number;

    public constructor(content:string) {
        super();

        this.bitmap = new PriorityImage(fight.LOAD_PRIORITY_SKILL_NAME);
        this.bitmap.source = `${content}_png`;
        this.addChild(this.bitmap);

        this.timeOut = egret.setTimeout(this.disappear, this, 2000);
    }

    private disappear(){
        egret.clearTimeout(this.timeOut);
        this.removeChild(this.bitmap);
        this.bitmap = null;

        if (this.parent) {
            this.parent.removeChild(this);
        }

    }
}