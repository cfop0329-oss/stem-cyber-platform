'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Wifi, WifiOff, Server, Router, Monitor, Zap, AlertTriangle } from 'lucide-react';

interface NetworkNode {
  id: string;
  type: 'client' | 'router' | 'server';
  x: number;
  y: number;
  label: string;
  bufferCapacity: number;
  processingRate: number;
  buffer: string[];
}

interface Link {
  id: string;
  from: string;
  to: string;
  broken: boolean;
}

interface Packet {
  id: string;
  path: string[];
  progress: number;
  speed: number;
  status: 'flying' | 'dropped' | 'delivered';
  waitingInBuffer: boolean;
  dropFlash?: number;
}

interface Metrics {
  sent: number;
  delivered: number;
  dropped: number;
  avgPing: number;
}

const INITIAL_NODES: NetworkNode[] = [
  { id: 'client', type: 'client', x: 150, y: 300, label: 'CLIENT', bufferCapacity: 0, processingRate: 0, buffer: [] },
  { id: 'r1', type: 'router', x: 500, y: 150, label: 'Router 1', bufferCapacity: 8, processingRate: 3, buffer: [] },
  { id: 'r2', type: 'router', x: 500, y: 300, label: 'Router 2', bufferCapacity: 8, processingRate: 3, buffer: [] },
  { id: 'r3', type: 'router', x: 500, y: 450, label: 'Router 3', bufferCapacity: 8, processingRate: 3, buffer: [] },
  { id: 'server', type: 'server', x: 850, y: 300, label: 'SERVER', bufferCapacity: 0, processingRate: 0, buffer: [] },
];

const INITIAL_LINKS: Link[] = [
  { id: 'l1', from: 'client', to: 'r1', broken: false },
  { id: 'l2', from: 'client', to: 'r2', broken: false },
  { id: 'l3', from: 'client', to: 'r3', broken: false },
  { id: 'l4', from: 'r1', to: 'server', broken: false },
  { id: 'l5', from: 'r2', to: 'server', broken: false },
  { id: 'l6', from: 'r3', to: 'server', broken: false },
];

function findPath(nodes: NetworkNode[], links: Link[], from: string, to: string): string[] | null {
  const queue: string[][] = [[from]];
  const visited = new Set<string>([from]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === to) return path;

    const neighbors = links
      .filter(l => !l.broken && (l.from === current || l.to === current))
      .map(l => l.from === current ? l.to : l.from);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

export default function NetworkWorkspace() {
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [links, setLinks] = useState<Link[]>(INITIAL_LINKS);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ sent: 0, delivered: 0, dropped: 0, avgPing: 0 });
  const [loadRate, setLoadRate] = useState(2);
  const [routerRate, setRouterRate] = useState(3);
  const [isRunning, setIsRunning] = useState(true);
  const [breakingLink, setBreakingLink] = useState(false);
  const [linkTraffic, setLinkTraffic] = useState<Record<string, number>>({}); // пакетов на связи

  const packetsRef = useRef<Packet[]>([]);
  const nodesRef = useRef<NetworkNode[]>(nodes);
  const linksRef = useRef<Link[]>(links);
  const lastTimeRef = useRef<number>(performance.now());
  const lastSpawnRef = useRef<number>(0);
  const pingTimesRef = useRef<Map<string, number>>(new Map());
  const metricsRef = useRef<Metrics>(metrics);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { linksRef.current = links; }, [links]);
  useEffect(() => { packetsRef.current = packets; }, [packets]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  useEffect(() => {
    setNodes(prev => prev.map(n =>
      n.type === 'router' ? { ...n, processingRate: routerRate } : n
    ));
  }, [routerRate]);

  useEffect(() => {
    if (!isRunning) return;

    let rafId: number;
    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const currentPackets = packetsRef.current.map(p => ({ ...p }));
      const currentNodes = nodesRef.current.map(n => ({ ...n, buffer: [...n.buffer] }));
      const currentLinks = linksRef.current;
      let newMetrics = { ...metricsRef.current };
      const newPingTimes = new Map(pingTimesRef.current);
      const newLinkTraffic: Record<string, number> = {};

      // 1. СПАВН пакетов
      lastSpawnRef.current += dt;
      const spawnInterval = 1 / loadRate;
      while (lastSpawnRef.current >= spawnInterval) {
        lastSpawnRef.current -= spawnInterval;
        const path = findPath(currentNodes, currentLinks, 'client', 'server');
        if (path) {
          const pkt: Packet = {
            id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            path,
            progress: 0,
            speed: 2,
            status: 'flying',
            waitingInBuffer: false,
          };
          currentPackets.push(pkt);
          newPingTimes.set(pkt.id, now);
          newMetrics.sent++;
        }
      }

      // 2. ДВИЖЕНИЕ пакетов + подсчёт трафика на связях
      for (const pkt of currentPackets) {
        if (pkt.status !== 'flying' || pkt.waitingInBuffer) continue;

        pkt.progress += pkt.speed * dt;

        const nextNodeIdx = Math.ceil(pkt.progress);
        
        if (nextNodeIdx >= pkt.path.length - 1) {
          pkt.status = 'delivered';
          pkt.progress = pkt.path.length - 1;
          newMetrics.delivered++;
          const ping = now - (newPingTimes.get(pkt.id) || now);
          newMetrics.avgPing = Math.round(
            (newMetrics.avgPing * (newMetrics.delivered - 1) + ping) / newMetrics.delivered
          );
          newPingTimes.delete(pkt.id);
        } else {
          const arrivedNodeId = pkt.path[nextNodeIdx];
          const node = currentNodes.find(n => n.id === arrivedNodeId);
          if (node && node.type === 'router') {
            if (node.buffer.length < node.bufferCapacity) {
              node.buffer.push(pkt.id);
              pkt.waitingInBuffer = true;
              pkt.progress = nextNodeIdx;
            } else {
              pkt.status = 'dropped';
              pkt.dropFlash = 0.4;
              newMetrics.dropped++;
              newPingTimes.delete(pkt.id);
            }
          }
        }

        // Подсчёт трафика на текущей связи
        const segmentIdx = Math.floor(pkt.progress);
        const fromId = pkt.path[segmentIdx];
        const toId = pkt.path[Math.min(segmentIdx + 1, pkt.path.length - 1)];
        const linkId = currentLinks.find(l => 
          (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId)
        )?.id;
        if (linkId) {
          newLinkTraffic[linkId] = (newLinkTraffic[linkId] || 0) + 1;
        }
      }

      // 3. ОБРАБОТКА буферов роутеров
      for (const node of currentNodes) {
        if (node.type !== 'router' || node.buffer.length === 0) continue;

        const processAmount = node.processingRate * dt;
        const acc = (node as any)._acc || 0;
        const toProcess = Math.min(Math.floor(processAmount + acc), node.buffer.length);
        (node as any)._acc = (processAmount + acc) - toProcess;

        for (let i = 0; i < toProcess; i++) {
          const pktId = node.buffer.shift()!;
          const pkt = currentPackets.find(p => p.id === pktId);
          if (pkt && pkt.status === 'flying' && pkt.waitingInBuffer) {
            pkt.waitingInBuffer = false;
            pkt.progress = Math.ceil(pkt.progress) + 0.01;
          }
        }
      }

      // 4. УДАЛЕНИЕ завершённых пакетов
      const cleanedPackets = currentPackets.filter(pkt => {
        if (pkt.status === 'delivered') return false;
        if (pkt.status === 'dropped') {
          pkt.dropFlash = (pkt.dropFlash || 0) - dt;
          return (pkt.dropFlash || 0) > 0;
        }
        return true;
      });

      packetsRef.current = cleanedPackets;
      setPackets([...cleanedPackets]);
      setNodes([...currentNodes]);
      setMetrics(newMetrics);
      setLinkTraffic(newLinkTraffic);
      pingTimesRef.current = newPingTimes;

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, loadRate, routerRate]);

  const resetNetwork = useCallback(() => {
    setNodes(INITIAL_NODES.map(n => ({ ...n, buffer: [] })));
    setLinks(INITIAL_LINKS.map(l => ({ ...l, broken: false })));
    setPackets([]);
    setMetrics({ sent: 0, delivered: 0, dropped: 0, avgPing: 0 });
    setLinkTraffic({});
    packetsRef.current = [];
    pingTimesRef.current = new Map();
    lastSpawnRef.current = 0;
  }, []);

  const toggleLink = (linkId: string) => {
    setLinks(prev => prev.map(l =>
      l.id === linkId ? { ...l, broken: !l.broken } : l
    ));
  };

  const getLinkCoords = (link: Link) => {
    const fromNode = nodes.find(n => n.id === link.from);
    const toNode = nodes.find(n => n.id === link.to);
    if (!fromNode || !toNode) return null;
    return { x1: fromNode.x, y1: fromNode.y, x2: toNode.x, y2: toNode.y };
  };

  const getPacketPosition = (pkt: Packet) => {
    const segmentIdx = Math.floor(pkt.progress);
    const t = pkt.progress - segmentIdx;
    const fromId = pkt.path[segmentIdx];
    const toId = pkt.path[Math.min(segmentIdx + 1, pkt.path.length - 1)];
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    if (!fromNode || !toNode) return { x: 0, y: 0 };
    return {
      x: fromNode.x + (toNode.x - fromNode.x) * t,
      y: fromNode.y + (toNode.y - fromNode.y) * t,
    };
  };

  // Получить цвет связи в зависимости от нагрузки
  const getLinkColor = (linkId: string, broken: boolean) => {
    if (broken) return '#EF4444';
    const traffic = linkTraffic[linkId] || 0;
    if (traffic === 0) return '#1E2532';
    if (traffic < 3) return '#00FF9D'; // зелёный
    if (traffic < 6) return '#00F0FF'; // циан
    if (traffic < 10) return '#F59E0B'; // оранжевый
    return '#EF4444'; // красный (перегрузка)
  };

  const getLinkWidth = (linkId: string, broken: boolean) => {
    if (broken) return 2;
    const traffic = linkTraffic[linkId] || 0;
    return Math.min(2 + traffic * 0.5, 8);
  };

  const dropRate = metrics.sent > 0 ? ((metrics.dropped / metrics.sent) * 100).toFixed(1) : '0.0';
  const deliveryRate = metrics.sent > 0 ? ((metrics.delivered / metrics.sent) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-bg">
      <aside className="w-80 border-r border-gray-800 bg-cyber-panel flex flex-col z-10 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold font-mono neon-text mb-6 flex items-center gap-2">
          <Wifi className="w-6 h-6" />
          NETWORK LAB
        </h2>

        <div className="mb-6">
          <label className="text-xs font-mono text-gray-400 mb-2 block flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyan-400" />
            НАГРУЗКА КЛИЕНТА: {loadRate} пак/с
          </label>
          <input
            type="range" min="0.5" max="10" step="0.5"
            value={loadRate}
            onChange={(e) => setLoadRate(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div className="mb-6">
          <label className="text-xs font-mono text-gray-400 mb-2 block flex items-center gap-2">
            <Router className="w-3 h-3 text-purple-400" />
            ПРОПУСКНАЯ СПОСОБНОСТЬ: {routerRate} пак/с
          </label>
          <input
            type="range" min="1" max="10" step="0.5"
            value={routerRate}
            onChange={(e) => setRouterRate(Number(e.target.value))}
            className="w-full accent-purple-400"
          />
        </div>

        <div className="space-y-2 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-full py-3 rounded-lg font-bold font-mono transition-all ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
          >
            {isRunning ? '⏸ ПАУЗА' : '▶ ЗАПУСТИТЬ'}
          </button>
          <button
            onClick={() => setBreakingLink(!breakingLink)}
            className={`w-full py-3 rounded-lg font-bold font-mono transition-all border ${
              breakingLink
                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400'
            }`}
          >
            <WifiOff className="w-4 h-4 inline mr-2" />
            {breakingLink ? 'КЛИКНИ НА СВЯЗЬ' : 'ОБОРВАТЬ КАБЕЛЬ'}
          </button>
          <button
            onClick={resetNetwork}
            className="w-full py-2 rounded-lg border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 font-mono text-sm transition-all"
          >
            СБРОСИТЬ СЕТЬ
          </button>
        </div>

        <div className="mt-auto space-y-3 p-4 rounded-lg bg-gray-900 border border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-gray-400">Отправлено:</span>
            <span className="text-sm font-mono font-bold text-cyan-400 ml-auto">{metrics.sent}</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400">Доставлено:</span>
            <span className="text-sm font-mono font-bold text-green-400 ml-auto">{metrics.delivered}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-mono text-gray-400">Потеряно:</span>
            <span className="text-sm font-mono font-bold text-red-400 ml-auto">{metrics.dropped}</span>
          </div>
          <div className="pt-2 border-t border-gray-700">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Доставка:</span>
              <span className="text-green-400 font-bold">{deliveryRate}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono mt-1">
              <span className="text-gray-400">Потери:</span>
              <span className="text-red-400 font-bold">{dropRate}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono mt-1">
              <span className="text-gray-400">Ср. пинг:</span>
              <span className="text-cyan-400 font-bold">{metrics.avgPing}мс</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          💡 <b>ЭКСПЕРИМЕНТ:</b> Увеличь нагрузку до 8 пак/с и понизь пропускную способность роутеров до 2. Наблюдай, как буферы переполняются и пакеты начинают дропаться!
        </div>
      </aside>

      <main className="flex-1 relative cyber-grid-bg">
        <div className="absolute top-4 left-4 z-20 bg-cyber-panel/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono text-gray-300">
          <span className="text-cyan-400 font-bold">ТОПОЛОГИЯ:</span> Client → 3 Routers → Server
        </div>

        {/* НОДЫ (z-index: 10) */}
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: node.x, top: node.y }}
          >
            <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 min-w-[140px] transition-all ${
              node.type === 'client'
                ? 'bg-cyber-panel border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : node.type === 'server'
                ? 'bg-cyber-panel border-green-500 shadow-[0_0_20px_rgba(0,255,157,0.3)]'
                : 'bg-cyber-panel border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            }`}>
              {node.type === 'client' && <Monitor className="w-8 h-8 text-cyan-400 mb-1" />}
              {node.type === 'router' && <Router className="w-8 h-8 text-purple-400 mb-1" />}
              {node.type === 'server' && <Server className="w-8 h-8 text-green-400 mb-1" />}
              <div className="text-xs font-mono font-bold text-white">{node.label}</div>

              {node.type === 'router' && (
                <div className="mt-2 w-full max-w-[120px]">
                  <div className="text-[10px] font-mono text-gray-400 mb-1 text-center truncate">
                    BUFFER: {node.buffer.length}/{node.bufferCapacity}
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        node.buffer.length / node.bufferCapacity > 0.8
                          ? 'bg-red-500 shadow-[0_0_8px_#EF4444]'
                          : node.buffer.length / node.bufferCapacity > 0.5
                          ? 'bg-yellow-500'
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${(node.buffer.length / node.bufferCapacity) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center min-h-[6px] max-h-[20px] overflow-hidden">
                    {node.buffer.slice(0, 8).map(pktId => (
                      <div key={pktId} className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_4px_#A855F7]" />
                    ))}
                    {node.buffer.length > 8 && (
                      <div className="text-[8px] font-mono text-purple-400">+{node.buffer.length - 8}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* SVG СЛОЙ СВЯЗЕЙ (z-index: 15 — ПОВЕРХ НОД) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {links.map(link => {
            const coords = getLinkCoords(link);
            if (!coords) return null;
            const color = getLinkColor(link.id, link.broken);
            const width = getLinkWidth(link.id, link.broken);
            const traffic = linkTraffic[link.id] || 0;
            return (
              <g key={link.id}>
                {/* Фоновая линия (тонкая) */}
                <line
                  x1={coords.x1} y1={coords.y1}
                  x2={coords.x2} y2={coords.y2}
                  stroke="#1E2532"
                  strokeWidth={1}
                  opacity={0.5}
                />
                {/* Основная линия с загрузкой */}
                <line
                  x1={coords.x1} y1={coords.y1}
                  x2={coords.x2} y2={coords.y2}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={link.broken ? '8,4' : 'none'}
                  opacity={link.broken ? 0.5 : 0.9}
                  filter={traffic > 0 && !link.broken ? 'url(#glow)' : 'none'}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Анимированные бегущие пакеты по связи */}
                {!link.broken && traffic > 0 && (
                  <line
                    x1={coords.x1} y1={coords.y1}
                    x2={coords.x2} y2={coords.y2}
                    stroke={color}
                    strokeWidth={width + 2}
                    strokeDasharray="4,12"
                    opacity={0.8}
                    style={{
                      animation: `dash 1s linear infinite`,
                      animationDuration: `${Math.max(0.3, 2 - traffic * 0.15)}s`,
                    }}
                  />
                )}
                {/* Невидимая широкая линия для клика */}
                <line
                  x1={coords.x1} y1={coords.y1}
                  x2={coords.x2} y2={coords.y2}
                  stroke="transparent"
                  strokeWidth={20}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => breakingLink && toggleLink(link.id)}
                />
                {/* Подпись нагрузки на связи */}
                {traffic > 0 && !link.broken && (
                  <text
                    x={(coords.x1 + coords.x2) / 2}
                    y={(coords.y1 + coords.y2) / 2 - 10}
                    fill={color}
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }}
                  >
                    {traffic} пак/с
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* ЛЕТЯЩИЕ ПАКЕТЫ (z-index: 20) */}
        {packets.map(pkt => {
          const pos = getPacketPosition(pkt);
          if (pkt.status === 'dropped') {
            return (
              <div
                key={pkt.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                style={{ left: pos.x, top: pos.y }}
              >
                <div
                  className="w-4 h-4 rounded-full bg-red-500 animate-ping"
                  style={{ boxShadow: '0 0 20px #EF4444, 0 0 40px #EF4444' }}
                />
              </div>
            );
          }
          return (
            <div
              key={pkt.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{ left: pos.x, top: pos.y }}
            >
              <div
                className="w-3 h-3 rounded-full bg-cyan-400"
                style={{ boxShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF' }}
              />
            </div>
          );
        })}

        {metrics.dropped > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-red-500/20 border border-red-500 rounded-lg px-4 py-2 font-mono text-red-400 text-sm animate-pulse">
            ⚠ ОБНАРУЖЕНЫ ПОТЕРИ ПАКЕТОВ — ПЕРЕГРУЗКА СЕТИ
          </div>
        )}

        {/* CSS анимация для бегущих пакетов */}
        <style jsx>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -32;
            }
          }
        `}</style>
      </main>
    </div>
  );
}