/**
 * 声音
 * @author j
 * 2016/11/21
 */
var BaseSound = (function (_super) {
    __extends(BaseSound, _super);
    function BaseSound(path, type) {
        var _this = this;
        _super.call(this);
        this.playTime = 0;
        this.isStop = false;
        this.path = path;
        this.type = type;
        if (this.type == egret.Sound.MUSIC) {
            this.playTime = 0;
        }
        else if (this.type == egret.Sound.EFFECT) {
            this.playTime = 1;
        }
        if (RES.hasRes(path)) {
            RES.getResAsync(path, function (res) {
                _this.sound = res;
                _this.playExec();
            }, this);
        }
        else {
            RES.getResByUrl(path, function (res) {
                _this.sound = res;
                _this.playExec();
            }, this, RES.ResourceItem.TYPE_SOUND);
        }
    }
    var d = __define,c=BaseSound,p=c.prototype;
    p.play = function (playTime) {
        if (playTime != null) {
            this.playTime = playTime;
        }
        this.isStop = false;
        if (this.soundChannel) {
            if (this.type == egret.Sound.MUSIC) {
                this.volumeDown(this.soundChannel);
                this.soundChannel = null;
            }
            else if (this.type == egret.Sound.EFFECT) {
                this.soundChannel.stop();
                this.soundChannel = null;
            }
        }
        this.playExec();
    };
    p.stop = function () {
        this.isStop = true;
        if (this.soundChannel) {
            if (this.type == egret.Sound.MUSIC) {
                this.volumeDown(this.soundChannel);
                this.soundChannel = null;
            }
            else if (this.type == egret.Sound.EFFECT) {
                this.soundChannel.stop();
                this.soundChannel = null;
            }
        }
    };
    p.playExec = function () {
        if (this.isStop) {
            return;
        }
        if (this.sound) {
            if (this.type == egret.Sound.MUSIC) {
                this.soundChannel = this.sound.play(0, this.playTime);
                this.volumeUp(this.soundChannel);
            }
            else if (this.type == egret.Sound.EFFECT) {
                this.soundChannel = this.sound.play(0, this.playTime);
            }
        }
    };
    p.volumeUp = function (channel) {
        channel.volume = 0;
        egret.Tween.get(channel).to({ volume: 1 }, 1000);
    };
    p.volumeDown = function (channel) {
        channel.volume = 1;
        egret.Tween.get(channel).to({ volume: 0 }, 1000).call(function () {
            channel.stop();
        }, this);
    };
    return BaseSound;
}(egret.EventDispatcher));
egret.registerClass(BaseSound,'BaseSound');
