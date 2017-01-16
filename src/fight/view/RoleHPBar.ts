/**
 * 角色血条栏
 * Created by hh on 2016/12/26.
 */
class RoleHPBar extends egret.DisplayObjectContainer {
    private side:number;
    private backGround:AutoBitmap;
    private hitBitmap:AutoBitmap;
    private hpBitmap:AutoBitmap;
    private effBitmap:AutoBitmap;
    public static WIDTH:number = 62;
    public static HEIGHT:number = 8;
    private barW:number = 10;
    public isCanRemove:boolean = false;
    private oldProgress:number = -1;

    public constructor(side:number=FightSideEnum.LEFT_SIDE) {
        super();
        this.side = side;

        this.backGround = new AutoBitmap();
        this.addChild(this.backGround);
        this.backGround.source = "pvp_blood_background_png";

        this.hpBitmap = new AutoBitmap();
        if (side == FightSideEnum.LEFT_SIDE) {
            this.hpBitmap.source = "pvp_blood_png";
        } else {
            this.hpBitmap.source = "pvp_blood_enemy_png";
        }
        this.addChild(this.hpBitmap);

        this.hitBitmap = new AutoBitmap("pvp_blood_hit_png");
        this.hitBitmap.visible = false;
        this.addChild(this.hitBitmap);

        this.effBitmap = new AutoBitmap("pvp_blood_line_png");
        this.effBitmap.visible = false;
        this.addChild(this.effBitmap);
    }

    public active(){
        this.isCanRemove = false;
        this.effBitmap.visible = true;

        if (this.side == FightSideEnum.RIGHT_SIDE) {
            this.effBitmap.x = 11;
            this.effBitmap.scaleX = -1;
            this.hpBitmap.x = 2;
            this.hpBitmap.y = 1;
            this.hitBitmap.x = 1;
            this.hitBitmap.y = 1;
            this.effBitmap.y = 1;
            this.effBitmap.visible = true;
            this.hpBitmap.source = "pvp_blood_enemy_png";
        } else {
            this.effBitmap.x = 51;
            this.effBitmap.scaleX = 1;
            this.hpBitmap.x = 1;
            this.hpBitmap.y = 1;
            this.hitBitmap.x = 1;
            this.hitBitmap.y = 1;
            this.effBitmap.y = 1;
            this.effBitmap.visible = true;
            this.hpBitmap.source = "pvp_blood_png";
        }
        this.setProgress(1, false);
    }

    public update(cur:string, max:string) {
        let ratio = +(BigNum.div(cur, max)) || 0;
        let isDie = BigNum.greater(fight.DIE_HP, cur);
        this.setProgress(ratio, isDie);
    }

    public setProgress(value:number, isDie:boolean){
        if (this.oldProgress != value || isDie) {
            let w = MathUtil.clamp(value,0,1) * (RoleHPBar.WIDTH - 2);
            if (this.oldProgress < 0 && !isDie) {
                this.hpBitmap.visible = true;
                this.effBitmap.visible = true;
                this.isCanRemove = true;
                this.refresh(w);
            } else {
                this.hitBitmap.visible = true;
                this.hitBitmap.alpha = 0.8;
                let tween = egret.Tween.get(this.hitBitmap);
                tween.to({alpha:1}, 80);
                tween.to({alpha:0.4}, 80);
                if (isDie) {
                    tween.to({alpha:1}, 80);
                    tween.to({alpha:0.4}, 80);
                    tween.to({alpha:1}, 80);
                    tween.to({alpha:0.4}, 80);
                    tween.to({alpha:1}, 80);
                    tween.to({alpha:0.4}, 80);
                }
                tween.call(()=>{
                    egret.Tween.removeTweens(this.hitBitmap);
                    this.hpBitmap.visible = true;
                    this.effBitmap.visible = false;
                    this.hitBitmap.visible = false;
                    this.refresh(w);
                    if (isDie) {
                        this.hpBitmap.visible = false;
                        this.effBitmap.visible = false;
                        egret.setTimeout(()=>{
                            this.isCanRemove = true;
                        }, this, 100)
                    }
                }, this);
                this.hpBitmap.visible = false;
            }
        }
        this.oldProgress = value;
    }

    private refresh(w:number) {
        this.hpBitmap.width = w;
        this.hitBitmap.width = w;
        let barPos = 0;
        if (this.side == FightSideEnum.LEFT_SIDE) {
            this.hpBitmap.x = 1;
            this.hitBitmap.x = 1;
            this.effBitmap.scaleX = 1 ;
            barPos = barPos - 9 + this.hpBitmap.width;
            this.effBitmap.x = barPos;
            this.effBitmap.visible = !(barPos > 51);
        } else {
            this.hpBitmap.x = RoleHPBar.WIDTH - w;
            this.hitBitmap.x = RoleHPBar.WIDTH - w;
            this.effBitmap.scaleX = -1;
            this.hitBitmap.y = 0;
            barPos = RoleHPBar.WIDTH - w;
            this.effBitmap.x = barPos + 10;
            this.effBitmap.visible = !(this.effBitmap.x < 10);
        }
    }

    public reset(){
        this.oldProgress = -1;
    }
}