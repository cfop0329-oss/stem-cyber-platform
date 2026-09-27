'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Brain, Eye, Zap, RotateCcw, Play, Pause } from 'lucide-react';
import { KERNELS, applyConvolution, perceptronPredict, trainPerceptron, recognizeDigit } from '../lib/ai';

type Tab = 'convolution' | 'perceptron' | 'recognition';

export default function AIWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>('convolution');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-bg">
      {/* Левая панель: навигация */}
      <aside className="w-80 border-r border-gray-800 bg-cyber-panel flex flex-col z-10 p-6">
        <h2 className="text-2xl font-bold font-mono neon-text mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          AI & VISION LAB
        </h2>

        <div className="space-y-2 mb-6">
          <button
            onClick={() => setActiveTab('convolution')}
            className={`w-full p-3 rounded-lg border text-left font-mono text-sm transition-all flex items-center gap-3 ${
              activeTab === 'convolution'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Eye className="w-5 h-5" />
            <div>
              <div className="font-bold">Свёртка</div>
              <div className="text-xs opacity-70">Как нейросеть видит границы</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('perceptron')}
            className={`w-full p-3 rounded-lg border text-left font-mono text-sm transition-all flex items-center gap-3 ${
              activeTab === 'perceptron'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Zap className="w-5 h-5" />
            <div>
              <div className="font-bold">Перцептрон</div>
              <div className="text-xs opacity-70">Обучение нейрона</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('recognition')}
            className={`w-full p-3 rounded-lg border text-left font-mono text-sm transition-all flex items-center gap-3 ${
              activeTab === 'recognition'
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Brain className="w-5 h-5" />
            <div>
              <div className="font-bold">Распознавание</div>
              <div className="text-xs opacity-70">ИИ угадывает цифру</div>
            </div>
          </button>
        </div>

        <div className="mt-auto p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          💡 <b>ИИ — это математика:</b> нейросети не "думают", они применяют матричные операции к данным. Здесь ты увидишь, как это работает изнутри.
        </div>
      </aside>

      {/* Центр: контент вкладки */}
      <main className="flex-1 relative cyber-grid-bg overflow-y-auto">
        {activeTab === 'convolution' && <ConvolutionTab />}
        {activeTab === 'perceptron' && <PerceptronTab />}
        {activeTab === 'recognition' && <RecognitionTab />}
      </main>
    </div>
  );
}

// ========== ВКЛАДКА 1: СВЁРТКА ==========
function ConvolutionTab() {
  const [image, setImage] = useState<number[][]>(() => {
    const grid: number[][] = [];
    for (let y = 0; y < 10; y++) {
      grid[y] = [];
      for (let x = 0; x < 10; x++) {
        grid[y][x] = 0;
      }
    }
    return grid;
  });
  const [selectedKernel, setSelectedKernel] = useState<string>('sobelX');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const value = image[y][x];
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Сетка
    ctx.strokeStyle = '#1E2532';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
  }, [image]);

  const drawResult = useCallback(() => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const kernel = KERNELS[selectedKernel].matrix;
    const result = applyConvolution(image, kernel);

    const cellSize = canvas.width / 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const value = result[y][x];
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [image, selectedKernel]);

  useEffect(() => {
    drawImage();
    drawResult();
  }, [image, selectedKernel, drawImage, drawResult]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    updatePixel(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) updatePixel(e);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const updatePixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 10));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 10));

    if (x >= 0 && x < 10 && y >= 0 && y < 10) {
      setImage(prev => {
        const newImage = prev.map(row => [...row]);
        newImage[y][x] = newImage[y][x] > 128 ? 0 : 255;
        return newImage;
      });
    }
  };

  const clearImage = () => {
    setImage(Array(10).fill(null).map(() => Array(10).fill(0)));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-mono text-white mb-2">Свёрточный фильтр</h1>
      <p className="text-sm font-mono text-gray-400 mb-8">
        Нарисуй фигуру слева. Выбери фильтр — увидишь, как нейросеть "видит" изображение.
      </p>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Исходное изображение */}
        <div>
          <h3 className="text-lg font-mono text-cyan-400 mb-3">ИСХОДНОЕ ИЗОБРАЖЕНИЕ</h3>
          <div className="bg-cyber-panel p-4 rounded-lg border border-gray-700">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="cursor-crosshair border border-gray-600 rounded"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <button
              onClick={clearImage}
              className="mt-3 w-full py-2 rounded-lg border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 font-mono text-sm transition-all"
            >
              ОЧИСТИТЬ
            </button>
          </div>
        </div>

        {/* Результат свёртки */}
        <div>
          <h3 className="text-lg font-mono text-purple-400 mb-3">ПОСЛЕ ФИЛЬТРА</h3>
          <div className="bg-cyber-panel p-4 rounded-lg border border-gray-700">
            <canvas
              ref={resultCanvasRef}
              width={300}
              height={300}
              className="border border-gray-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Выбор фильтра */}
      <div>
        <h3 className="text-lg font-mono text-white mb-3">ВЫБЕРИ ФИЛЬТР (ЯДРО 3×3)</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(KERNELS).map(([key, kernel]) => (
            <button
              key={key}
              onClick={() => setSelectedKernel(key)}
              className={`p-4 rounded-lg border text-left font-mono text-sm transition-all ${
                selectedKernel === key
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-bold mb-2">{kernel.name}</div>
              <div className="text-xs opacity-70 mb-3">{kernel.description}</div>
              <div className="grid grid-cols-3 gap-1">
                {kernel.matrix.flat().map((val, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded text-xs"
                  >
                    {val.toFixed(1)}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== ВКЛАДКА 2: ПЕРЦЕПТРОН ==========
function PerceptronTab() {
  const [weights, setWeights] = useState([0.5, 0.5]);
  const [bias, setBias] = useState(0);
  const [learningRate, setLearningRate] = useState(0.1);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);

  // Тренировочные данные: XOR-подобная задача
  const trainingData = [
    { inputs: [0, 0], label: 0 },
    { inputs: [0, 1], label: 1 },
    { inputs: [1, 0], label: 1 },
    { inputs: [1, 1], label: 0 },
  ];

  const predict = (inputs: number[]) => perceptronPredict(inputs, weights, bias);

  const trainStep = () => {
    const newState = trainPerceptron({ weights, bias, learningRate }, trainingData, 1);
    setWeights(newState.weights);
    setBias(newState.bias);
    setEpoch(e => e + 1);
  };

  const startTraining = () => {
    setIsTraining(true);
    const interval = setInterval(() => {
      trainStep();
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsTraining(false);
    }, 5000);
  };

  const reset = () => {
    setWeights([0.5, 0.5]);
    setBias(0);
    setEpoch(0);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-mono text-white mb-2">Перцептрон</h1>
      <p className="text-sm font-mono text-gray-400 mb-8">
        Простейший нейрон. Настраивай веса вручную или запусти обучение.
      </p>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Визуализация нейрона */}
        <div className="bg-cyber-panel p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-mono text-purple-400 mb-4">НЕЙРОН</h3>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            {/* Входы */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                  <span className="font-mono text-cyan-400 font-bold">X₁</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                  <span className="font-mono text-cyan-400 font-bold">X₂</span>
                </div>
              </div>
            </div>

            {/* Нейрон */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-purple-500/20 border-4 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                <div className="text-center">
                  <div className="text-xs font-mono text-gray-400">Σ</div>
                  <div className="text-lg font-mono text-purple-400 font-bold">f(x)</div>
                </div>
              </div>
              {/* Bias */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono text-yellow-400">
                bias: {bias.toFixed(2)}
              </div>
            </div>

            {/* Выход */}
            <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <span className="font-mono text-green-400 font-bold">Y</span>
            </div>
          </div>

          {/* Веса */}
          <div className="space-y-3 mt-12">
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">
                Вес W₁ (X₁ → нейрон): {weights[0].toFixed(2)}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={weights[0]}
                onChange={(e) => setWeights([Number(e.target.value), weights[1]])}
                className="w-full accent-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">
                Вес W₂ (X₂ → нейрон): {weights[1].toFixed(2)}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={weights[1]}
                onChange={(e) => setWeights([weights[0], Number(e.target.value)])}
                className="w-full accent-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 mb-1 block">
                Смещение (bias): {bias.toFixed(2)}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={bias}
                onChange={(e) => setBias(Number(e.target.value))}
                className="w-full accent-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Предсказания */}
        <div className="bg-cyber-panel p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-mono text-green-400 mb-4">ПРЕДСКАЗАНИЯ</h3>
          
          <div className="space-y-3 mb-6">
            {trainingData.map((data, idx) => {
              const prediction = predict(data.inputs);
              const isCorrect = prediction === data.label;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
                  }`}
                >
                  <div className="font-mono text-sm">
                    <span className="text-cyan-400">X₁={data.inputs[0]}, X₂={data.inputs[1]}</span>
                  </div>
                  <div className="font-mono text-sm">
                    <span className="text-gray-400">→ </span>
                    <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {prediction} {isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs font-mono text-gray-400 mb-4">
            Эпоха обучения: <span className="text-purple-400 font-bold">{epoch}</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={startTraining}
              disabled={isTraining}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold font-mono transition-all disabled:opacity-50"
            >
              {isTraining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isTraining ? 'ОБУЧЕНИЕ...' : 'ЗАПУСТИТЬ ОБУЧЕНИЕ'}
            </button>
            <button
              onClick={reset}
              className="w-full py-2 rounded-lg border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 font-mono text-sm transition-all"
            >
              СБРОСИТЬ
            </button>
          </div>
        </div>
      </div>

      {/* Скорость обучения */}
      <div className="bg-cyber-panel p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-mono text-cyan-400 mb-3">СКОРОСТЬ ОБУЧЕНИЯ</h3>
        <label className="text-xs font-mono text-gray-400 mb-2 block">
          Learning Rate: {learningRate.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={learningRate}
          onChange={(e) => setLearningRate(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <p className="text-xs font-mono text-gray-500 mt-2">
          Слишком маленькая — обучение медленное. Слишком большая — нейрон "скачет" и не сходится.
        </p>
      </div>
    </div>
  );
}

// ========== ВКЛАДКА 3: РАСПОЗНАВАНИЕ ==========
function RecognitionTab() {
  const [image, setImage] = useState<number[][]>(() =>
    Array(5).fill(null).map(() => Array(5).fill(0))
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<{ digit: string; confidence: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / 5;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const value = image[y][x];
        ctx.fillStyle = value > 128 ? '#00F0FF' : '#0B0E14';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Сетка
    ctx.strokeStyle = '#1E2532';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
  }, [image]);

  useEffect(() => {
    drawImage();
    if (image.some(row => row.some(v => v > 128))) {
      setPrediction(recognizeDigit(image));
    } else {
      setPrediction(null);
    }
  }, [image, drawImage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    updatePixel(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) updatePixel(e);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const updatePixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 5));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 5));

    if (x >= 0 && x < 5 && y >= 0 && y < 5) {
      setImage(prev => {
        const newImage = prev.map(row => [...row]);
        newImage[y][x] = newImage[y][x] > 128 ? 0 : 255;
        return newImage;
      });
    }
  };

  const clearImage = () => {
    setImage(Array(5).fill(null).map(() => Array(5).fill(0)));
    setPrediction(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-mono text-white mb-2">Распознавание цифр</h1>
      <p className="text-sm font-mono text-gray-400 mb-8">
        Нарисуй цифру 0 или 1 в сетке 5×5. ИИ попытается её угадать.
      </p>

      <div className="grid grid-cols-2 gap-8">
        {/* Холст для рисования */}
        <div className="bg-cyber-panel p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-mono text-cyan-400 mb-3">НАРИСУЙ ЦИФРУ</h3>
          <canvas
            ref={canvasRef}
            width={250}
            height={250}
            className="cursor-crosshair border border-gray-600 rounded mb-4"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <button
            onClick={clearImage}
            className="w-full py-2 rounded-lg border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 font-mono text-sm transition-all"
          >
            ОЧИСТИТЬ
          </button>
        </div>

        {/* Результат распознавания */}
        <div className="bg-cyber-panel p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-mono text-green-400 mb-3">РЕЗУЛЬТАТ</h3>
          
          {prediction ? (
            <div className="text-center">
              <div className="text-8xl font-mono font-bold text-cyan-400 mb-4" style={{ textShadow: '0 0 30px #00F0FF' }}>
                {prediction.digit}
              </div>
              <div className="text-sm font-mono text-gray-400 mb-2">Уверенность ИИ:</div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all"
                  style={{ width: `${prediction.confidence}%` }}
                />
              </div>
              <div className="text-2xl font-mono font-bold text-green-400 mt-2">
                {prediction.confidence}%
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 font-mono text-sm">
              Нарисуй цифру, чтобы увидеть предсказание
            </div>
          )}
        </div>
      </div>

      {/* Примеры */}
      <div className="mt-8 bg-cyber-panel p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-mono text-purple-400 mb-3">ПРИМЕРЫ ДЛЯ РИСОВАНИЯ</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-4xl font-mono text-cyan-400 mb-2">0</div>
            <div className="text-xs font-mono text-gray-400">Кольцо из пикселей</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-mono text-cyan-400 mb-2">1</div>
            <div className="text-xs font-mono text-gray-400">Вертикальная линия</div>
          </div>
        </div>
      </div>
    </div>
  );
}