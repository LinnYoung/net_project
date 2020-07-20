import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/// <summary>
/// 格子的类型
/// </summary>
export enum E_Node_Type {
	/**
	 * 可以走的地方
	 */
	Walk,

	/**
	 * 不能走的阻挡
	 */
	Stop,

	/**
	 * 开始
	 */
	Start,

	/**
	 * 结束
	 */
	End
}

/**
 *起点与终点方位判定
 *
 * @export
 * @enum {number}
 */
export enum NodeDir {
	/**
	 * 无
	 */
	None,
	/**
	 *左上
	 */
	LeftToTop,
	/**
	 *右上
	 */
	RightToTop,
	/**
	 * 左下
	 */
	LeftToDown,
	/**
	 *右下
	 */
	RightToDown
}

@ccclass('AStarNode')
export class AStarNode {


	/**
	 * 格子对象的X坐标
	 */
	public x: number;

	/**
	 * 格子对象的Y坐标
	 */
	public y: number;

	/**
	 * 寻路消耗
	 */
	public f;

	/**
	 * 离起点的距离
	 */
	public g;

	/**
	 * 离终点的距离
	 */
	public h;

	/**
	 * 父节点
	 */
	public father: AStarNode;

	/**
	 * 格子的类型
	 */
	public type: E_Node_Type;

	/**
	 * 格子类构造函数，传入坐标和格子类型
	 * @param x 
	 * @param y 
	 * @param type 
	 */
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type;
	}

}
