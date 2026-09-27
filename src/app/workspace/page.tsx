'use client';

import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/Canvas';
import ComponentPalette from './components/ComponentPalette';

export default function WorkspacePage() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-cyber-bg">
        {/* Левая панель: Палитра компонентов */}
        <aside className="w-72 border-r border-gray-800 bg-cyber-panel flex flex-col z-10">
          <ComponentPalette />
        </aside>

        {/* Центр: Бесконечный холст на всю ширину */}
        <main className="flex-1 relative cyber-grid-bg">
          <Canvas />
        </main>
      </div>
    </ReactFlowProvider>
  );
}