import { Injectable } from '@angular/core';
import {TreeNode} from '../common/tree-node';

@Injectable({
  providedIn: 'root'
})
export class TreeNodeService {

  nodes: TreeNode[] = [];

  notAvailable: Array<number[]> = [];
  constructor() { }
}
