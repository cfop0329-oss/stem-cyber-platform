// src/engine/types/index.ts

// Базовый интерфейс для любого компонента в системе
export interface BaseComponent {
  id: string;
  type: string; // 'AND_GATE', 'ROUTER', 'ARRAY_CELL'
  position: { x: number; y: number };
  properties: Record<string, any>;
}

// Базовый интерфейс для связи между компонентами
export interface BaseConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePin: string;
  targetPin: string;
}

// Результат симуляции
export interface SimulationResult {
  isSuccess: boolean;
  metrics: {
    timeMs: number;
    memoryUsed: number;
    errors: string[];
  };
}