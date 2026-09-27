'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LogicWorkspace from './components/LogicWorkspace';
import AlgoWorkspace from './components/AlgoWorkspace';
import NetworkWorkspace from './components/NetworkWorkspace';
import AIWorkspace from './components/AIWorkspace';

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'logic';

  if (mode === 'algo') return <AlgoWorkspace />;
  if (mode === 'network') return <NetworkWorkspace />;
  if (mode === 'ai') return <AIWorkspace />;

  return (
    <ReactFlowProvider>
      <LogicWorkspace />
    </ReactFlowProvider>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-cyber-bg">
        <div className="text-cyan-400 font-mono text-xl animate-pulse">Загрузка модуля...</div>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}