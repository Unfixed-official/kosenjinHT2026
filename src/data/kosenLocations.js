export const KOSEN_LOCATIONS = [
  { id: 'hakodate', name: '函館高専', x: 0.88, y: 0.20 },
  { id: 'sendai', name: '仙台高専', x: 0.82, y: 0.32 },
  { id: 'tokyo', name: '東京高専', x: 0.76, y: 0.48 },
  { id: 'toyama', name: '富山高専', x: 0.61, y: 0.42 },
  { id: 'maizuru', name: '舞鶴高専', x: 0.52, y: 0.52 },
  { id: 'kagawa', name: '香川高専', x: 0.43, y: 0.60 },
  { id: 'kure', name: '呉高専', x: 0.35, y: 0.58 },
  { id: 'kumamoto', name: '熊本高専', x: 0.21, y: 0.69 },
  { id: 'okinawa', name: '沖縄高専', x: 0.08, y: 0.88 }
];

export const KOSEN_MAP = Object.fromEntries(KOSEN_LOCATIONS.map((item) => [item.id, item]));

export function getKosenById(kosenId) {
  return KOSEN_MAP[kosenId] || null;
}
