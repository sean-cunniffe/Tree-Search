import {TreeNodeService} from '../services/tree-node.service';
import {NodeLine} from './node-line';


export class TreeNode {

  explored: boolean = false;
  id: string;
  root: boolean;

  relationsLines: Map<string,NodeLine> = new Map();

  lineId: string; //HTML id of line for highlighting

  static nodeDiameter: number = 2; // as percent
  xPos: number;
  yPos: number;
  myTreeLevel: number;
  isLeaf: boolean = false;
  exist: boolean = true;
  treeDepth: number;
  lineMaxLength:number=5; // as percent
  public childrenNodes: TreeNode[] = [];
  public parents: TreeNode[] = [];
  constructor(public parentNode, public treeNodeService: TreeNodeService) {

    this.setId(15);

    if (this.setPosition(parentNode)) {
      treeNodeService.nodes.push(this);

      if (parentNode !== undefined) {
        this.treeDepth = this.parentNode.treeDepth + 1;
        parentNode.incrementTreeDepth();
        // this.lineLength = this.getLineLength(this.xPos, this.yPos, this.parentNode.xPos, this.parentNode.yPos);
        // this.lineAngle = this.getLineAngle(this.xPos, this.yPos, this.parentNode.xPos, this.parentNode.yPos);
        // this.linePosition = TreeNode.getLinePosition(this.xPos, this.yPos, this.parentNode.xPos, this.parentNode.yPos);
      } else {
        this.treeDepth = 0;
        this.root = true;
        this.id = 'root';
      }

    } else {
      //if couldnt find a position for node, remove from childrenNode in parent
      this.exist = false;
    }
  }

  treeDepthIncremented: boolean = false;

  public incrementTreeDepth() {
    if (!this.treeDepthIncremented) {
      this.treeDepthIncremented = true;
    }
  }

  private setPosition(parentNode: TreeNode): boolean {
    let tempXPos: number = 0;
    let tempYPos: number = 0;
    //if no parent then select any location
    if (parentNode === undefined) {
      tempXPos = TreeNode.getRandomNumber([[TreeNode.nodeDiameter / 2, 100 - (TreeNode.nodeDiameter / 2)]]);
      tempYPos = TreeNode.getRandomNumber([[TreeNode.nodeDiameter / 2, 100 - (TreeNode.nodeDiameter / 2)]]);
      this.claimPosition(tempXPos, tempYPos);
      return true;
    } else {
      let directions: number[][] = TreeNode.getAllDirections(parentNode.xPos, parentNode.yPos);
      //keep going till no more available directions
      while (directions.length > 0) {
        //pick a random direction to go in and delete it from the list
        let index: number = Math.floor(Math.random() * (directions.length - 1));
        let direction: number[] = directions[index];
        directions.splice(index, 1);
        //check if direction is available
        if (this.checkDirection(parentNode, direction[0], direction[1])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * claim area on mapping, if an area is already claimed, claim it and add node to children list
   * @param xPos
   * @param yPos
   */
  claimPosition(xPos: number, yPos: number) {
    this.xPos = xPos;
    this.yPos = yPos;
    for (let i = this.xPos - TreeNode.nodeDiameter / 2; i <= this.xPos + TreeNode.nodeDiameter / 2; i++) {
      let index = i;
      if (index > 99) {
        index = 99;
      }
      if (index < 0) {
        index = 0;
      }
      let yPosMap = this.treeNodeService.available.get(index);
      for (let j = this.yPos - TreeNode.nodeDiameter / 2; j <= this.yPos + TreeNode.nodeDiameter / 2; j++) {
        if (j > 99) {
          yPosMap.set(99, this);
        } else if (j < 0) {
          yPosMap.set(0, this);
        } else {
          yPosMap.set(j, this);
        }
      }
    }
    this.createRandomRelationships(this);
  }

  createRandomRelationships(node: TreeNode) {
    const tempXPos = node.xPos;
    const tempYPos = node.yPos;
    for (let i = tempXPos - TreeNode.nodeDiameter; i <= tempXPos + TreeNode.nodeDiameter; i++) {
      let index1 = i;
      if(index1>99) index1=99;
      if(index1<0) index1=0;
      let yPosMap: Map<number, TreeNode> = this.treeNodeService.available.get(index1);

      for (let j = tempYPos - TreeNode.nodeDiameter; j <= tempYPos + TreeNode.nodeDiameter; j++) {
        let index = j;
        if(index>99) index = 99;
        if(index<0) index=0;
        let tempNode = yPosMap.get(index);
        if (tempNode !== undefined && j <= 99 && j > 0) {
          if (node.childrenNodes.indexOf(tempNode) < 0 && node.parentNode != tempNode && node != tempNode) {
            node.childrenNodes.push(tempNode);
          }
        }
      }
    }
  }

  /**
   * get a random position that is outside parent position
   * range[min-max]
   * @param ranges
   * @private
   */
  public static getRandomNumber(ranges: Array<Array<number>>): number {
    let range: number[] = ranges[Math.floor(Math.random() * ranges.length)];
    //check if range has value > 100 -diameter and replace with 100 -diameter

    let nodeRadius: number = Math.ceil(TreeNode.nodeDiameter / 2);
    if (range[0] > 99 - nodeRadius) {
      range[0] = 99 - nodeRadius;
    }
    if (range[0] < nodeRadius) {
      range[0] = nodeRadius;
    }
    if (range[1] > 99 - nodeRadius) {
      range[1] = 99 - nodeRadius;
    }
    if (range[1] < nodeRadius) {
      range[1] = nodeRadius;
    }
    while (true) {
      let randNumber: number = Math.round(Math.random() * (range[1] - range[0])) + range[0];
      //check if random number is within display 0-100
      if (randNumber < 100 - (TreeNode.nodeDiameter / 2) && randNumber > (TreeNode.nodeDiameter / 2)) {
        return randNumber;
      }
    }
  }

  public getLineLength(xPos1: number, yPos1: number, xPos2: number, yPos2: number): number {
    let parent = document.getElementById('parentContainer').getBoundingClientRect();
    let adj: number = Math.pow(xPos1 - xPos2, 2);
    let opp: number = Math.pow((yPos1 - yPos2) * (parent.height / parent.width), 2);
    return Math.sqrt(adj + opp);
    // return 50;
  }

  public getLineAngle(xPos1: number, yPos1: number, xPos2: number, yPos2: number): number {
    let parent = document.getElementById('parentContainer').getBoundingClientRect();
    let run: number = (xPos1 - xPos2) / +parent.height;
    let rise: number = (yPos2 - yPos1) / +parent.width;
    return Math.atan(rise / run) * 180 / Math.PI;
  }

  public static calculateSlope(xPos1: number, yPos1: number, xPos2: number, yPos2: number): number {
    return (yPos1 - yPos2) / (xPos1 - xPos2);
  }

  private static getLinePosition(xPos: number, yPos: number, xPos2: number, yPos2: number): number[] {
    return [(xPos + xPos2) / 2, (yPos + yPos2) / 2];

  }

  /**
   * check area around tempXPos,tempYPos for space
   * @param tempXPos
   * @param tempYPos
   * @private
   */
  private checkForSpace(tempXPos: number, tempYPos: number): boolean {
    for (let i = tempXPos - TreeNode.nodeDiameter / 2; i <= tempXPos + TreeNode.nodeDiameter / 2; i++) {
      let yPosMap: Map<number, TreeNode> = this.treeNodeService.available.get(i);

      for (let j = tempYPos - TreeNode.nodeDiameter; j <= tempYPos + TreeNode.nodeDiameter; j++) {
        if (yPosMap.get(j) !== undefined || j >= 99 || j < 0) {
          return false;
        }
      }
    }
    return true;
  }


  // generateLineId(): string {
  //   if (this.lineId === undefined) {
  //     this.lineId = '' + Math.random();
  //   }
  //   return this.lineId;
  // }

  /**
   * checks if point is occupied on mapping, returns true if available
   * @param tempXPos
   * @param tempYPos
   * @param slope
   * @private
   */
  private checkPointAvailable(tempXPos: number, tempYPos: number, slope: number): boolean {
    if (tempXPos >= 100 || tempXPos < 0 || tempYPos >= 100 || tempYPos < 0) {
      return false;
    }

    //check if we are in claimed area
    let point: TreeNode = this.treeNodeService.available.get(tempXPos).get(tempYPos);

    return point === undefined;
  }

  /**
   * get all positions minChildDistance away from parent
   * posx and posy < 100-radius && > radius
   * @private
   * @param parentXPos
   * @param parentYPos
   */
  private static getAllDirections(parentXPos: number, parentYPos: number): number[][] {
    let positions: number[][] = [];
    const radius: number = TreeNode.nodeDiameter;
    for (let i = parentXPos - (radius + 1); i <= parentXPos + radius + 1 && i < 100 - radius; i++) {
      if (i <= radius) {
        i = radius;
      }
      if (i === parentXPos - (radius + 1) || i === parentXPos + radius + 1) {
        for (let j = parentYPos - (radius + 1); j <= parentYPos + radius + 1 && j < 100 - radius; j++) {
          if (j < radius) {
            j = radius;
          }
          positions.push([i, j]);
        }
      } else {
        positions.push([i, parentYPos - (radius - 1)]);
        positions.push([i, parentYPos + radius + 1]);

      }
    }
    return positions;
  }

  private checkDirection(fromNode: TreeNode, xPos: number, yPos: number): boolean {
    const slope: number = TreeNode.calculateSlope(xPos, yPos, fromNode.xPos, fromNode.yPos);
    //keep going till point is out of bounds
    while (xPos < 100 - (TreeNode.nodeDiameter / 2) && xPos >= (TreeNode.nodeDiameter / 2) &&
    yPos < 100 - (TreeNode.nodeDiameter / 2) && yPos >= (TreeNode.nodeDiameter / 2)) {
      // if line has reached an occupied space then this direction is useless
      if (this.checkPointAvailable(xPos, yPos, slope)) {
        //check if space around point for node
        if (this.checkForSpace(xPos, yPos)) {
          this.claimPosition(xPos, yPos);
          return true;
        } else {
          //increase line distance by slope
          xPos = Math.ceil((1 / slope) + xPos);
          let ySign: number = yPos - this.parentNode.yPos;
          yPos = (ySign / Math.abs(ySign)) + yPos;

          //if line length > max line length then return false
          if(this.getLineLength(fromNode.xPos,fromNode.yPos,xPos,yPos) > this.lineMaxLength){
            return false;
          }
        }
      } else {
        return false;
      }
    }

  }

  /**
   * generate this nodes children before letting children generate grandchildren
   */
  public generateChildren(interval: boolean) {
    while (this.childrenNodes.length < this.treeNodeService.maxChildren && this.treeDepth < this.treeNodeService.treeDepth) {
      let childNode: TreeNode = new TreeNode(this, this.treeNodeService);
      if (childNode.exist) {
        this.childrenNodes.push(childNode);
      } else {
        //if child cant get space then dont try other children
        break;
      }
    }
    if (!interval) {
      for (let node of this.childrenNodes) {
        node.generateChildren(interval);
      }
    }
  }

  setId(length) {
    if (this.id === undefined) {

      this.id = this.getRandomId(length);
    }
    return this.id;
  }

  public drawNewLines() {
    for (let node of this.getRelations()) {
      //does this node already have a line?
      let line = node.relationsLines.get(this.id);
      if(line === undefined || line === null){
        let nodeLine: NodeLine = new NodeLine();
        nodeLine.angle = this.getLineAngle(this.xPos, this.yPos, node.xPos, node.yPos);
        nodeLine.position = TreeNode.getLinePosition(this.xPos, this.yPos, node.xPos, node.yPos);
        nodeLine.length = this.getLineLength(this.xPos, this.yPos, node.xPos, node.yPos);
        nodeLine.id = this.getRandomId(10);
        this.relationsLines.set(node.id,nodeLine);
      }else{
        this.relationsLines.set(node.id,line);
      }
    }
  }

  /**
   * looks at nodes and checks if they have this node in their children node list
   */
  public getParents() {
    for(let node of this.treeNodeService.nodes){
        if(node.childrenNodes.indexOf(this) >= 0){
          this.parents.push(node);
        }
    }
  }

  public getRandomId(length: number):string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public getRelations():TreeNode[] {
    let relations: TreeNode[] = [];
    relations.push(...this.childrenNodes);
    relations.push(...this.parents);
    return relations;
  }

  public toString():string{
    return this.id;
  }
}
