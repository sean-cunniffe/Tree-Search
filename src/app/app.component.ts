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
  selectedSearch: string = 'depth';
  greenNode: string = 'Leaf';
  blueNode: string = 'Root';
  whiteNode: string = 'Connecting node';
  message: string = 'Select a Start Node';
  nodeSearch: boolean = false;
  hideMessage: boolean = true;
  private startColor: string = 'blue';
  private finishColor: string = 'pink';
  selectedStartNode: TreeNode;
  selectedFinishNode: TreeNode;

  constructor(public treeNodeService: TreeNodeService) {
  }

  ngOnInit(): void {
    this.generateTree(undefined);
  }


  highlightNode(target: HTMLDivElement, node: TreeNode) {
    target.style.background = 'orange';
    let tempNode: TreeNode = node;
    while (!tempNode.root) {
      let parent: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.parentNode.id);
      parent.style.background = 'orange';
      let line: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.lineId);
      line.style.background = 'red';
      tempNode = tempNode.parentNode;
    }
    let line: HTMLDivElement = <HTMLDivElement> document.getElementById(tempNode.lineId);
    line.style.background = 'red';
  }

  highlightChildren(target: HTMLDivElement, node: TreeNode) {
    for (let node2 of node.childrenNodes) {
      let child = document.getElementById(node2.id);
      child.style.background = 'blue';
    }
  }

  lowLightChildren(target: EventTarget, node: TreeNode) {
    for (let node2 of node.childrenNodes) {
      let child = document.getElementById(node2.id);
      if (node2.isLeaf) {
        child.style.background = 'green';
      } else {
        child.style.background = 'white';
      }
    }
  }

  lowLightNode(target: HTMLDivElement, node: TreeNode) {
    if (node.isLeaf) {
      target.style.background = 'green';
    } else {
      target.style.background = 'white';
    }
    if (node.root) {
      target.style.background = 'blue';
    }

    let tempNode: TreeNode = node;
    while (!tempNode.root) {
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
  }

  generateTree(button: HTMLButtonElement) {
    if(button !== undefined)button.disabled = true;
    this.selectedFinishNode = undefined;
    this.selectedStartNode = undefined;
    let currentTreeDepth: number = 0;
    //clear mapping and node list
    this.treeNodeService.createMapping();

    this.rootNode = new TreeNode(undefined, this.treeNodeService);
    this.treeNodeService.nodes = [this.rootNode];

    const id = setInterval(() => {
      for (let node of this.treeNodeService.nodes) {
        if (node.treeDepth === currentTreeDepth) {
          node.generateChildren(true);
        }
      }
      currentTreeDepth++;
      if (currentTreeDepth >= this.treeNodeService.treeDepth) {

        for (let node of this.treeNodeService.nodes) {
          //search tree for nodes that has this node as a child
          node.getParents();
          //draw lines to children and parents
          node.drawNewLines();

          if (node.getRelations().length <= 1 ) {
            node.isLeaf = true;
          }
        }
        this.treeNodeService.treeDepth = this.treeNodeService.nodes[this.treeNodeService.nodes.length - 1].treeDepth;

        clearInterval(id);
        if(button !== undefined)button.disabled = false;
      }

    }, 75);
  }

  highlightParents(target: HTMLDivElement, node: TreeNode) {
    target.style.background = 'orange';
    for (let node2 of node.parents) {
      document.getElementById(node2.id).style.background = 'red';
    }
  }

  lowLightParents(target: HTMLDivElement, node: TreeNode) {
    target.style.background = 'green';
    for (let node2 of node.parents) {
      if (node2.root === true) {
        document.getElementById(node2.id).style.background = 'blue';
      } else {
        document.getElementById(node2.id).style.background = 'white';
      }
    }
  }

  depthFirstSearch(startingNode: TreeNode, finishingNode: TreeNode) {
    //do the search while adding visualisation steps to the visualisation array
    //[0] 'backtrack' ,'next node'
    //[1] current node id
    //[2] next node id
    //[3] line id

    let visualisationArray: Array<any[]> = [];

    //initialise arrays for first node
    let maxTree: TreeNode[] = [];
    let tempTree: TreeNode[] = [];
    let node: TreeNode = startingNode;
    const bt: number = 0;
    const nn: number = 1;
    tempTree.push(node);

    loop:while (tempTree.length > 0) {
      node.explored = true;
      node = tempTree[tempTree.length - 1];
      if (tempTree.length > maxTree.length && finishingNode === undefined) {
        maxTree = [...tempTree];
      }
      console.log(tempTree);

      //check if node has children, if not then its a dead end so backtrack
      if (node.getRelations().length <= 0) {
        //check if the current tree is longer then longest tree
        tempTree.pop(); // remove last node so previous node is last in array
        let nextNode: TreeNode = tempTree[tempTree.length - 1];
        let nodeLine = node.relationsLines.get(nextNode.id);
        visualisationArray.push([bt, node.id, nextNode.id, nodeLine]);
      } else {
        for (let cNode of node.getRelations()) {
          //check if children are explorer
          if (!cNode.explored) {
            //explore this child node
            tempTree.push(cNode);
            let nodeLine = node.relationsLines.get(cNode.id);
            if (cNode === finishingNode && finishingNode !== undefined) {
              break loop;
            }
            visualisationArray.push([nn, node.id, cNode.id, nodeLine.id]);
            break;
          } else {
            //if were on the last child node then we couldnt find a child node to explore so backtrack
            if (node.getRelations()[node.getRelations().length - 1] == cNode) {
              tempTree.pop(); // remove last node so previous node is last in array
              if (tempTree.length > 0) {
                let nextNode: TreeNode = tempTree[tempTree.length - 1];
                let nodeLine = node.relationsLines.get(cNode.id);
                visualisationArray.push([bt, node.id, nextNode.id, nodeLine.id]);
              }
            }
          }
        }
      }
    }
    let vIndex: number = 0;
    //transverse through visual array to visualise search
    let id = setInterval(() => {
      const vis: any[] = visualisationArray[vIndex];
      let currNode = document.getElementById(vis[1]);
      let nextNode = document.getElementById(vis[2]);
      let line = document.getElementById(vis[3]);
      //check is it back track or search next node
      if (vis[0] === bt) {
        // if backtrack set previous node and line to gray
        currNode.style.background = 'gray';
        currNode.style.border = '2px solid gray';
        nextNode.style.border = '2px solid red';
        vIndex++;
      } else if (vis[0] === nn) {
        currNode.style.background = 'orange';
        currNode.style.border = '2px solid gray';
        nextNode.style.border = '2px solid red';
        vIndex++;
      }
      if (vIndex >= visualisationArray.length) {
        for(let node of this.treeNodeService.nodes){
          if(node !== this.selectedStartNode && node !== this.selectedFinishNode){
            let el = document.getElementById(node.id).style;
            el.background = 'white';
            el.border = '2px solid black';

          }
        }
        if (finishingNode !== undefined) {
          for (let i = 0; i < tempTree.length; i++) {
            let node = tempTree[i];
            document.getElementById(node.id).style.background = 'green';
            if(i !== tempTree.length-1) {
              document.getElementById(node.relationsLines.get(tempTree[i + 1].id).id).style.background = 'red';
            }
          }
        }
        clearInterval(id);
        this.controlsDisable(false);
        this.treeNodeService.treeExplored = maxTree;
      }
    }, 50);

  }

  breadthFirstSearch(startingNode: TreeNode, finishingNode: TreeNode) {
    //do the search while adding visualisation steps to the visualisation array
    //[0] 'addToQueue' ,'next node'
    //[1] current node id
    //[2] next node id
    //[3] line id

    let visualisationArray: Array<any[]> = [];

    //initialise arrays for first node
    let maxTree: TreeNode[] = [];
    let tempTree: TreeNode[] = [];
    let node: TreeNode = startingNode;
    const aq: number = 0;
    const cn: number = 1;
    const gn: number = 2;

    node.explored = true;
    tempTree.push(node);
    while (tempTree.length > 0) {

      if (node == finishingNode) {
        break;
      }

      node.explored = true;
      node = tempTree.shift();
      visualisationArray.push([cn, node.id]);
      //if node has no children then grey out
      for (let cNode of node.getRelations()) {
        if (!cNode.explored && tempTree.indexOf(cNode) < 0) {
          //add to queue
          tempTree.push(cNode);
          visualisationArray.push([aq, cNode.id, node.relationsLines.get(cNode.id)]);
        }
      }

      visualisationArray.push([gn, node.id]);
    }

    let vIndex: number = 0;
    //transverse through visual array to visualise search

    let startNodeId = '-1';
    let finishNodeId = '-1';
    if(startingNode !== undefined && finishingNode !== undefined){
      startNodeId = startingNode.id;
      finishNodeId = finishingNode.id;
    }

    let id = setInterval(() => {
      let v: any[] = visualisationArray[vIndex];
      if (v[0] === aq) {
        if(v[1] !== startNodeId && v[1] !== finishNodeId)
        document.getElementById(v[1]).style.background = 'yellow';
      } else if (v[0] === cn) {
        if(v[1] !== startNodeId && v[1] !== finishNodeId)
        document.getElementById(v[1]).style.background = 'red';
      } else if (v[0] === gn) {
        if(v[1] !== startNodeId && v[1] !== finishNodeId)
        document.getElementById(v[1]).style.background = 'grey';
      }
      vIndex++;
      if (vIndex >= visualisationArray.length) {
        clearInterval(id);
        this.controlsDisable(false);
      }
    }, 150);

  }

  resetMap() {

  }

  search(startNode: TreeNode, finishNode: TreeNode) {

    switch (this.selectedSearch) {
      case 'depth':
        this.depthFirstSearch(startNode, finishNode);
        break;
      case 'breadth':
        this.breadthFirstSearch(startNode, finishNode);
    }

  }

  searchNodeInit() {
    this.nodeSearch = true;
    for (let node of this.treeNodeService.nodes) {
      let nodeDis: HTMLDivElement = <HTMLDivElement> document.getElementById(node.id);
      nodeDis.style.background = 'white';

    }
    this.hideMessage = false;
    let message = document.getElementById('message');
    message.style.animation = 'message-animation 1s forwards';
  }

  modeChange(target: HTMLSelectElement) {
    if (target.value === 'search') {

      this.searchNodeInit();
      this.controlsDisable(true);
    }

  }

  private controlsDisable(disable:boolean) {
    let controls = document.getElementById('controls');
    for (let i = 0; i < controls.childElementCount; i++) {
      let element: any = controls.children[i];
      element.disabled = disable;
    }
    (<HTMLInputElement> document.getElementById('treeDepthControl')).disabled = disable;
    (<HTMLInputElement> document.getElementById('maxChildren')).disabled = disable;
  }

  colorChange(node: TreeNode, enter: boolean) {
    if (this.nodeSearch && this.selectedStartNode === undefined) {
      if (enter) {
        document.getElementById(node.id).style.background = this.startColor;
      } else {
        document.getElementById(node.id).style.background = 'white';
      }
    } else if (this.nodeSearch && this.selectedFinishNode === undefined && node !== this.selectedStartNode) {
      if (enter) {
        document.getElementById(node.id).style.background = this.finishColor;
      } else if (node !== this.selectedStartNode) {
        document.getElementById(node.id).style.background = 'white';
      }
    }

  }

  nodeSelected(node: TreeNode) {
    if (this.nodeSearch && this.selectedStartNode === undefined) {
      console.log(this.nodeSearch);
      this.selectedStartNode = node;
      this.message = 'Select a search node';
      document.getElementById('message').hidden = false;
      document.getElementById(node.id).style.background = this.startColor;
    } else if (this.nodeSearch && this.selectedFinishNode === undefined) {
      this.selectedFinishNode = node;
      document.getElementById(node.id).style.background = this.finishColor;
      document.getElementById('message').hidden = true;
      this.search(this.selectedStartNode, this.selectedFinishNode);
    }
  }
}
