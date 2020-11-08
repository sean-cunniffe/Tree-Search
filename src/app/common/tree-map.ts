import {TreeNode} from './tree-node';

export class TreeMap extends Map<number, Map<number,TreeNode>> {

  public get(index: number):Map<number,TreeNode> {
    if (super.get(index) === undefined) {
      let arr: Map<number,TreeNode> = new Map();
      super.set(index, arr);
      return arr;
    }else {
      return super.get(index);
    }
  }
}
