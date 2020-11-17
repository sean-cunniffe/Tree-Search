import { Injectable } from '@angular/core';
import {TreeNode} from '../common/tree-node';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TreeNodeService {

  nodes: TreeNode[] = [];
  treeDepth: number = 10;
  maxChildren:number = 2;
  available: Map<number,Map<number,TreeNode>> = new Map();
  showIndex: boolean = false;
  treeExplored: TreeNode[] = [];
  constructor() {
    this.createMapping();
  }

  public unclaimArea(node:TreeNode){
    //go through all Ymaps and remove any reference of
    for(let i=node.xPos-(TreeNode.nodeDiameter/2);i<=node.xPos+(TreeNode.nodeDiameter/2);i++){
      let val:number = i;
      if(val<0){
        val=0;
      }else if(val>99){
        val=99;
      }
      let yPosMap = this.available.get(val);
      for(let j=node.yPos-(TreeNode.nodeDiameter/2);j<=node.yPos+(TreeNode.nodeDiameter/2) && j<99;j++){
        if(j<0){
          j=0;
        }
          yPosMap.delete(j);

      }
    }
  }

  public createMapping() {
    this.available = new Map();
    for(let i=0;i<100;i++){
      this.available.set(i,new Map<number,TreeNode>());
    }
  }
}

