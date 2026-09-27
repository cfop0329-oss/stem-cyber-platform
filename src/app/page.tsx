import Link from 'next/link';
import { GraduationCap, BookOpen, Cpu, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 cyber-grid-bg">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-mono neon-text mb-4">STEM CYBER PLATFORM</h1>
        <p className="text-gray-400 text-lg">Выбери свою роль, инженер.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {/* УЧЕНИК */}
        <Link
          href="/student"
          className="group relative flex flex-col items-start p-8 rounded-xl bg-cyber-panel border-2 border-gray-800 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors font-mono">
                УЧЕНИК
              </h2>
              <p className="text-xs text-cyan-400/70 font-mono">STUDENT MODE</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Исследуй 4 сектора: схемотехника, алгоритмы, сети и ИИ. 
            Выполняй миссии, собирай ачивки, экспериментируй в песочнице.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="text-xs font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              🔌 Схемотехника
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/30">
               Алгоритмы
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              🌐 Сети
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30">
              🧠 ИИ
            </span>
          </div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-500 rounded-full group-hover:shadow-[0_0_15px_#00F0FF] transition-all animate-pulse" />
        </Link>

        {/* УЧИТЕЛЬ */}
        <Link
          href="/teacher"
          className="group relative flex flex-col items-start p-8 rounded-xl bg-cyber-panel border-2 border-gray-800 transition-all duration-300 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all">
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors font-mono">
                УЧИТЕЛЬ
              </h2>
              <p className="text-xs text-purple-400/70 font-mono">TEACHER MODE</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Создавай задания для учеников, отслеживай прогресс класса, 
            анализируй статистику и управляй учебным процессом.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="text-xs font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              📋 Задания
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
               Статистика
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30">
              👥 Класс
            </span>
          </div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full group-hover:shadow-[0_0_15px_#A855F7] transition-all animate-pulse" />
        </Link>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs font-mono text-gray-600">
          v1.0 • STEM без сложного оборудования • 2026
        </p>
      </div>
    </main>
  );
}