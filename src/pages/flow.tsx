import React, { useEffect, useState } from 'react';
import { ReactFlow, Node, Edge, Background, BackgroundVariant } from '@xyflow/react';
import type { Prompt } from '@/types/prompt';
import { generateNodesAndEdges } from '@/utils/generateNodesAndEdges';
 
import '@xyflow/react/dist/style.css';
import "../utils/xy-theme.css";
import "./flow.css";

export default function App() {
  const [, setPromptData] = useState<Prompt | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrompt = async (id: number) => {
    try {
      const response = await fetch(`/api/prompt/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompt data');
      }
      const data = await response.json();
      setPromptData(data);
      
      const { nodes, edges } = generateNodesAndEdges(data);
      setNodes(nodes);
      setEdges(edges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching prompt:', err);
    }
  };

  const handleNextPrompt = async () => {
    try {
      const response = await fetch(`/api/prompt/${currentId}/next`);
      if (!response.ok) {
        throw new Error('Failed to fetch next prompt id');
      }
      const data = await response.json();
      setCurrentId(data.nextId);
      await fetchPrompt(data.nextId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next prompt');
      console.error('Error fetching next prompt:', err);
    } finally {
      setIsLoading(false);  // 结束加载
    }
  };

  const fetchRandomId = async () => {
    try {
      const response = await fetch('/api/prompt/random');
      if (!response.ok) {
        throw new Error('Failed to fetch random prompt id');
      }
      const data = await response.json();
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get random prompt');
      console.error('Error fetching random id:', err);
      return null;
    }
  };

  useEffect(() => {
    const initializePrompt = async () => {
      const randomId = await fetchRandomId();
      if (randomId) {
        setCurrentId(randomId);
        await fetchPrompt(randomId);
      }
    };

    initializePrompt();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        bottom: 100, 
        left: 150, 
        zIndex: 10 
      }}>
        <button
          onClick={handleNextPrompt}
          disabled={isLoading}
          className="button-64"
          style={{
            backgroundColor: isLoading ? '#90caf9' : '#2196f3',  // loading 时颜色变浅
            cursor: isLoading ? 'not-allowed' : 'pointer',  // loading 时改变鼠标样式
          }}
        >
          <span className="text">{isLoading ? 'Loading...' : 'Next Prompt'}</span>
        </button>
        <div className="prompt-title">将Midjourney的提示词转换为16个维度的flow结构</div>
      </div>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-left"
      >
        <Background
          color="#aaa"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}  // 可选: "dots" | "lines" | "cross"
        />
      </ReactFlow>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 70, 
          right: 20, 
          color: 'red',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}