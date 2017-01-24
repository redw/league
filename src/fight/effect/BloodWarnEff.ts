/**
 * 血量预警效果
 * Created by hh on 2016/12/26.
 */
class BloodWarnEff extends egret.DisplayObjectContainer{
    private bitmap:AutoBitmap;

    public constructor(w:number, h:number){
        super();

        this.bitmap = new AutoBitmap();
        this.bitmap.width = w;
        this.bitmap.height = h;
        this.addChild(this.bitmap);

        // EventManager.inst.addEventListener(ContextEvent.FIGHT_ROLE_HP_CHANGE, this.onHPChange, this);
    }

    private onHPChange(){
        this.bitmap.source = "pvp_blood_bar_png";
        this.bitmap.alpha = 0.5;
        let tween = egret.Tween.get(this.bitmap);
        tween.to({alpha:1}, 100);
        tween.to({alpha:0.5}, 100).call(
            ()=>{
                egret.Tween.removeTweens(this.bitmap);
                this.bitmap.parent.removeChild(this.bitmap);
            },
            this
        )
    }

    private dispose(){
        egret.Tween.removeTweens(this.bitmap);
        this.bitmap = null;
        // EventManager.inst.removeEventListener(ContextEvent.FIGHT_ROLE_HP_CHANGE, this.onHPChange, this);
    }
}