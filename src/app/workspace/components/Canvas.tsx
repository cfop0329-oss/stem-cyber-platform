'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  Node,
  Edge,
} from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { 
  ToggleNode, 
  LEDNode, 
  AndGateNode, 
  OrGateNode, 
  XorGateNode, 
  NotGateNode 
} from './nodes';
import { simulateCircuit } from '../lib/simulation';

const initialNodes: Node[] = [
  { id: 'toggle-1', type: 'toggle', position: { x: 100, y: 100 }, data: { label: 'SW1', isOn: false } },
  { id: 'toggle-2', type: 'toggle', position: { x: 100, y: 250 }, data: { label: 'SW2', isOn: false } },
  { id: 'and-1', type: 'and', position: { x: 350, y: 175 }, data: { label: 'AND', output: false } },
  { id: 'led-1', type: 'led', position: { x: 600, y: 175 }, data: { label: 'LED', isOn: false } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'toggle-1', target: 'and-1', targetHandle: 'input-a', animated: false, style: { stroke: '#6B7280', strokeWidth: 2 } },
  { id: 'e2', source: 'toggle-2', target: 'and-1', targetHandle: 'input-b', animated: false, style: { stroke: '#6B7280', strokeWidth: 2 } },
  { id: 'e3', source: 'and-1', target: 'led-1', animated: false, style: { stroke: '#6B7280', strokeWidth: 2 } },
];

const nodeTypes = {
  toggle: ToggleNode,
  led: LEDNode,
  and: AndGateNode,
  or: OrGateNode,
  xor: XorGateNode,
  not: NotGateNode,
};

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // 1. Симуляция
  const nodeValues = useMemo(() => simulateCircuit(nodes, edges), [nodes, edges]);

  // 2. Обновляем данные нод на основе симуляции
  const nodesWithValues = useMemo(() => {
    return nodes.map(node => {
      const value = nodeValues[node.id] ?? false;
      
      if (node.type === 'led') {
        return { ...node, data: { ...node.data, isOn: value } };
      }
      if (node.type === 'and' || node.type === 'or' || node.type === 'xor' || node.type === 'not') {
        return { ...node, data: { ...node.data, output: value } };
      }
      return node;
    });
  }, [nodes, nodeValues]);

  // 3. Обновляем стили рёбер
  const edgesWithStyles = useMemo(() => {
    return edges.map(edge => {
      const isSignalOn = nodeValues[edge.source] === true;
      return {
        ...edge,
        animated: isSignalOn,
        style: {
          stroke: isSignalOn ? '#00F0FF' : '#6B7280',
          strokeWidth: 2,
          boxShadow: isSignalOn ? '0 0 8px #00F0FF' : 'none',
        },
      };
    });
  }, [edges, nodeValues]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: false, style: { stroke: '#6B7280', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      
      let nodeData: any = { label: type.toUpperCase() };
      if (type === 'toggle') nodeData = { label: 'SW', isOn: false };
      else if (type === 'led') nodeData = { label: 'LED', isOn: false };
      else if (type === 'and') nodeData = { label: 'AND', output: false };
      else if (type === 'or') nodeData = { label: 'OR', output: false };
      else if (type === 'xor') nodeData = { label: 'XOR', output: false };
      else if (type === 'not') nodeData = { label: 'NOT', output: false };
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  const handleToggle = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId && node.type === 'toggle') {
          return { ...node, data: { ...node.data, isOn: !node.data.isOn } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 4. Добавляем обработчик клика к тумблерам
  const nodesWithHandlers = useMemo(() => {
    return nodesWithValues.map(node => {
      if (node.type === 'toggle') {
        return {
          ...node,
          data: {
            ...node.data,
            onToggle: () => handleToggle(node.id),
          },
        };
      }
      return node;
    });
  }, [nodesWithValues, handleToggle]);

  // 5. Функция полной очистки холста
  const handleClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
      {/* Кибер-подсказка по управлению (слева) */}
      <div className="absolute top-4 left-4 z-10 bg-cyber-panel/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 text-xs font-mono text-gray-300 shadow-lg">
        <span className="text-cyan-400 font-bold">💡 УПРАВЛЕНИЕ:</span> Кликни на провод/компонент, затем{' '}
        <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-white border border-gray-600">Delete</kbd>
      </div>

      {/* Кнопка очистки холста (справа) */}
      <button
        onClick={handleClearAll}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-cyber-panel/90 backdrop-blur-sm border border-red-900/50 hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all shadow-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-950/30"
      >
        <Trash2 className="w-4 h-4" />
        ОЧИСТИТЬ ВСЁ
      </button>

      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edgesWithStyles}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E2532" />
        <Controls className="!bg-cyber-panel !border-gray-700 [&>button]:!bg-gray-800 [&>button]:!border-gray-600 [&>button]:hover:!bg-gray-700 [&>button]:!text-white" />
        <MiniMap className="!bg-cyber-panel !border-gray-700" nodeColor="#00F0FF" />
      </ReactFlow>
    </div>
  );
}