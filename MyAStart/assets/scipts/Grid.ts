import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum GridType{
    
    /**
     * 障碍物
     */
    Barrier,

    /**
     * 正常
     */
    Normal,

    /**
     * 起点
     */
    Start,

    /**
     * 终点
     */
    End
}


/**
 * 格子类
 */
export  class Grid  {

    public  x:number;
    public  y:number;
    public  f:number;
    public  g:number;
    public  h:number;

    public parent:Grid;
    public type:GridType;

    /**
     *构造器
     */
    constructor() {
        
        this.x=0;
        this.y=0;
        this.f=0;
        this.g=0;
        this.h=0;
        this.parent=null;
        this.type=GridType.Normal;
    }

   
}
