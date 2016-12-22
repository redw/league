/**
 * Created by Administrator on 2016/12/16.
 */
var URLConfig;
(function (URLConfig) {
    // 音乐
    function getSoundURL(name) {
        return "resource/assets/sound/" + name + ".mp3";
    }
    URLConfig.getSoundURL = getSoundURL;
})(URLConfig || (URLConfig = {}));
