import { Node, Edge } from '@xyflow/react';

export interface NodeValues {
  [nodeId: string]: boolean;
}

export function simulateCircuit(nodes: Node[], edges: Edge[]): NodeValues {
  const values: NodeValues = {};
  
  // 1. Собираем карту входящих соединений для каждого узла
  const incomingEdgesMap: Record<string, Edge[]> = {};
  nodes.forEach(node => {
    incomingEdgesMap[node.id] = [];
  });
  edges.forEach(edge => {
    if (incomingEdgesMap[edge.target]) {
      incomingEdgesMap[edge.target].push(edge);
    }

  });

  // 2. Топологическая сортировка (BFS), чтобы считать узлы в правильном порядке
  // Начинаем с узлов, у которых нет входящих соединений (источники: тумблеры)
  const queue = nodes.filter(node => incomingEdgesMap[node.id].length === 0);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    
    if (visited.has(node.id)) continue;
    visited.add(node.id);

    // 3. Вычисляем значение узла
    if (node.type === 'toggle') {
      values[node.id] = node.data?.isOn ?? false;
    } 
    else if (node.type === 'and') {
      // AND: истинно, только если ВСЕ входы истинны
      const inputs = incomingEdgesMap[node.id];
      values[node.id] = inputs.length > 0 && inputs.every(edge => values[edge.source] === true);
    } 
    // Внутри функции simulateCircuit, после блока else if (node.type === 'and')

else if (node.type === 'or') {
  // OR: истинно, если ХОТЯ БЫ ОДИН вход истинный
  const inputs = incomingEdgesMap[node.id];
  values[node.id] = inputs.length > 0 && inputs.some(edge => values[edge.source] === true);
} 
else if (node.type === 'xor') {
  // XOR: истинно, если входы РАЗНЫЕ (ровно один истинный)
  const inputs = incomingEdgesMap[node.id];
  if (inputs.length === 0) {
    values[node.id] = false;
  } else if (inputs.length === 1) {
    values[node.id] = values[inputs[0].source] === true;
  } else {
    // Для двух входов: true если ровно один true
    const trueCount = inputs.filter(edge => values[edge.source] === true).length;
    values[node.id] = trueCount === 1;
  }
} 
else if (node.type === 'not') {
  // NOT: инвертирует вход
  const inputs = incomingEdgesMap[node.id];
  values[node.id] = inputs.length > 0 && values[inputs[0].source] !== true;
}
    else if (node.type === 'led') {
      // LED: просто принимает значение от источника
      const inputs = incomingEdgesMap[node.id];
      values[node.id] = inputs.length > 0 && values[inputs[0].source] === true;
    } 
    else {
      values[node.id] = false;
    }

    // 4. Добавляем дочерние узлы в очередь
    const outgoingEdges = edges.filter(edge => edge.source === node.id);
    outgoingEdges.forEach(edge => {
      if (!visited.has(edge.target)) {
        queue.push(nodes.find(n => n.id === edge.target)!);
      }
    });
  }

  return values;
}