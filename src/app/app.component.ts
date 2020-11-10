import {Component, OnInit} from '@angular/core';
import {TreeNode} from './common/tree-node';
import {TreeNodeService} from './services/tree-node.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Tree-Search';

  rootNode: TreeNode;

  constructor(public treeNodeService: TreeNodeService) {
  }

  ngOnInit(): void {
    this.rootNode = new TreeNode(undefined, this.treeNodeService);
    this.rootNode.generateChildren(false);
  }


  getNodes(): TreeNode[] {
    return this.treeNodeService.nodes;
  }

  highlightNode(target: HTMLDivElement, node: TreeNode) {
    target.style.background = 'orange';
    let tempNode: TreeNode = node;
    while(!tempNode.root){
      let parent: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.parentNode.id);
      parent.style.background = 'orange';
        let line: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.lineId);
        line.style.background = 'red';
        tempNode = tempNode.parentNode;
    }
    let line: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.lineId);
    line.style.background = 'red';
  }

  lowLightNode(target: HTMLDivElement, node: TreeNode) {
    if(node.isLeaf){
      target.style.background = 'green';
    }else{
      target.style.background = 'white';
    }
    if(node.root){
      target.style.background = 'blue';
    }

    let tempNode: TreeNode = node;
    while(!tempNode.root){
      let parent: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.parentNode.id);
      parent.style.background = 'white';
      let line: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.lineId);
      line.style.background = 'white';
      tempNode = tempNode.parentNode;
    }
    let parent: HTMLDivElement = <HTMLDivElement> document.getElementById('root');
    parent.style.background = 'blue';
  }

  updateMaxChildren(value: number) {
      this.treeNodeService.maxChildren = value;
    //go through nodes and generate children
  }


  updateTreeDepth(value: number) {
    let i = 0;
    //delete nodes with tree depth value less than new value
    while (i < this.treeNodeService.nodes.length && value < this.treeNodeService.treeDepth) {
      let node: TreeNode = this.treeNodeService.nodes[i];
      if (node.treeDepth > value) {
        this.treeNodeService.nodes.splice(this.treeNodeService.nodes.indexOf(node), 1);
        node.parentNode.childrenNodes.splice(node.parentNode.childrenNodes.indexOf(node), 1);
        this.treeNodeService.unclaimArea(node);
        if (node.parentNode.childrenNodes.length <= 0) {
          node.parentNode.isLeaf = true;
        }
      } else {
        i++;
      }
    }
    //add nodes if new value is greater than tree depth
    if (value > this.treeNodeService.treeDepth) {
      this.treeNodeService.treeDepth = +value;
      for (let node of this.treeNodeService.nodes) {
        if (node.treeDepth <= value && node.childrenNodes.length<=0) {
          node.generateChildren(false);
        }
      }
    } else {
      this.treeNodeService.treeDepth = value;
    }
  }

  generateTree() {
    let currentTreeDepth:number=0;
    //clear mapping and node list
    this.treeNodeService.createMapping();
    this.treeNodeService.nodes = [];
    this.rootNode = new TreeNode(undefined, this.treeNodeService);
    const id = setInterval(()=>{
      for(let node of this.treeNodeService.nodes){
        if(node.treeDepth === currentTreeDepth){
          node.generateChildren(true);
        }
      }
        currentTreeDepth++;
        if(currentTreeDepth>this.treeNodeService.treeDepth){
          this.treeNodeService.treeDepth = this.treeNodeService.nodes[this.treeNodeService.nodes.length-1].treeDepth;
          clearInterval(id);
        }

    },200);
  }
}
