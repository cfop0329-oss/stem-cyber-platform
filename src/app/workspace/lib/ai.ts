// ========== СВЁРТКА ==========
export type Kernel = number[][];

export const KERNELS: Record<string, { name: string; matrix: Kernel; description: string }> = {
  identity: {
    name: 'Identity',
    matrix: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    description: 'Оригинальное изображение',
  },
  sobelX: {
    name: 'Sobel X (горизонтальные границы)',
    matrix: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    description: 'Выделяет вертикальные линии',
  },
  sobelY: {
    name: 'Sobel Y (вертикальные границы)',
    matrix: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    description: 'Выделяет горизонтальные линии',
  },
  blur: {
    name: 'Blur (размытие)',
    matrix: [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]],
    description: 'Сглаживает изображение',
  },
  sharpen: {
    name: 'Sharpen (резкость)',
    matrix: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    description: 'Усиливает контуры',
  },
  edge: {
    name: 'Edge Detection',
    matrix: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    description: 'Находит все границы',
  },
};

// Применяет свёртку к матрице пикселей
export function applyConvolution(image: number[][], kernel: Kernel): number[][] {
  const height = image.length;
  const width = image[0].length;
  const kSize = kernel.length;
  const offset = Math.floor(kSize / 2);
  const result: number[][] = [];

  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const py = y + ky - offset;
          const px = x + kx - offset;
          if (py >= 0 && py < height && px >= 0 && px < width) {
            sum += image[py][px] * kernel[ky][kx];
          }
        }
      }
      result[y][x] = Math.max(0, Math.min(255, sum));
    }
  }

  return result;
}

// ========== ПЕРЦЕПТРОН ==========
export interface PerceptronState {
  weights: number[];
  bias: number;
  learningRate: number;
}

export function perceptronPredict(inputs: number[], weights: number[], bias: number): number {
  const sum = inputs.reduce((acc, val, idx) => acc + val * weights[idx], 0) + bias;
  return sum >= 0 ? 1 : 0;
}

// Простое обучение перцептрона (градиентный спуск)
export function trainPerceptron(
  state: PerceptronState,
  trainingData: { inputs: number[]; label: number }[],
  epochs: number = 100
): PerceptronState {
  let { weights, bias, learningRate } = state;
  
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const { inputs, label } of trainingData) {
      const prediction = perceptronPredict(inputs, weights, bias);
      const error = label - prediction;
      
      if (error !== 0) {
        weights = weights.map((w, idx) => w + learningRate * error * inputs[idx]);
        bias += learningRate * error;
      }
    }
  }

  return { weights, bias, learningRate };
}

// ========== РАСПОЗНАВАНИЕ ЦИФР ==========
// Простые шаблоны для цифр 0 и 1 (5x5 сетка)
const DIGIT_TEMPLATES: Record<string, number[][]> = {
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
};

export function recognizeDigit(image: number[][]): { digit: string; confidence: number } {
  const predictions: Record<string, number> = {};
  
  for (const [digit, template] of Object.entries(DIGIT_TEMPLATES)) {
    let similarity = 0;
    let totalPixels = 0;
    
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const imgVal = image[y][x] > 128 ? 1 : 0;
        const tmplVal = template[y][x];
        if (imgVal === tmplVal) similarity++;
        totalPixels++;
      }
    }
    
    predictions[digit] = similarity / totalPixels;
  }

  const bestDigit = Object.entries(predictions).reduce((a, b) => 
    a[1] > b[1] ? a : b
  );

  return {
    digit: bestDigit[0],
    confidence: Math.round(bestDigit[1] * 100),
  };
}