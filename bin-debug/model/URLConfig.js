/**
 * 加载路径
 * @author j
 *
 */
var URLConfig;
(function (URLConfig) {
    function getResURL(name) {
        return "resource/" + name;
    }
    URLConfig.getResURL = getResURL;
    // 音乐
    function getSoundURL(name) {
        return "./resource/assets/sound/" + name + ".mp3";
    }
    URLConfig.getSoundURL = getSoundURL;
    // 角色资源
    function getRoleEffectURL(name) {
        return "resource/gui/hero";
    }
    URLConfig.getRoleEffectURL = getRoleEffectURL;
    // 得到道具资源效果
    function getPropEffectURL(name) {
        return "resource/gui/effect/fight/" + name;
    }
    URLConfig.getPropEffectURL = getPropEffectURL;
    // 特效
    function getEffectURL(name) {
        return "resource/gui/effect/" + name;
    }
    URLConfig.getEffectURL = getEffectURL;
    // 位图字体
    function getBitmapFontURL(name) {
        return "resource/gui/bitmapFont/" + name + ".fnt";
    }
    URLConfig.getBitmapFontURL = getBitmapFontURL;
    // 新手引导
    function getGuideImageURL(id) {
        return "resource/gui/guide/" + id + ".png";
    }
    URLConfig.getGuideImageURL = getGuideImageURL;
    // 岛屿-预览
    function getIslandPreviewURL(id) {
        return "resource/gui/island/preview/" + id + ".png";
    }
    URLConfig.getIslandPreviewURL = getIslandPreviewURL;
    // 岛屿-部件
    function getIslandItemURL(id, itemID, itemLv, isBroken) {
        if (isBroken) {
            return "resource/gui/island/item/" + id + "/" + itemID + "_" + itemLv + "_1.png";
        }
        else {
            return "resource/gui/island/item/" + id + "/" + itemID + "_" + itemLv + "_0.png";
        }
    }
    URLConfig.getIslandItemURL = getIslandItemURL;
    // 岛屿-部件大陆
    function getIslandItemLandURL(id) {
        return "resource/gui/island/itemLand/" + id + ".png";
    }
    URLConfig.getIslandItemLandURL = getIslandItemLandURL;
    // 岛屿-部件预览
    function getIslandItemPreviewURL(id, itemID, itemLv, lock) {
        if (lock) {
            return "itempreview_" + id + "_disabled_" + itemID + "_" + itemLv + "_0_png";
        }
        else {
            return "itempreview_" + id + "_" + itemID + "_" + itemLv + "_0_png";
        }
    }
    URLConfig.getIslandItemPreviewURL = getIslandItemPreviewURL;
    function getDrawArrow(id) {
        return "resource/gui/draw/arrow/" + id + ".png";
    }
    URLConfig.getDrawArrow = getDrawArrow;
    function getDrawBg(id) {
        return "resource/gui/draw/bg/" + id + ".png";
    }
    URLConfig.getDrawBg = getDrawBg;
    function getDrawMask(id) {
        return "resource/gui/draw/mask/" + id + ".png";
    }
    URLConfig.getDrawMask = getDrawMask;
    function getDrawRich(id) {
        return "resource/gui/draw/rich/" + id + ".png";
    }
    URLConfig.getDrawRich = getDrawRich;
    function getDrawSurface(id) {
        return "resource/gui/draw/surface/" + id + ".png";
    }
    URLConfig.getDrawSurface = getDrawSurface;
    function getPuzzle(idx, pos) {
        return "puzzle_" + idx + "_" + pos + "_png";
    }
    URLConfig.getPuzzle = getPuzzle;
    function getWorkerMCUrl(id) {
        return "resource/gui/worker/worker_mc" + id;
    }
    URLConfig.getWorkerMCUrl = getWorkerMCUrl;
})(URLConfig || (URLConfig = {}));
//# sourceMappingURL=URLConfig.js.map