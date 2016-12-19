/**
 * 声音
 * @author j
 * 2016/11/21
 */
class BaseSound extends egret.EventDispatcher
{
    public sound:egret.Sound;
    public soundChannel:egret.SoundChannel;

    private path:string;
    private type:string;
    private playTime:number = 0;

    private isStop:boolean = false;

    public constructor(path:string, type:string)
    {
        super();

        this.path = path;
        this.type = type;

        if (this.type == egret.Sound.MUSIC)
        {
            this.playTime = 0;
        }
        else if (this.type == egret.Sound.EFFECT)
        {
            this.playTime = 1;
        }

        if (RES.hasRes(path))
        {
            RES.getResAsync(path, (res:any) =>
            {
                this.sound = res;
                this.playExec();

            }, this);
        }
        else
        {
            RES.getResByUrl(path, (res:any) =>
            {
                this.sound = res;
                this.playExec();

            }, this, RES.ResourceItem.TYPE_SOUND);
        }
    }

    public play(playTime?:number):void
    {
        if (playTime != null)
        {
            this.playTime = playTime;
        }
        this.isStop = false;

        if (this.soundChannel)
        {
            if (this.type == egret.Sound.MUSIC)
            {
                this.volumeDown(this.soundChannel);
                this.soundChannel = null;
            }
            else if (this.type == egret.Sound.EFFECT)
            {
                this.soundChannel.stop();
                this.soundChannel = null;
            }
        }

        this.playExec();
    }

    public stop():void
    {
        this.isStop = true;

        if (this.soundChannel)
        {
            if (this.type == egret.Sound.MUSIC)
            {
                this.volumeDown(this.soundChannel);
                this.soundChannel = null;
            }
            else if (this.type == egret.Sound.EFFECT)
            {
                this.soundChannel.stop();
                this.soundChannel = null;
            }
        }
    }

    private playExec():void
    {
        if (this.isStop)
        {
            return;
        }

        if (this.sound)
        {
            if (this.type == egret.Sound.MUSIC)
            {
                this.soundChannel = this.sound.play(0, this.playTime);
                this.volumeUp(this.soundChannel);
            }
            else if (this.type == egret.Sound.EFFECT)
            {
                this.soundChannel = this.sound.play(0, this.playTime);
            }
        }
    }

    private volumeUp(channel:egret.SoundChannel):void
    {
        channel.volume = 0;
        egret.Tween.get(channel).to({volume: 1}, 1000);
    }

    private volumeDown(channel:egret.SoundChannel):void
    {
        channel.volume = 1;

        egret.Tween.get(channel).to({volume: 0}, 1000).call(() =>
        {
            channel.stop();

        }, this);
    }
}