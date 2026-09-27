'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import {
  generateRandomArray,
  getAlgorithm,
  type AlgorithmName,
  type SortStep,
} from '../lib/algorithms';

export default function AlgoWorkspace() {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(30));
  const [algorithm, setAlgorithm] = useState<AlgorithmName>('bubble');
  const [speed, setSpeed] = useState(50); // мс между шагами (меньше = быстрее)
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState<SortStep | null>(null);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  const generatorRef = useRef<Generator<SortStep> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetArray = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false);
    setIsFinished(false);
    setArray(generateRandomArray(30));
    setCurrentStep(null);
    setComparisons(0);
    setSwaps(0);
    generatorRef.current = null;
  }, []);

  const startSorting = useCallback(() => {
    if (isFinished) {
      resetArray();
      setTimeout(() => startSorting(), 50);
      return;
    }

    // Если генератор еще не создан — создаём
    if (!generatorRef.current) {
      const algo = getAlgorithm(algorithm);
      generatorRef.current = algo.fn(array);
    }

    setIsRunning(true);

    const step = () => {
      const gen = generatorRef.current;
      if (!gen) return;

      const result = gen.next();
      if (result.done) {
        setIsRunning(false);
        setIsFinished(true);
        return;
      }

      const stepData = result.value;
      setCurrentStep(stepData);
      setArray([...stepData.array]);
      
      if (stepData.comparing.length > 0) setComparisons(c => c + 1);
      if (stepData.swapping.length > 0) setSwaps(s => s + 1);

      timeoutRef.current = setTimeout(step, 101 - speed);
    };

    step();
  }, [array, algorithm, speed, isFinished, resetArray]);

  const pauseSorting = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false);
  }, []);

  const changeAlgorithm = (newAlgo: AlgorithmName) => {
    if (isRunning) return;
    setAlgorithm(newAlgo);
    resetArray();
  };

  const algoInfo = getAlgorithm(algorithm);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-bg">
      {/* Левая панель управления */}
      <aside className="w-80 border-r border-gray-800 bg-cyber-panel flex flex-col z-10 p-6">
        <h2 className="text-2xl font-bold font-mono neon-text mb-6">ALGO-LAB</h2>

        {/* Выбор алгоритма */}
        <div className="mb-6">
          <label className="text-xs font-mono text-gray-400 mb-2 block">АЛГОРИТМ</label>
          <div className="space-y-2">
            {(['bubble', 'selection', 'quick'] as AlgorithmName[]).map(algo => {
              const info = getAlgorithm(algo);
              const isActive = algorithm === algo;
              return (
                <button
                  key={algo}
                  onClick={() => changeAlgorithm(algo)}
                  disabled={isRunning}
                  className={`w-full p-3 rounded-lg border text-left font-mono text-sm transition-all ${
                    isActive
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  } disabled:opacity-50`}
                >
                  <div className="font-bold">{info.name}</div>
                  <div className="text-xs opacity-70">Сложность: {info.complexity}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Скорость */}
        <div className="mb-6">
          <label className="text-xs font-mono text-gray-400 mb-2 block">
            СКОРОСТЬ: {speed}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isRunning}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Кнопки управления */}
        <div className="space-y-2 mb-6">
          {!isRunning ? (
            <button
              onClick={startSorting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Play className="w-4 h-4" />
              {isFinished ? 'ЗАНОВО' : 'ЗАПУСТИТЬ'}
            </button>
          ) : (
            <button
              onClick={pauseSorting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-mono transition-all"
            >
              <Pause className="w-4 h-4" />
              ПАУЗА
            </button>
          )}
          <button
            onClick={resetArray}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 font-mono transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            СБРОСИТЬ
          </button>
        </div>

        {/* Метрики */}
        <div className="mt-auto space-y-3 p-4 rounded-lg bg-gray-900 border border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-gray-400">Сравнений:</span>
            <span className="text-sm font-mono font-bold text-cyan-400 ml-auto">{comparisons}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-gray-400">Перестановок:</span>
            <span className="text-sm font-mono font-bold text-purple-400 ml-auto">{swaps}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400">Сложность:</span>
            <span className="text-sm font-mono font-bold text-green-400 ml-auto">{algoInfo.complexity}</span>
          </div>
        </div>

        {/* Описание текущего шага */}
        {currentStep && (
          <div className="mt-3 p-3 rounded-lg bg-gray-900 border border-cyan-500/30">
            <div className="text-xs font-mono text-cyan-400 mb-1">ТЕКУЩИЙ ШАГ:</div>
            <div className="text-sm font-mono text-white">{currentStep.description}</div>
          </div>
        )}
      </aside>

      {/* Центр: визуализация */}
      <main className="flex-1 relative cyber-grid-bg flex flex-col">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-800 bg-cyber-panel/50 backdrop-blur-sm">
          <h1 className="text-3xl font-bold font-mono text-white">
            {algoInfo.name}
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            Временная сложность: <span className="text-cyan-400">{algoInfo.complexity}</span> • 
            Элементов: <span className="text-cyan-400">{array.length}</span>
          </p>
        </div>

        {/* График сортировки */}
        <div className="flex-1 flex items-end justify-center gap-1 p-8 overflow-hidden">
          {array.map((value, idx) => {
            const isComparing = currentStep?.comparing.includes(idx);
            const isSwapping = currentStep?.swapping.includes(idx);
            const isSorted = currentStep?.sorted.includes(idx);

            let bgColor = 'bg-gray-600';
            let glow = '';
            
            if (isSwapping) {
              bgColor = 'bg-red-500';
              glow = 'shadow-[0_0_15px_#EF4444]';
            } else if (isComparing) {
              bgColor = 'bg-cyan-400';
              glow = 'shadow-[0_0_15px_#00F0FF]';
            } else if (isSorted) {
              bgColor = 'bg-green-400';
              glow = 'shadow-[0_0_10px_#00FF9D]';
            }

            const height = (value / 100) * 100;

            return (
              <div
                key={idx}
                className={`flex-1 max-w-8 rounded-t transition-all duration-150 ${bgColor} ${glow}`}
                style={{ height: `${height}%` }}
              >
                <div className="text-[10px] font-mono text-white text-center mt-1 opacity-70">
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="p-4 border-t border-gray-800 bg-cyber-panel/50 flex justify-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded" />
            <span className="text-gray-400">Обычный</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded shadow-[0_0_8px_#00F0FF]" />
            <span className="text-gray-400">Сравнение</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded shadow-[0_0_8px_#EF4444]" />
            <span className="text-gray-400">Перестановка</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded shadow-[0_0_8px_#00FF9D]" />
            <span className="text-gray-400">Отсортировано</span>
          </div>
        </div>
      </main>
    </div>
  );
}