import {TreeNodeService} from '../services/tree-node.service';


export class TreeNode {

  id: string;
  root: boolean;

  lineAngle: number;
  lineLength: number;
  linePosition: number[];
  lineId: string; //HTML id of line for highlighting

  static nodeDiameter: number = 2; // as percent
  xPos: number;
  yPos: number;
  myTreeLevel: number;
  isLeaf: boolean = false;
  exist: boolean = true;
  treeDepth: number;
  public childrenNodes: TreeNode[] = [];

  constructor(public parentNode, public treeNodeService: TreeNodeService) {


    if (this.setPosition(parentNode)) {
      treeNodeService.nodes.push(this);

      if (parentNode !== undefined) {
        this.treeDepth = this.parentNode.treeDepth + 1;
        parentNode.incrementTreeDepth();
        this.lineLength = this.getLineLength(this.xPos, this.yPos, this.parentNode.xPos, this.parentNode.yPos);
        this.lineAngle = this.getLineAngle(this.xPos, this.yPos, this.parentNode.xPos, this.parentNode.yPos);
        this.linePosition = TreeNode.getLinePosition(this.xPos, this.yPos, this.parentNode.xPos, this.parentNode.yPos);
        parentNode.isLeaf = false;
      } else {
        this.treeDepth = 0;
        this.root = true;
        this.id = 'root';
      }

    } else {
      //if couldnt find a position for node, remove from childrenNode in parent
      this.exist = false;
    }
    if (this.childrenNodes.length <= 0) {
      this.isLeaf = true;
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
      console.log('Parent node: ' + tempXPos + ' ' + tempYPos);
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
        if (directions.length <= 0) {
          console.log('no room for child');

        }
      }
    }
    return false;
  }

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
      if (yPosMap === undefined) {
        console.log('tried set to map of ' + i);
      }
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
    console.log(`claimed: from ${this.xPos - TreeNode.nodeDiameter}, ${this.yPos - TreeNode.nodeDiameter} to
    ${this.xPos + TreeNode.nodeDiameter}, ${this.yPos + TreeNode.nodeDiameter}`);
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
    console.log('width: ' + parent.width + ' height: ' + parent.height);
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
      if (yPosMap === undefined) {
        console.log('tried getting mapping for ' + i);
      }
      for (let j = tempYPos - TreeNode.nodeDiameter; j <= tempYPos + TreeNode.nodeDiameter; j++) {
        if (yPosMap.get(j) !== undefined || j >= 99 || j < 0) {
          return false;
        }
      }
    }
    return true;
  }


  generateLineId(): string {
    if (this.lineId === undefined) {
      this.lineId = '' + Math.random();
    }
    return this.lineId;
  }

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
      console.log('generated child');
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
    if (this.childrenNodes.length > 0) {
      this.isLeaf = false;
    }
  }

  setId(length) {
    if(this.id === undefined) {
      let result = '';
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      this.id = result;
    }
    return this.id;
  }
}
