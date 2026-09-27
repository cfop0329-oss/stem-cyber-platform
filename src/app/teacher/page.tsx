'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, BookOpen, Users, TrendingUp, 
  Cpu, GitBranch, Network, Brain, CheckCircle, 
  Clock, AlertCircle, Trash2, Edit3, Eye
} from 'lucide-react';

type Tab = 'dashboard' | 'assignments' | 'students' | 'create';

interface Assignment {
  id: string;
  title: string;
  module: 'logic' | 'algo' | 'network' | 'ai';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completedBy: number;
  totalStudents: number;
}

const MODULE_ICONS: Record<string, any> = {
  logic: Cpu,
  algo: GitBranch,
  network: Network,
  ai: Brain,
};

const MODULE_COLORS: Record<string, string> = {
  logic: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  algo: 'text-green-400 border-green-500/30 bg-green-500/10',
  network: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  ai: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
};

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Собери полусумматор',
    module: 'logic',
    description: 'Используя вентили AND и XOR, создай схему сложения двух бит.',
    difficulty: 'medium',
    completedBy: 18,
    totalStudents: 24,
  },
  {
    id: '2',
    title: 'Сортировка за O(N log N)',
    module: 'algo',
    description: 'Отсортируй массив из 1000 элементов, сделав не более 10000 сравнений.',
    difficulty: 'hard',
    completedBy: 12,
    totalStudents: 24,
  },
  {
    id: '3',
    title: 'Настрой маршрутизацию',
    module: 'network',
    description: 'Доставь 100 пакетов с потерями менее 5%.',
    difficulty: 'medium',
    completedBy: 20,
    totalStudents: 24,
  },
];

const MOCK_STUDENTS = [
  { id: 1, name: 'Алексей И.', completed: 8, xp: 450, lastActive: '2 мин назад' },
  { id: 2, name: 'Мария К.', completed: 12, xp: 720, lastActive: '15 мин назад' },
  { id: 3, name: 'Дмитрий С.', completed: 5, xp: 280, lastActive: '1 час назад' },
  { id: 4, name: 'Анна В.', completed: 15, xp: 890, lastActive: '5 мин назад' },
  { id: 5, name: 'Иван П.', completed: 3, xp: 150, lastActive: '3 часа назад' },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    module: 'logic' as const,
    description: '',
    difficulty: 'medium' as const,
  });

  const createAssignment = () => {
    if (!newAssignment.title || !newAssignment.description) return;
    setAssignments([
      ...assignments,
      {
        id: Date.now().toString(),
        ...newAssignment,
        completedBy: 0,
        totalStudents: 24,
      },
    ]);
    setNewAssignment({ title: '', module: 'logic', description: '', difficulty: 'medium' });
    setActiveTab('assignments');
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const totalStudents = MOCK_STUDENTS.length;
  const avgCompletion = Math.round(
    MOCK_STUDENTS.reduce((acc, s) => acc + s.completed, 0) / totalStudents
  );
  const totalXP = MOCK_STUDENTS.reduce((acc, s) => acc + s.xp, 0);

  return (
    <div className="flex min-h-screen bg-cyber-bg">
      {/* Боковая панель */}
      <aside className="w-64 border-r border-gray-800 bg-cyber-panel flex flex-col p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-purple-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          НАЗАД
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-400 mb-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            TEACHER MODE
          </div>
          <h2 className="text-xl font-bold font-mono text-white">Панель учителя</h2>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard', label: 'Обзор', icon: TrendingUp },
            { id: 'assignments', label: 'Задания', icon: BookOpen },
            { id: 'students', label: 'Ученики', icon: Users },
            { id: 'create', label: 'Создать задание', icon: Plus },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg font-mono text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-purple-500/10 border border-purple-500/50 text-purple-400'
                    : 'border border-transparent text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 rounded-lg bg-purple-500/5 border border-purple-500/30 text-xs font-mono text-purple-300">
          💡 <b>Совет:</b> Создавайте задания с чёткими критериями — ученики выполняют их на 40% чаще.
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold font-mono text-white mb-2">Обзор класса</h1>
            <p className="text-sm font-mono text-gray-400 mb-8">Общая статистика по 9 «Б» классу</p>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-cyber-panel border border-gray-800 rounded-lg p-5">
                <Users className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-3xl font-mono font-bold text-white">{totalStudents}</div>
                <div className="text-xs font-mono text-gray-500 mt-1">УЧЕНИКОВ</div>
              </div>
              <div className="bg-cyber-panel border border-gray-800 rounded-lg p-5">
                <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-3xl font-mono font-bold text-white">{assignments.length}</div>
                <div className="text-xs font-mono text-gray-500 mt-1">ЗАДАНИЙ</div>
              </div>
              <div className="bg-cyber-panel border border-gray-800 rounded-lg p-5">
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-3xl font-mono font-bold text-white">{avgCompletion}</div>
                <div className="text-xs font-mono text-gray-500 mt-1">СР. ВЫПОЛНЕНО</div>
              </div>
              <div className="bg-cyber-panel border border-gray-800 rounded-lg p-5">
                <TrendingUp className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-3xl font-mono font-bold text-white">{totalXP}</div>
                <div className="text-xs font-mono text-gray-500 mt-1">ВСЕГО XP</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-cyber-panel border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-mono text-white mb-4">Активность по модулям</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Схемотехника', value: 75, color: 'bg-cyan-400' },
                    { name: 'Алгоритмы', value: 60, color: 'bg-green-400' },
                    { name: 'Сети', value: 85, color: 'bg-purple-400' },
                    { name: 'ИИ', value: 45, color: 'bg-pink-400' },
                  ].map(m => (
                    <div key={m.name}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-400">{m.name}</span>
                        <span className="text-white">{m.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} transition-all`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cyber-panel border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-mono text-white mb-4">Топ-3 ученика</h3>
                <div className="space-y-3">
                  {MOCK_STUDENTS
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, 3)
                    .map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
                          i === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400' :
                          'bg-orange-500/20 text-orange-400 border border-orange-500'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-mono text-white">{s.name}</div>
                          <div className="text-xs font-mono text-gray-500">{s.xp} XP</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold font-mono text-white mb-2">Задания</h1>
                <p className="text-sm font-mono text-gray-400">Управляй миссиями для учеников</p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-mono font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
                СОЗДАТЬ
              </button>
            </div>

            <div className="space-y-3">
              {assignments.map(a => {
                const Icon = MODULE_ICONS[a.module];
                const progress = (a.completedBy / a.totalStudents) * 100;
                return (
                  <div key={a.id} className="bg-cyber-panel border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${MODULE_COLORS[a.module]}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-mono font-bold text-white">{a.title}</h3>
                          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                            a.difficulty === 'easy' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                            a.difficulty === 'medium' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                            'text-red-400 border-red-500/30 bg-red-500/10'
                          }`}>
                            {a.difficulty === 'easy' ? 'ЛЕГКО' : a.difficulty === 'medium' ? 'СРЕДНЕ' : 'СЛОЖНО'}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-gray-400 mb-3">{a.description}</p>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-gray-500">
                            Выполнено: <span className="text-green-400">{a.completedBy}/{a.totalStudents}</span>
                          </span>
                          <div className="flex-1 max-w-xs h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-gray-500">{Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-yellow-400 hover:border-yellow-500 transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAssignment(a.id)}
                          className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h1 className="text-3xl font-bold font-mono text-white mb-2">Ученики</h1>
            <p className="text-sm font-mono text-gray-400 mb-8">Прогресс каждого ученика класса</p>

            <div className="bg-cyber-panel border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-800">
                  <tr>
                    <th className="text-left p-4 text-xs font-mono text-gray-400">#</th>
                    <th className="text-left p-4 text-xs font-mono text-gray-400">ИМЯ</th>
                    <th className="text-left p-4 text-xs font-mono text-gray-400">ВЫПОЛНЕНО</th>
                    <th className="text-left p-4 text-xs font-mono text-gray-400">XP</th>
                    <th className="text-left p-4 text-xs font-mono text-gray-400">АКТИВНОСТЬ</th>
                    <th className="text-left p-4 text-xs font-mono text-gray-400">СТАТУС</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STUDENTS.map((s, i) => (
                    <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                      <td className="p-4 text-sm font-mono text-gray-500">{i + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-mono font-bold text-white">
                            {s.name[0]}
                          </div>
                          <span className="text-sm font-mono text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono text-cyan-400">{s.completed} миссий</td>
                      <td className="p-4 text-sm font-mono text-green-400 font-bold">{s.xp}</td>
                      <td className="p-4 text-xs font-mono text-gray-400">{s.lastActive}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${
                          s.xp > 500 ? 'text-green-400 bg-green-500/10' :
                          s.xp > 200 ? 'text-yellow-400 bg-yellow-500/10' :
                          'text-red-400 bg-red-500/10'
                        }`}>
                          {s.xp > 500 ? <CheckCircle className="w-3 h-3" /> :
                           s.xp > 200 ? <Clock className="w-3 h-3" /> :
                           <AlertCircle className="w-3 h-3" />}
                          {s.xp > 500 ? 'Отличник' : s.xp > 200 ? 'В процессе' : 'Отстаёт'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold font-mono text-white mb-2">Создать задание</h1>
            <p className="text-sm font-mono text-gray-400 mb-8">Новая миссия для учеников</p>

            <div className="bg-cyber-panel border border-gray-800 rounded-lg p-6 space-y-5">
              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block">НАЗВАНИЕ МИССИИ</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Например: Собери триггер"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block">МОДУЛЬ</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['logic', 'algo', 'network', 'ai'] as const).map(m => {
                    const Icon = MODULE_ICONS[m];
                    const isActive = newAssignment.module === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setNewAssignment({ ...newAssignment, module: m })}
                        className={`p-3 rounded-lg border font-mono text-xs transition-all flex flex-col items-center gap-2 ${
                          isActive
                            ? `${MODULE_COLORS[m]} border-2`
                            : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {m === 'logic' ? 'Схемы' : m === 'algo' ? 'Алго' : m === 'network' ? 'Сети' : 'ИИ'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block">СЛОЖНОСТЬ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setNewAssignment({ ...newAssignment, difficulty: d })}
                      className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                        newAssignment.difficulty === d
                          ? d === 'easy' ? 'border-green-500 bg-green-500/10 text-green-400' :
                            d === 'medium' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' :
                            'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {d === 'easy' ? 'ЛЕГКО' : d === 'medium' ? 'СРЕДНЕ' : 'СЛОЖНО'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block">ОПИСАНИЕ / КРИТЕРИИ</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Опиши, что нужно сделать и как будет оцениваться..."
                  rows={4}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-sm focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={createAssignment}
                  className="flex-1 py-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-mono font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  ОПУБЛИКОВАТЬ ЗАДАНИЕ
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 font-mono transition-all"
                >
                  ОТМЕНА
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}