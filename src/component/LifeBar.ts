/**
 * 血条显示
 * Created by Administrator on 11/16 0016.
 */

class LifeBar extends egret.DisplayObjectContainer
{
    private _bg:AutoBitmap;
    private _bar:AutoBitmap;
    private _width:number;

    public constructor(isHero?:boolean)
    {
        super();
        this._bg = new AutoBitmap();
        this._bar = new AutoBitmap();
        this._bg.source ="pvp_blood_white_png";
        this._bar.source =  isHero ? "pvp_blood_png" : "pvp_blood_enemy_png";
        this.addChild(this._bg);
        this.addChild(this._bar);
        // this._bar.x = this._bar.y = 1;
        this._width = 61
    }

    public setProgress(hp:number,life:number)
    {
        this._bar.width = MathUtil.clamp(Math.floor(hp * this._width / life),0,this._width);
    }

    public setRatio(value:number) {
        value = MathUtil.clamp(value, 0, 1);
        this._bar.width = this._width * value;
    }

    public reSet()
    {
        this._bar.width = this._width;
    }

}

