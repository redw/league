/**
 * 数组工具
 * @author hh
 * 2016/5/26
 */
module ArrayUtil
{

    export function remove(array:any[], item:any, global?:boolean):boolean
    {
        var index:number;

        if (global == null)
        {
            global = false;
        }

        if (global)
        {
            while (true)
            {
                index = array.indexOf(item);

                if (index >= 0)
                {
                    array.splice(array.indexOf(item), 1);
                }
                else
                {
                    break;
                }
            }
        }
        else
        {
            index = array.indexOf(item);

            if (index >= 0)
            {
                array.splice(array.indexOf(item), 1);
            }
        }

        return index >= 0;
    }

    /**
     * 随机数组中的唯一值
     * @param array
     * @returns {any}
     */
    export function randomUniqueValue(array:any[]):any{
        let keys = Object.keys(array);
        let index = Math.floor(Math.random() * keys.length);
        let key = keys[index];
        let result = array[key];
        array.splice(index, 1);
        return result;
    }

    /**
     * 从随机值中,获取数组
     * @param from
     * @param to
     * @param count
     * @returns {Array}
     */
    export function getRandomArr(from:number, to:number, count:number){
        let result = [];
        let c = Math.min(count, to - from + 1);
        c = Math.max(0, c);
        do {
            let value = from + Math.floor(Math.random() * (to - from + 1));
            if (result.indexOf(value) < 0) {
                result.push(value);
            }
        } while (result.length < c);
        return result;
    }

    export function createArr(len:number, value:number) {
        let arr = Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = value;
        }
        return arr;
    }
}