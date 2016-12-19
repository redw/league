/**
 * 数学工具
 * @author j
 *
 */
module MathUtil
{
    var _hasInit:boolean = false;
    var _unitValue:number[] = [];

    export var unitKey:string[] = ["K", "M", "B", "t", "q", "Q", "s", "S", "o", "n", "d", "U", "D", "T", "Qt", "Qd", "Sd", "St", "O", "N", "v", "c"];
    export var lowercaseLetter:string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    export var capitalLetter:string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    init();

    function init():void
    {
        if (_hasInit == false)
        {
            _hasInit = true;
            var tempKey:string[] = unitKey.concat();

            for (var unit of tempKey)
            {
                for (var letter of lowercaseLetter)
                {
                    unitKey.push(unit + letter);
                }
            }
            for (var unit of tempKey)
            {
                for (var letter of capitalLetter)
                {
                    unitKey.push(unit + letter);
                }
            }

            for (var i = 0; i < unitKey.length; i++)
            {
                _unitValue.push((i + 1) * 3);
            }
        }
    }

    /**
     * 两点之间的距离
     * @param pos1
     * @param pos2
     * @returns {number}
     */
    export function pointDistance(pos1:egret.Point, pos2:egret.Point):number
    {
        return Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y));
    }

    /**
     * 数值上下限制
     * @param value
     * @param min
     * @param max
     * @returns {number}
     */
    export function clamp(value:number, min:number, max:number):number
    {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * 区间随机数
     * @param min
     * @param max
     * @returns {number}
     */
    export function rangeRandom(min:number, max:number):number
    {
        return MathUtil.clamp(Math.floor(Math.random() * (max - min + 1) + min), min, max);
    }

    export function easyNumber(value:any):string
    {
        var num:BigNum = new BigNum(value);

        if (num.e < 3)
        {
            var n:number = num.n * Math.pow(10, num.e);

            if (num.e == 0)
            {
                return Math.round(n).toString();
            }
            else if (num.e == 1)
            {
                return Math.round(n).toString();
            }
            else
            {
                return Math.round(n).toString();
            }
        }

        for (var i = 0; i < unitKey.length; i++)
        {
            var diff:number = num.e - _unitValue[i];

            if (diff < 3)
            {
                var n:number = num.n * Math.pow(10, diff);

                if (diff == 0)
                {
                    return parseFloat(n.toFixed(2)) + unitKey[i];
                }
                else if (diff == 1)
                {
                    return parseFloat(n.toFixed(1)) + unitKey[i];
                }
                else
                {
                    return parseFloat(n.toFixed(0)) + unitKey[i];
                }
            }
        }
        return num + unitKey[unitKey.length - 1];
    }
}