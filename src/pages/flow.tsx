import React, { useEffect, useState } from 'react';
import { ReactFlow, Background, BackgroundVariant, MiniMap, Controls, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';
import type { Prompt } from '@/types/prompt';
import { generateNodesAndEdges } from '@/utils/generateNodesAndEdges';
 
import '@xyflow/react/dist/style.css';
import "../utils/xy-theme.css";
import "./flow.css";


export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [error, setError] = useState<string | null>(null);
  const [promptData, setPromptData] = useState<Prompt | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnglish, setIsEnglish] = useState(true);

  const fetchPrompt = async (id: number) => {
    try {
      const response = await fetch(`/api/prompt/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompt data');
      }
      const data = await response.json();
      setPromptData(data);
      
      const { nodes, edges } = generateNodesAndEdges(data, isEnglish);
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

  const handleLanguageToggle = () => {
    setIsEnglish(!isEnglish);
    if (promptData) {
      const { nodes, edges } = generateNodesAndEdges(promptData, !isEnglish);
      setNodes(nodes);
      setEdges(edges);
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
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',    // 使用 flex 布局
          gap: '20px'         // 按钮之间的间距
        }}>
          <button
            onClick={handleNextPrompt}
            disabled={isLoading}
            className="button-64"
            style={{
              backgroundColor: isLoading ? '#90caf9' : '#2196f3',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="text">{isLoading ? 'Loading...' : 'Next'}</span>
          </button>

          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const randomId = await fetchRandomId();
                if (randomId) {
                  setCurrentId(randomId);
                  await fetchPrompt(randomId);
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to get random prompt');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="button-64"
            style={{
              backgroundColor: isLoading ? '#90caf9' : '#2196f3',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="text">{isLoading ? 'Loading...' : 'Random'}</span>
          </button>

          <button
            onClick={handleLanguageToggle}
            className="button-64"
            style={{
              backgroundColor: '#2196f3',
              cursor: 'pointer',
            }}
          >
            <span className="text">{isEnglish ? '切换到中文' : 'Switch to English'}</span>
          </button>
        </div>
        <div className="prompt-title">将Midjourney的提示词转换为16个维度的flow结构</div>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-left"
      >
        <MiniMap zoomable pannable />
        <Controls />
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