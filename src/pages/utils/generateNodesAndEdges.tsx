import { Node, Edge, Position } from '@xyflow/react';
import type { Prompt } from '@/types/prompt';

interface StructureValue {
  en: string[];
  cn: string[];
}

export const generateNodesAndEdges = (promptData: Prompt) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const LEVEL_PADDING = 400;
  const NODE_VERTICAL_PADDING = 50;
  
  // ... existing code ...
  nodes.push({
    id: 'root',
    type: 'default',
    position: { x: 50, y: 300 },
    data: { label: promptData.prompt },
    style: { 
      width: 250,
      padding: '10px',
      border: '2px solid #2196f3',
      borderRadius: '8px',
      backgroundColor: '#e3f2fd'
    },
    sourcePosition: Position.Right,
  });

  // 添加图片节点
  if (promptData.image_url) {
    // 将图片URL中的域名替换为midjourney
    const imageUrl = promptData.image_url.replace(/\.com\//, '.com/midjourney/');
    nodes.push({
      id: 'image-node',
      type: 'default',
      position: { x: 50, y: 450 }, // 调整垂直位置
      width: 200,
      height: 200,
      data: {
        label: (
          <div style={{ width: '200px', height: '200px', margin: '-10px 0 0 -10px' }}>
            <img
              src={imageUrl}
              alt="Prompt Image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          </div>
        )
      },
      style: {
        width: 150,
        padding: '8px',
        border: '2px solid #9c27b0',
        borderRadius: '8px',
        backgroundColor: '#f3e5f5'
      },
      targetPosition: Position.Top,
    });

    // 添加从根节点到图片节点的连接
    edges.push({
      id: 'edge-root-image',
      source: 'root',
      target: 'image-node',
      type: 'smoothstep',
      style: { stroke: '#9c27b0' }
    });
  }

  if (promptData.structure) {
    const structure = typeof promptData.structure === 'string' 
      ? JSON.parse(promptData.structure) 
      : promptData.structure;

    // 过滤掉没有内容的字段
    const validStructureEntries = (Object.entries(structure) as [string, StructureValue][])
      .filter(([, value]) => 
        value.en && Array.isArray(value.en) && value.en.length > 0
      );

    // 计算所有第三层节点的总数，用于整体布局
    const totalThirdLevelNodes = validStructureEntries.reduce((sum, [, value]: [string, StructureValue]) => 
      sum + value.en.length, 0
    );

    let currentYPosition = 300 - ((totalThirdLevelNodes - 1) * NODE_VERTICAL_PADDING) / 2;

    // 遍历每个字段
    validStructureEntries.forEach(([key, value]: [string, StructureValue]) => {
      const fieldId = `field-${key}`;
      // 计算第二层节点的位置（居中于其子节点之间）
      const fieldYPosition = currentYPosition + 
        ((value.en.length - 1) * NODE_VERTICAL_PADDING) / 2;

      // 添加第二层节点
      nodes.push({
        id: fieldId,
        type: 'default',
        position: { x: LEVEL_PADDING, y: fieldYPosition },
        data: { label: key },
        style: { 
          width: 150,
          padding: '8px',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          backgroundColor: '#f1f8e9'
        },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      });

      edges.push({
        id: `edge-root-${fieldId}`,
        source: 'root',
        target: fieldId,
        type: 'smoothstep',
        style: { stroke: '#2196f3' }
      });

      // 添加第三层节点
      value.en.forEach((item: string, itemIndex: number) => {
        const itemId = `item-${key}-${itemIndex}`;
        
        nodes.push({
          id: itemId,
          type: 'default',
          position: { x: LEVEL_PADDING * 1.5, y: currentYPosition },
          data: { label: item },
          style: { 
            width: 150,
            padding: '8px',
            border: '2px solid #ff9800',
            borderRadius: '8px',
            backgroundColor: '#fff3e0'
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right
        });

        edges.push({
          id: `edge-${fieldId}-${itemId}`,
          source: fieldId,
          target: itemId,
          type: 'smoothstep',
          style: { stroke: '#4caf50' }
        });

        currentYPosition += NODE_VERTICAL_PADDING;
      });
    });
  }
  return { nodes, edges };
}; 