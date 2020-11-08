import { TreeNode } from './tree-node';

describe('Node', () => {
  it('should create an instance', () => {
    expect(new TreeNode(null,1,[])).toBeTruthy();
  });

  it('should be 45',()=>{
    expect(TreeNode.getLineAngle(3,2,0,0)).toBe(45,`not correct value`);
  })
});
