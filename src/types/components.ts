export type ComponentCategory = 'gpu' | 'cpu' | 'ram' | 'storage' | 'power' | 'network' | 'motherboard' | 'cooling' | 'chassis' | 'rnd' | 'assembly';

export interface Component {
  id: string;
  category: ComponentCategory;
  name: string;
  spec: string;
  listPrice: number;
  metadata?: {
    capacity?: number;
    cores?: number;
    quantity?: number;
    psuCount?: number; // Number of PSU units for power supplies
    gpuSupport?: number; // Number of GPUs supported (for cooling loops)
  };
}

export interface ComponentsByCategory {
  gpu: Component[];
  cpu: Component[];
  ram: Component[];
  storage: Component[];
  power: Component[];
  network: Component[];
  motherboard: Component[];
  cooling: Component[];
  chassis: Component[];
  rnd: Component[];
  assembly: Component[];
}
