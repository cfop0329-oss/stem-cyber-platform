'use client';'use client';

import { ToggleRight, Lightbulb, Cpu } from 'lucide-react';

const components = [
  { type: 'toggle', label: 'Тумблер SW1', icon: ToggleRight, color: 'text-cyan-400' },
  { type: 'led', label: 'Светодиод LED', icon: Lightbulb, color: 'text-green-400' },
  { type: 'and', label: 'Вентиль AND', icon: Cpu, color: 'text-purple-400' },
  { type: 'or', label: 'Вентиль OR', icon: Cpu, color: 'text-orange-400' },
  { type: 'xor', label: 'Вентиль XOR', icon: Cpu, color: 'text-yellow-400' },
  { type: 'not', label: 'Инвертор NOT', icon: Cpu, color: 'text-red-400' },
];

function DraggableComponent({ type, label, icon: Icon, color }: any) {
  // Используем стандартный HTML5 Drag and Drop
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-gray-900 border border-gray-700 cursor-grab active:cursor-grabbing hover:border-cyan-500 transition-all"
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-sm font-mono text-gray-300">{label}</span>
    </div>
  );
}

export default function ComponentPalette() {
  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-lg font-bold text-white mb-4 font-mono">Палитра компонентов</h3>
      <div className="flex-1 overflow-y-auto">
        {components.map((comp) => (
          <DraggableComponent key={comp.type} {...comp} />
        ))}
      </div>
    </div>
  );
}