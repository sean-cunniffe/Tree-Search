import {Component, OnInit} from '@angular/core';
import {TreeNode} from './common/tree-node';
import {TreeNodeService} from './services/tree-node.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Tree-Search';

  rootNode: TreeNode;
  treeLevel: number = 4;

  constructor(public treeNodeService: TreeNodeService) {
  }

  ngOnInit(): void {
    this.rootNode = new TreeNode(undefined,this.treeLevel,this.treeNodeService);
  }


  getNodes():TreeNode[]{
    return this.treeNodeService.nodes;
  }

  highlightNode(target: HTMLDivElement, index: number) {
    let line1: HTMLDivElement = <HTMLDivElement>document.getElementById(index+"A");
    let line2: HTMLDivElement = <HTMLDivElement>document.getElementById(index+"B");
    line1.style.background = 'red';
    line2.style.background = 'red';
    target.style.background = 'orange';
  }

  lowLightNode(target: HTMLDivElement, index: number) {
    let line1: HTMLDivElement = <HTMLDivElement>document.getElementById(index+"A");
    let line2: HTMLDivElement = <HTMLDivElement>document.getElementById(index+"B");
    line1.style.background = 'white';
    line2.style.background = 'white';
    target.style.background = 'white';
  }
}
