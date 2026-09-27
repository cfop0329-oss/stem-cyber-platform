'use client';

import Canvas from './Canvas';
import ComponentPalette from './ComponentPalette';

export default function LogicWorkspace() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-bg">
      <aside className="w-72 border-r border-gray-800 bg-cyber-panel flex flex-col z-10">
        <ComponentPalette />
      </aside>
      <main className="flex-1 relative cyber-grid-bg">
        <Canvas />
      </main>
    </div>
  );
}