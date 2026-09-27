export interface SortStep {
  array: number[];
  comparing: number[];   // индексы элементов, которые сравниваются
  swapping: number[];    // индексы элементов, которые меняются местами
  sorted: number[];      // уже отсортированные индексы
  description: string;
}

// Bubble Sort — генерирует пошаговые состояния
export function* bubbleSortGenerator(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: number[] = [];

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: 'Начало сортировки пузырьком',
  };

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        description: `Сравниваем ${array[j]} и ${array[j + 1]}`,
      };

      if (array[j] > array[j + 1]) {
        // Меняем местами
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield {
          array: [...array],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `${array[j + 1]} > ${array[j]} — меняем местами`,
        };
      }
    }
    sorted.push(n - i - 1);
  }
  sorted.push(0);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: 'Сортировка завершена!',
  };
}

// Selection Sort
export function* selectionSortGenerator(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: number[] = [];

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: 'Начало сортировки выбором',
  };

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield {
        array: [...array],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sorted],
        description: `Ищем минимум: сравниваем ${array[minIdx]} и ${array[j]}`,
      };

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        description: `Минимум ${array[i]} ставим на позицию ${i}`,
      };
    }
    sorted.push(i);
  }
  sorted.push(n - 1);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: 'Сортировка завершена!',
  };
}

// Quick Sort
export function* quickSortGenerator(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted: number[] = [];

  function* quickSort(low: number, high: number): Generator<SortStep> {
    if (low < high) {
      let pivot = array[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        yield {
          array: [...array],
          comparing: [j, high],
          swapping: [],
          sorted: [...sorted],
          description: `Сравниваем ${array[j]} с опорным ${pivot}`,
        };

        if (array[j] < pivot) {
          i++;
          [array[i], array[j]] = [array[j], array[i]];
          yield {
            array: [...array],
            comparing: [],
            swapping: [i, j],
            sorted: [...sorted],
            description: `${array[j]} < ${pivot} — меняем`,
          };
        }
      }
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      const pivotIdx = i + 1;
      sorted.push(pivotIdx);

      yield {
        array: [...array],
        comparing: [],
        swapping: [i + 1, high],
        sorted: [...sorted],
        description: `Опорный элемент ${pivot} на позиции ${pivotIdx}`,
      };

      yield* quickSort(low, pivotIdx - 1);
      yield* quickSort(pivotIdx + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: 'Начало быстрой сортировки',
  };

  yield* quickSort(0, array.length - 1);

  // Помечаем всё как отсортированное
  for (let i = 0; i < array.length; i++) sorted.push(i);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: 'Сортировка завершена!',
  };
}

export type AlgorithmName = 'bubble' | 'selection' | 'quick';

export function getAlgorithm(name: AlgorithmName) {
  switch (name) {
    case 'bubble': return { fn: bubbleSortGenerator, name: 'Bubble Sort', complexity: 'O(N²)' };
    case 'selection': return { fn: selectionSortGenerator, name: 'Selection Sort', complexity: 'O(N²)' };
    case 'quick': return { fn: quickSortGenerator, name: 'Quick Sort', complexity: 'O(N log N)' };
  }
}

export function generateRandomArray(size: number, max: number = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 10);
}