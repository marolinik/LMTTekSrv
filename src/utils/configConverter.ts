import { Configuration } from '@/components/Configurator';
import { ServerSpec } from '@/types/ai.types';

export function configurationToServerSpecs(config: Configuration): ServerSpec[] {
  return [
    {
      category: 'Case',
      items: [
        { feature: 'Model No.', value: 'LM TEK - 4U8G' },
        { feature: 'Chassis Form Factor', value: '4U' },
        { feature: 'Motherboard', value: config.motherboard.model },
        { feature: 'Expansion Slot', value: 'Standard PCI Expansion Slots x8' },
        {
          feature: 'Front I/O Port',
          value: ['USB-A x 2', 'Power Button', 'Reset Button', '+Motherboard I/O'],
        },
        { feature: 'Indicators', value: 'Power/Reset LED x 1: White' },
        {
          feature: 'Dimensions',
          value: '435mm (W) x 176mm (H) x 800mm (D) / 17.13" (W) x 6.93" (H) x 31.49" (D)',
        },
      ],
    },
    {
      category: 'Cooling',
      items: [
        { feature: 'System', value: config.cooling.model },
        { feature: 'Pump', value: '2x D5' },
        { feature: 'Radiators', value: 'EK-Pro Monolith 360 mm' },
        { feature: 'Tubes', value: 'EK ZMT 10/16' },
        { feature: 'Fans', value: '6x 120 mm' },
        { feature: 'Manifold', value: '8x GPU, 2x CPU' },
        { feature: 'CPU Cooling', value: 'EK-Pro CPU WB SP5' },
      ],
    },
    {
      category: 'Power Supply',
      items: [
        { feature: 'Model', value: config.power.model },
        { feature: 'Type', value: 'CRPS 4+1' },
        { feature: 'Output Power (W)', value: `${config.power.capacity}W Total Capacity` },
      ],
    },
    {
      category: 'RAM',
      items: [
        { feature: 'Capacity', value: `${config.ram.capacity}GB` },
        { feature: 'Max Capacity', value: 'Up To 2048GB' },
        { feature: 'Type', value: 'DDR5 ECC R-DIMM' },
      ],
    },
    {
      category: 'CPU',
      items: [
        { feature: 'Model', value: config.cpu.model },
        { feature: 'Cores', value: `${config.cpu.cores} Cores` },
        { feature: 'Support', value: '1 or 2 CPU Supported' },
        { feature: 'AMD Models', value: ['EPYC Series 9004', 'EPYC Series 9005'] },
      ],
    },
    {
      category: 'GPU',
      items: [
        { feature: 'Model', value: config.gpu.model },
        { feature: 'Quantity', value: `${config.gpu.quantity}x GPUs` },
        { feature: 'Support', value: 'Up to 8 GPUs Supported' },
        {
          feature: 'Compatible Models',
          value: [
            'NVIDIA RTX A5000',
            'NVIDIA RTX A5500',
            'NVIDIA RTX A6000',
            'NVIDIA RTX 6000 Ada',
            'NVIDIA A100 80GB',
            'NVIDIA A100',
            'NVIDIA H100 NVL',
            'NVIDIA H100',
            'NVIDIA H200 NVL',
            'NVIDIA PRO 6000 Blackwell Server Edition',
            'Geforce RTX 5090',
          ],
        },
      ],
    },
    {
      category: 'Storage',
      items: [
        { feature: 'OS Drive', value: config.storage.os },
        { feature: 'Data Drives', value: config.storage.data.filter((d) => d !== 'NO STORAGE') },
      ],
    },
    {
      category: 'Network',
      items: [
        { feature: 'Model', value: config.network.model },
        { feature: 'Type', value: 'Integrated 10G LAN' },
      ],
    },
  ];
}

export function getConfigurationSummary(config: Configuration): string {
  return `
**Current Server Configuration:**
- **GPU:** ${config.gpu.quantity}x ${config.gpu.model}
- **CPU:** ${config.cpu.model} (${config.cpu.cores} Cores)
- **RAM:** ${config.ram.capacity}GB DDR5 ECC
- **Storage:** ${config.storage.os}${config.storage.data.filter((d) => d !== 'NO STORAGE').length > 0 ? ` + ${config.storage.data.filter((d) => d !== 'NO STORAGE').length} data drives` : ''}
- **Power:** ${config.power.model} (${config.power.capacity}W)
- **Cooling:** ${config.cooling.model}
- **Network:** ${config.network.model}
- **Total Price:** $${(
    config.gpu.price +
    config.cpu.price +
    config.ram.price +
    config.storage.price +
    config.power.price +
    config.network.price +
    config.motherboard.price +
    config.cooling.price
  ).toLocaleString()}
  `.trim();
}
