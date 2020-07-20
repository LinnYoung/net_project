import { _decorator, Component, Node } from 'cc';
import { E_Node_Type } from './AStarNode';
const { ccclass, property } = _decorator;



/**
 * 地图数据类，但是地图大小不在json指定
 */
@ccclass('MapCfgData')
export class MapCfgData  {
    
    public id:number;

    public  mapX:number;

    public mapY:number;

    public type:E_Node_Type;

    constructor(id:number,mapx:number,mapy:number,type:E_Node_Type){
         this.id=id;
         this.mapX=mapx;
         this.mapY=mapy;
         this.type=type;
    }

}
