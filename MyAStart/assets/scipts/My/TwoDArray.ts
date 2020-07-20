import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TwoDArray')
export class TwoDArray {
    private obj: Array<Array<number>> = new Array<Array<number>>();

    private rows: number;
    private columns: number;

    constructor(rows: number, columns: number, val: number) {
        this.rows = rows;
        this.columns = columns;
    }

    /**
     * 取数组中的值
     * @param rows 
     * @param columns 
     */
    public GetValue(rows: number, columns: number): number {
        if (rows < 0 || columns < 0 || rows >= this.rows || columns >= this.columns) {
            return null;
        }

        return this.obj[rows][columns];
    }

    /**
     * 为数组赋值
     * @param rows 
     * @param columns 
     * @param val 
     */
    public SetValue(rows: number, columns: number, val: number): void {
        if (rows < 0 || columns < 0 || rows >= this.rows || columns >= this.columns) {
            return;
        }

        this.obj[rows][columns] = val;
    }

    /**
     * 初始化行数
     * @param rows 
     */
    private InitRows(rows: number): void {
        if (rows < 1) {
            return;
        }

        for (let i = 0; i < rows; i++) {
            this.obj.push(new Array<number>());
        }
    }

    /**
     * 初始化列数
     * @param columns 
     * @param value 
     */
    private InitColumns(columns: number, value: number): void {
        if (columns < 1) {
            return;
        }

        for (let i = 0; i < this.obj.length; i++) {
            for (let j = 0; j < columns; j++) {
                this.obj[i].push(value);
            }
        }
    }

    /**
     * 获得数组
     */
    public GetArray(): Array<Array<number>> {
        return this.obj;
    }


}
