import Link from 'next/link';
import { Cpu, GitBranch, Network, Brain, ArrowLeft } from 'lucide-react';

const sectors = [
  {
    id: 'logic',
    title: 'Схемотехника',
    subtitle: 'How Computers Think',
    icon: Cpu,
    color: 'hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]',
    href: '/workspace?mode=logic'
  },
  {
    id: 'algo',
    title: 'Алгоритмы',
    subtitle: 'Visual Algo-Lab',
    icon: GitBranch,
    color: 'hover:border-green-400 hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]',
    href: '/workspace?mode=algo'
  },
  {
    id: 'network',
    title: 'Компьютерные Сети',
    subtitle: 'Network Lab',
    icon: Network,
    color: 'hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    href: '/workspace?mode=network'
  },
  {
    id: 'ai',
    title: 'ИИ и Зрение',
    subtitle: 'Computer Vision & ML',
    icon: Brain,
    color: 'hover:border-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    href: '/workspace?mode=ai'
  },
];

export default function StudentHub() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 cyber-grid-bg">
      <div className="w-full max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-cyan-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          СМЕНИТЬ РОЛЬ
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            STUDENT MODE
          </div>
          <h1 className="text-5xl font-bold font-mono neon-text mb-4">ВЫБЕРИ СЕКТОР</h1>
          <p className="text-gray-400 text-lg">Твоя лаборатория ждёт, инженер.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <Link
                key={sector.id}
                href={sector.href}
                className={`group relative flex flex-col items-start p-6 rounded-xl bg-cyber-panel border border-gray-800 transition-all duration-300 ${sector.color}`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <Icon className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                  <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {sector.title}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 font-mono">{sector.subtitle}</p>
                <div className="absolute top-2 right-2 w-2 h-2 bg-gray-700 rounded-full group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_#00F0FF] transition-all" />
              </Link>
            );
          })}
        </div>

        {/* Статистика ученика (мок) */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-cyber-panel border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-mono font-bold text-cyan-400">0</div>
            <div className="text-xs font-mono text-gray-500 mt-1">ВЫПОЛНЕНО МИССИЙ</div>
          </div>
          <div className="bg-cyber-panel border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-mono font-bold text-green-400">0 XP</div>
            <div className="text-xs font-mono text-gray-500 mt-1">ОПЫТ</div>
          </div>
          <div className="bg-cyber-panel border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-mono font-bold text-purple-400">0</div>
            <div className="text-xs font-mono text-gray-500 mt-1">АЧИВКИ</div>
          </div>
        </div>
      </div>
    </main>
  );
}