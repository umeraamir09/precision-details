export type ServiceOption = { id: string; name: string; price: number; group: string; desc?: string };

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'ext-only', name: 'Exterior Only', price: 60, group: 'Exterior' },
  { id: 'int-only', name: 'Interior Only', price: 95, group: 'Interior' },
  { id: 'upholstery-deep-clean', name: 'Upholstery Deep Clean', price: 150, group: 'Interior' },
  { id: 'wax', name: 'Paint Protection Wax', price: 50, group: 'Exterior' },
  { id: 'engine-bay', name: 'Engine Bay Clean', price: 38, group: 'Exterior' },
];

export const SERVICE_OPTION_MAP = Object.fromEntries(SERVICE_OPTIONS.map(o => [o.id, o] as const));

export function describeServiceIds(ids: string[]): { lines: string[]; total: number } {
  const lines: string[] = [];
  let total = 0;
  for (const id of ids) {
    const opt = SERVICE_OPTION_MAP[id];
    if (opt) {
      lines.push(`${opt.name} - $${opt.price}`);
      total += opt.price;
    }
  }
  return { lines, total };
}
