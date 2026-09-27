'use client';

import { Handle, Position } from '@xyflow/react';

export default function OrGateNode({ data }: { data: any }) {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id="input-a"
        className="!absolute !top-[30%] !w-3 !h-3 !bg-orange-400 !border-2 !border-cyber-bg"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-b"
        className="!absolute !top-[70%] !w-3 !h-3 !bg-orange-400 !border-2 !border-cyber-bg"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-orange-400 !border-2 !border-cyber-bg"
        style={{ boxShadow: data.output ? '0 0 10px #F97316' : 'none' }}
      />
      
      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-cyber-panel border border-gray-700 min-w-[100px] min-h-[80px]">
        <span className="text-lg font-bold font-mono text-orange-400">OR</span>
        <span className={`text-xs font-mono mt-1 ${data.output ? 'text-orange-400' : 'text-gray-600'}`}>
          {data.output ? 'OUT: 1' : 'OUT: 0'}
        </span>
      </div>
    </div>
  );
}