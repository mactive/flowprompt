import React, { useEffect, useState } from 'react';
import { ReactFlow, Node, Edge } from '@xyflow/react';
import type { Prompt } from '@/types/prompt';
import { generateNodesAndEdges } from './utils/generateNodesAndEdges';
 
import '@xyflow/react/dist/style.css';

export default function App() {
  const [promptData, setPromptData] = useState<Prompt | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<number>(127); // 添加当前ID的状态
  console.log(promptData)

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
    }
  };

  useEffect(() => {
    fetchPrompt(currentId);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        bottom: 200, 
        left: 200, 
        zIndex: 10 
      }}>
        <button
          onClick={handleNextPrompt}
          style={{
            padding: '20px 32px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '32px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Next Prompt
        </button>
      </div>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-left"
      />
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