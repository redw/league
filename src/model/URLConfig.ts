/**
 * 加载路径
 * @author j
 *
 */
module URLConfig {
    export function getResURL(name: string): string {
        return "resource/" + name;
    }

    // 音乐
    export function getSoundURL(name: string): string {
        return "./resource/assets/sound/" + name + ".mp3";
    }

    // 角色资源
    export function getRoleEffectURL(name:string) {
        return "resource/gui/hero";
    }

    // 得到道具资源效果
    export function getPropEffectURL(name:string) {
        return "resource/gui/effect/fight/" + name;
    }

    // 特效
    export function getEffectURL(name: string): string {
        return "resource/gui/effect/" + name;
    }

    // 位图字体
    export function getBitmapFontURL(name: string): string {
        return "resource/gui/bitmapFont/" + name + ".fnt";
    }

    // 新手引导
    export function getGuideImageURL(id: number): string {
        return "resource/gui/guide/" + id + ".png";
    }

    // 岛屿-预览
    export function getIslandPreviewURL(id: number): string {
        return "resource/gui/island/preview/" + id + ".png";
    }

    // 岛屿-部件
    export function getIslandItemURL(id: number, itemID: number, itemLv: number, isBroken?: boolean): string {
        if (isBroken) {
            return "resource/gui/island/item/" + id + "/" + itemID + "_" + itemLv + "_1.png";
        }
        else {
            return "resource/gui/island/item/" + id + "/" + itemID + "_" + itemLv + "_0.png";
        }
    }

    // 岛屿-部件大陆
    export function getIslandItemLandURL(id: number): string {
        return "resource/gui/island/itemLand/" + id + ".png";
    }

    // 岛屿-部件预览
    export function getIslandItemPreviewURL(id: number, itemID: number, itemLv: number, lock?: boolean): string {
        if (lock) {
            return "itempreview_" + id + "_disabled_" + itemID + "_" + itemLv + "_0_png";
        }
        else {
            return "itempreview_" + id + "_" + itemID + "_" + itemLv + "_0_png";
        }
    }

    export function getDrawArrow(id: number): string {
        return "resource/gui/draw/arrow/" + id + ".png";
    }

    export function getDrawBg(id: number): string {
        return "resource/gui/draw/bg/" + id + ".png";
    }

    export function getDrawMask(id: number): string {
        return "resource/gui/draw/mask/" + id + ".png";
    }

    export function getDrawRich(id: number): string {
        return "resource/gui/draw/rich/" + id + ".png";
    }

    export function getDrawSurface(id: number): string {
        return "resource/gui/draw/surface/" + id + ".png";
    }

    export function getPuzzle(idx: number, pos: number): string {
        return "puzzle_" + idx + "_" + pos + "_png";
    }

    export function getWorkerMCUrl(id: number): string {
        return "resource/gui/worker/worker_mc" + id;
    }
}