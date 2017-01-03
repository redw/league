/**
 * 声音
 * @author j
 * 2016/11/21
 */
class SoundManager extends egret.HashObject
{
    private static _inst:SoundManager;

    public static get inst():SoundManager
    {
        if (SoundManager._inst == null)
        {
            SoundManager._inst = new SoundManager();
        }
        return SoundManager._inst;
    }

    //----------------------------------------//

    private _musicSwitch:boolean = true;
    private _effectSwitch:boolean = true;

    private _musicSound:BaseSound;

    public set musicSwitch(value:boolean)
    {
        this._musicSwitch = value;

        if (this._musicSwitch)
        {
            if (this._musicSound)
            {
                this._musicSound.play();
            }
        }
        else
        {
            if (this._musicSound)
            {
                this._musicSound.stop();
            }
        }
    }

    public get musicSwitch():boolean
    {
        return this._musicSwitch;
    }

    public set effectSwitch(value:boolean)
    {
        this._effectSwitch = value;
    }

    public get effectSwitch():boolean
    {
        return this._effectSwitch;
    }

    public setup():void
    {
        Global.getStage().addEventListener(egret.Event.ACTIVATE, this.onActive, this);
        Global.getStage().addEventListener(egret.Event.DEACTIVATE, this.onDeactive, this);
    }

    public playMusic(path:string, playTime?:number):void
    {
        if (this._musicSwitch)
        {
            if (this._musicSound)
            {
                this._musicSound.stop();
                this._musicSound = null;
            }

            this._musicSound = new BaseSound(path, egret.Sound.MUSIC);
            this._musicSound.play(playTime);
        }
    }

    public stopMusic():void
    {
        if (this._musicSound)
        {
            this._musicSound.stop();
            this._musicSound = null;
        }
    }

    public playEffect(path:string, playTime?:number):BaseSound
    {
        var sound:BaseSound = null;

        if (this._effectSwitch)
        {
            sound = new BaseSound(path, egret.Sound.EFFECT);
            sound.play(playTime);
        }
        return sound;
    }

    private onActive(event:egret.Event):void
    {
        if (this._musicSwitch)
        {
            if (this._musicSound)
            {
                this._musicSound.play();
            }
        }
    }

    private onDeactive(event:egret.Event):void
    {
        if (this._musicSwitch)
        {
            if (this._musicSound)
            {
                this._musicSound.stop();
            }
        }
    }
}