import { Node, Edge, Position } from '@xyflow/react';
import type { Prompt } from '@/types/prompt';
import structureKeyConfig from './structure_key.json';
import Image from 'next/image';

interface StructureValue {
  en: string[];
  cn: string[];
}

interface StructureKeyConfig {
  [key: string]: string;
}

export const generateNodesAndEdges = (promptData: Prompt, isEnglish: boolean = true) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const LEVEL_PADDING = 400;
  const NODE_VERTICAL_PADDING = 50;
  const EDGE_STROKE_COLOR = '#F0E8E3';  // 统一的边颜色
  
  // ... existing code ...
  nodes.push({
    id: 'root',
    type: 'default',
    position: { x: 50, y: 50 },
    data: { label: isEnglish ? promptData.prompt : promptData.prompt_cn },
    style: { 
      width: 250,
      padding: '10px',
      border: '2px solid #8bcbff',
      borderRadius: '8px',
      boxShadow: '0 0px 6px rgba(0,0,0, 0.2)',
      backgroundColor: '#e3f2fd',
      fontSize: promptData.prompt.length > 100 ? '14px' : '18px',
      fontFamily: 'PingFang SC, sans-serif',
    },
    sourcePosition: Position.Right,
    handles: [
      {
        id: 'handle-right',
        type: 'source',
        position: Position.Right,
        x: 50,
        y: 100,
      },
      {
        id: 'handle-bottom',
        type: 'source',
        position: Position.Right,
        x: 50,
        y: 100,
      },
    ],
  });

  // 添加图片节点
  if (promptData.image_url) {
    // 将图片URL中的域名替换为midjourney
    const imageUrl = promptData.image_url.replace(/\.com\//, '.com/midjourney/');
    nodes.push({
      id: 'image-node',
      type: 'default',
      draggable: true,  // 添加可拖动属性
      position: { x: 0, y: 300 }, // 调整垂直位置
      width: 300,
      height: 300,
      data: {
        label: (
          <div style={{ width: '300px', height: '300px', margin: '-10px 0 0 -10px', position: 'relative' }}>
            <Image
              src={imageUrl}
              alt="Prompt Image"
              fill
              sizes="300px"
              style={{
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
        border: '2px solid #8bcbff',
        borderRadius: '8px',
        boxShadow: '0 0px 6px rgba(0,0,0, 0.2)',
        backgroundColor: '#f3e5f5'
      },
      targetPosition: Position.Top,
    });

    // 添加从根节点到图片节点的连接
    edges.push({
      id: 'edge-root-image',
      source: 'root',
      target: 'image-node',
      type: 'bezier',
      animated: true,
      style: { stroke: EDGE_STROKE_COLOR, strokeWidth: 1 }
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
        data: { label: isEnglish ? key : (structureKeyConfig as StructureKeyConfig)[key] || key },
        style: { 
          width: 150,
          padding: '8px',
          border: '2px solid #81d59c',
          borderRadius: '8px',
          boxShadow: '0 0px 6px rgba(0,0,0, 0.2)',
          backgroundColor: '#f1f8e9'
        },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      });

      edges.push({
        id: `edge-root-${fieldId}`,
        source: 'root',
        target: fieldId,
        type: 'bezier',
        style: { stroke: EDGE_STROKE_COLOR, strokeWidth: 1 }
      });

      // 添加第三层节点
      value[isEnglish ? 'en' : 'cn'].forEach((item: string, itemIndex: number) => {
        const itemId = `item-${key}-${itemIndex}`;
        
        nodes.push({
          id: itemId,
          type: 'default',
          position: { x: LEVEL_PADDING * 1.5, y: currentYPosition },
          data: { label: item },
          style: { 
            width: 150,
            padding: '4px 10px',
            border: '2px solid #ffce84',
            borderRadius: '8px',
            boxShadow: '0 0px 6px rgba(0,0,0, 0.2)',
            backgroundColor: '#fff3e0'
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right
        });

        edges.push({
          id: `edge-${fieldId}-${itemId}`,
          source: fieldId,
          target: itemId,
          type: 'bezier',
          style: { stroke: EDGE_STROKE_COLOR, strokeWidth: 1 }
        });

        currentYPosition += NODE_VERTICAL_PADDING;
      });
    });
  }
  return { nodes, edges };
}; 