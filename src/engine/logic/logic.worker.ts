// src/engine/logic/logic.worker.ts

// Сообщения, которые воркер принимает от UI
type WorkerMessage = {
  type: 'INIT_CIRCUIT' | 'UPDATE_INPUT' | 'RUN_STEP';
  payload: any;
};

// Сообщения, которые воркер отправляет в UI
type WorkerResponse = {
  type: 'STATE_UPDATED' | 'ERROR';
  payload: any;
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT_CIRCUIT':
      // Здесь будет инициализация графа схемы
      console.log('Worker: Circuit initialized', payload);
      break;
      
    case 'UPDATE_INPUT':
      // Здесь пересчет булевой логики
      // const result = calculateLogic(payload);
      // self.postMessage({ type: 'STATE_UPDATED', payload: result });
      break;

    default:
      break;
  }
};

export {};