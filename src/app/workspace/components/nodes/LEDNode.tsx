'use client';

import { Handle, Position } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';

interface LEDNodeData {
  label: string;
  isOn: boolean;
}

export default function LEDNode({ data }: { data: LEDNodeData }) {
  return (
    <div className="relative">
      {/* Входной пин (слева) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-cyber-bg"
      />
      
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-cyber-panel border border-gray-700 min-w-[120px]">
        <Lightbulb
          className="w-12 h-12 transition-all duration-300"
          style={{
            color: data.isOn ? '#00FF9D' : '#374151',
            filter: data.isOn ? 'drop-shadow(0 0 12px #00FF9D)' : 'none',
          }}
        />
        <span className="text-xs font-mono text-gray-300">{data.label}</span>
        <span className={`text-xs font-mono ${data.isOn ? 'text-green-400' : 'text-gray-600'}`}>
          {data.isOn ? 'ON (1)' : 'OFF (0)'}
        </span>
      </div>
    </div>
  );
}