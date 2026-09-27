'use client';

import { Handle, Position } from '@xyflow/react';
import { ToggleRight, ToggleLeft } from 'lucide-react';

interface ToggleNodeData {
  label: string;
  isOn: boolean;
  onToggle: () => void;
}

export default function ToggleNode({ data }: { data: ToggleNodeData }) {
  return (
    <div className="relative">
      {/* Выходной пин (справа) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-cyber-bg"
        style={{ boxShadow: data.isOn ? '0 0 10px #00F0FF' : 'none' }}
      />
      
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-cyber-panel border border-gray-700 min-w-[120px]">
        <button
          onClick={data.onToggle}
          className="transition-all duration-300"
        >
          {data.isOn ? (
            <ToggleRight className="w-12 h-12 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px #00F0FF)' }} />
          ) : (
            <ToggleLeft className="w-12 h-12 text-gray-500" />
          )}
        </button>
        <span className="text-xs font-mono text-gray-300">{data.label}</span>
        <span className={`text-xs font-mono ${data.isOn ? 'text-cyan-400' : 'text-gray-600'}`}>
          {data.isOn ? 'ON (1)' : 'OFF (0)'}
        </span>
      </div>
    </div>
  );
}