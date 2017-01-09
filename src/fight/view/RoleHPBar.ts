/**
 * Created by Administrator on 2016/12/26.
 */
class RoleHPBar extends egret.DisplayObjectContainer {
    private backGround:AutoBitmap;
    private hitBitmap:AutoBitmap;
    private hpBitmap:AutoBitmap;
    private effBitmap:AutoBitmap;
    private side:number;
    public static WIDTH:number = 62;
    public static HEIGHT:number = 8;

    public constructor(side:number=FightSideEnum.LEFT_SIDE)
    {
        super();
        this.side = side;

        this.backGround = new AutoBitmap();
        this.addChild(this.backGround);
        this.backGround.source = "pvp_blood_background_png";

        this.hpBitmap = new AutoBitmap();
        this.hpBitmap.x = 1;
        this.hpBitmap.y = 1;
        if (side == FightSideEnum.LEFT_SIDE) {
            this.hpBitmap.source = "pvp_blood_png";
        } else {
            this.hpBitmap.source = "pvp_blood_enemy_png";
        }
        this.addChild(this.hpBitmap);

        this.hitBitmap = new AutoBitmap();
        this.hitBitmap.source = "pvp_blood_hit_png";
        this.hitBitmap.x = 1;
        this.hitBitmap.y = 1;
        this.hitBitmap.visible = false;
        this.addChild(this.hitBitmap);
    }

    public setProgress(value:number){
        let w = MathUtil.clamp(value,0,1) * (RoleHPBar.WIDTH - 2);
        this.hpBitmap.width = w;
        this.hitBitmap.width = w;
        if (this.side == FightSideEnum.LEFT_SIDE) {
            this.hpBitmap.x = 1;
            this.hitBitmap.x = 1;
        } else {
            this.hpBitmap.x = RoleHPBar.WIDTH - w - 1;
            this.hitBitmap.x = RoleHPBar.WIDTH - w - 1;
        }
        this.hitBitmap.visible = true;
        this.hitBitmap.alpha = 0.8;
        let tween = egret.Tween.get(this.hitBitmap);
        tween.to({alpha:1}, 200);
        tween.to({alpha:0.4}, 200);
        tween.call(()=>{
            egret.Tween.removeTweens(this.hitBitmap);
            this.hpBitmap.visible = true;
            this.hitBitmap.visible = false;
        }, this);
        this.hpBitmap.visible = false;
    }
}