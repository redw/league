/**
 * 事件管理
 * @author j
 *
 */
class EventManager extends egret.EventDispatcher
{
    private static _instance:EventManager;

    public static get inst():EventManager
    {
        if (EventManager._instance == null)
        {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }

    //----------------------------------------//

    public dispatch(type:string, data:any = null):void
    {
        this.dispatchEventWith(type, false, data);
    }
}