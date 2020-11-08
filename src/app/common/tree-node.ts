import {TreeNodeService} from '../services/tree-node.service';


export class TreeNode {

  public leftChild: TreeNode;
  public lcLineAngle: number;
  public lcLineLength: number;
  public lcLinePosition: number[];

  public rightChild: TreeNode;
  public rcLineAngle: number;
  public rcLineLength: number;
  public rcLinePosition: number[];

  public static nodeDiameter: number = 6; // as percent
  public xPos: number;
  public yPos: number;
  public myTreeLevel: number;
  public isLeaf: boolean = false;
  public static distanceFromParent: number = 8;


  constructor(public parentNode: TreeNode, public treeLevel: number, public treeNodeService: TreeNodeService) {
    treeNodeService.nodes.push(this);
    this.myTreeLevel = treeLevel - 1;

    this.setPosition(parentNode);

    if (treeLevel <= 0) {
      this.isLeaf = true;
    } else {
      this.leftChild = this.generateNode();
      this.rightChild = this.generateNode();

      //generate the lines
      this.lcLineLength = TreeNode.getLineLength(this.xPos, this.yPos, this.leftChild.xPos, this.leftChild.yPos);
      this.lcLineAngle = TreeNode.getLineAngle(this.xPos, this.yPos, this.leftChild.xPos, this.leftChild.yPos);
      this.lcLinePosition = TreeNode.getLinePosition(this.xPos, this.yPos, this.leftChild.xPos, this.leftChild.yPos);

      this.rcLineLength = TreeNode.getLineLength(this.xPos, this.yPos, this.rightChild.xPos, this.rightChild.yPos);
      this.rcLineAngle = TreeNode.getLineAngle(this.xPos, this.yPos, this.rightChild.xPos, this.rightChild.yPos);
      this.rcLinePosition = TreeNode.getLinePosition(this.xPos, this.yPos, this.rightChild.xPos, this.rightChild.yPos);
    }

  }

  private generateNode(): TreeNode {
    //generate TreeNode with a calculated x and y pos
    return new TreeNode(this, this.myTreeLevel, this.treeNodeService);
  }

  private setPosition(parentNode: TreeNode) {
      let tempXPos: number = 0;
      let tempYPos: number = 0;
      //if no parent then select any location
      if (parentNode === undefined) {
        tempXPos = TreeNode.getRandomNumber([[TreeNode.nodeDiameter, 100 - (TreeNode.nodeDiameter / 2)]]);
        tempYPos = TreeNode.getRandomNumber([[TreeNode.nodeDiameter, 100 - (TreeNode.nodeDiameter / 2)]]);
        this.claimPosition(tempXPos,tempYPos);
      } else {
        while (true) {
          let distance = TreeNode.distanceFromParent;
          // let availableSpace: Array<number[]> = this.checkForSpace(tempXPos,tempYPos,distance);
          tempXPos = TreeNode.getRandomNumber([
            [this.parentNode.xPos - TreeNode.nodeDiameter, (this.parentNode.xPos - TreeNode.nodeDiameter) - TreeNode.distanceFromParent],
            [this.parentNode.xPos + TreeNode.nodeDiameter, (this.parentNode.xPos + TreeNode.nodeDiameter) + TreeNode.distanceFromParent]
          ]);
          tempYPos = TreeNode.getRandomNumber([
            [this.parentNode.yPos - TreeNode.nodeDiameter, (this.parentNode.yPos - TreeNode.nodeDiameter) - TreeNode.distanceFromParent],
            [this.parentNode.yPos + TreeNode.nodeDiameter, (this.parentNode.yPos + TreeNode.nodeDiameter) + TreeNode.distanceFromParent]
          ]);
          let success:boolean = true;
          //check if occupied
          for(let pos of this.treeNodeService.notAvailable){
            if(pos[0] === tempXPos){
              if(pos[1] === tempYPos){
                success = false;
                break;
              }
            }
          }
          if(success){
            //add positions not available anymore
            this.claimPosition(tempXPos,tempYPos);
            break;
          }
      }
    }


  }
  claimPosition(xPos:number,yPos:number){
    this.xPos = xPos;
    this.yPos = yPos;
    for(let i=this.yPos-TreeNode.nodeDiameter;i<=this.yPos+TreeNode.nodeDiameter;i++){
      for(let j=this.xPos-TreeNode.nodeDiameter;j<=this.xPos+TreeNode.nodeDiameter;j++){
        this.treeNodeService.notAvailable.push([j,i]);
      }
    }
    console.log(`claimed: from ${this.yPos-TreeNode.nodeDiameter}, ${this.xPos-TreeNode.nodeDiameter} to
    ${this.yPos+TreeNode.nodeDiameter}, ${this.xPos+TreeNode.nodeDiameter}`)
  }

  /**
   * get a random position that is outside parent position
   * range[min-max]
   * @param ranges
   * @private
   */
  private static getRandomNumber(ranges: Array<Array<number>>): number {
    let range: number[] = ranges[Math.floor(Math.random() * ranges.length)];
    //check if range has value > 100 -diameter and replace with 100 -diameter
    if (range[0] >= 100) {
      range[0] = 100 - TreeNode.nodeDiameter;
    }
    if (range[0] <= 0) {
      range[0] = TreeNode.nodeDiameter;
    }
    if (range[1] >= 100) {
      range[0] = 100 - TreeNode.nodeDiameter;
    }
    if (range[1] <= 0) {
      range[0] = TreeNode.nodeDiameter;
    }
    while (true) {
      let randNumber: number = Math.round(Math.random() * (range[1] - range[0])) + range[0];
      //check if random number is within display 0-100
      if (randNumber <= 100 - TreeNode.nodeDiameter && randNumber >= TreeNode.nodeDiameter / 2) {
        return randNumber;
      }
    }
  }

  private static getLineLength(xPos1: number, yPos1: number, xPos2: number, yPos2: number): number {
    let adj: number = Math.pow(xPos1 - xPos2, 2);
    let opp: number = Math.pow(yPos1 - yPos2, 2);
    return Math.sqrt(adj + opp);
    // return 50;
  }

  public static getLineAngle(xPos1: number, yPos1: number, xPos2: number, yPos2: number): number {
    let run: number = xPos1 - xPos2;
    let rise: number = yPos2 - yPos1;
    return Math.atan(rise / run) * 180 / Math.PI;
  }

  private static getLinePosition(xPos: number, yPos: number, xPos2: number, yPos2: number): number[] {
    return [(xPos + xPos2) / 2, (yPos + yPos2) / 2];

  }

  /**
   * check area around tempXPos,tempYPos for space
   * @param tempXPos
   * @param tempYPos
   * @param distance
   * @private
   */
  private checkForSpace(tempXPos: number, tempYPos: number, distance: number) {

  }




}
