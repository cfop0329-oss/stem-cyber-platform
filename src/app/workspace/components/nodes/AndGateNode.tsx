'use client';

import { Handle, Position } from '@xyflow/react';

interface AndGateNodeData {
  label: string;
  output: boolean;
}

export default function AndGateNode({ data }: { data: AndGateNodeData }) {
  return (
    <div className="relative">
      {/* Входные пины (слева, два) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-a"
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-cyber-bg"
        style={{ top: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-b"
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-cyber-bg"
        style={{ top: '70%' }}
      />
      
      {/* Выходной пин (справа) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-cyber-bg"
        style={{ boxShadow: data.output ? '0 0 10px #A855F7' : 'none' }}
      />
      
      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-cyber-panel border border-gray-700 min-w-[100px] min-h-[80px]">
        <span className="text-lg font-bold font-mono text-purple-400">AND</span>
        <span className={`text-xs font-mono mt-1 ${data.output ? 'text-purple-400' : 'text-gray-600'}`}>
          {data.output ? 'OUT: 1' : 'OUT: 0'}
        </span>
      </div>
    </div>
  );
}