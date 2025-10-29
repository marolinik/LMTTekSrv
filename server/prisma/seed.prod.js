const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@lmtek.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@lmtek.com',
      password: adminPassword,
      name: process.env.ADMIN_NAME || 'System Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Seed GPU components
  const gpus = [
    { name: 'NVIDIA GeForce RTX 3090 32GB', spec: '32GB GDDR6X', price: 1500 },
    { name: 'NVIDIA RTX GeForce 4090 24GB', spec: '24GB GDDR6X', price: 2000 },
    { name: 'NVIDIA RTX PRO 6000 96GB', spec: '96GB GDDR6', price: 6000 },
    { name: 'NVIDIA RTX 6000 ADA 48GB', spec: '48GB GDDR6', price: 7000 },
    { name: 'NVIDIA L40S 48GB', spec: '48GB GDDR6', price: 8000 },
    { name: 'NVIDIA H200 141GB', spec: '141GB HBM3', price: 35000 },
    { name: 'NVIDIA H100 94GB', spec: '94GB HBM3', price: 30000 },
  ];

  for (const gpu of gpus) {
    await prisma.component.upsert({
      where: { id: `gpu-${gpu.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `gpu-${gpu.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'GPU',
        name: gpu.name,
        spec: gpu.spec,
        listPrice: gpu.price,
      },
    });
  }

  console.log('✅ GPU components seeded');

  // Seed CPU components
  const cpus = [
    { name: 'AMD EPYC 9004 / 9005', spec: '32 Cores', price: 8500, cores: 32 },
    { name: 'AMD EPYC 9004 / 9005', spec: '64 Cores', price: 12000, cores: 64 },
    { name: 'Intel Xeon Platinum', spec: '48 Cores', price: 10000, cores: 48 },
  ];

  for (const cpu of cpus) {
    await prisma.component.upsert({
      where: { id: `cpu-${cpu.spec.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `cpu-${cpu.spec.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'CPU',
        name: cpu.name,
        spec: cpu.spec,
        listPrice: cpu.price,
        metadata: { cores: cpu.cores },
      },
    });
  }

  console.log('✅ CPU components seeded');

  // Seed RAM components
  const ramOptions = [
    { capacity: 128, price: 1600 },
    { capacity: 256, price: 3200 },
    { capacity: 512, price: 6400 },
    { capacity: 1024, price: 12800 },
  ];

  for (const ram of ramOptions) {
    await prisma.component.upsert({
      where: { id: `ram-${ram.capacity}gb` },
      update: {},
      create: {
        id: `ram-${ram.capacity}gb`,
        category: 'RAM',
        name: `${ram.capacity}GB DDR5`,
        spec: `${ram.capacity}GB`,
        listPrice: ram.price,
        metadata: { capacity: ram.capacity },
      },
    });
  }

  console.log('✅ RAM components seeded');

  // Seed Storage components
  const storageOptions = [
    { name: '1TB NVMe', spec: '1TB NVMe SSD', price: 250 },
    { name: '2TB NVMe', spec: '2TB NVMe SSD', price: 450 },
    { name: '4TB NVMe', spec: '4TB NVMe SSD', price: 850 },
  ];

  for (const storage of storageOptions) {
    await prisma.component.upsert({
      where: { id: `storage-${storage.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `storage-${storage.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'STORAGE',
        name: storage.name,
        spec: storage.spec,
        listPrice: storage.price,
      },
    });
  }

  console.log('✅ Storage components seeded');

  // Seed Power Supply components
  const powerOptions = [
    { name: '1x PSU', spec: '2600W capacity', price: 900, capacity: 2600, psuCount: 1 },
    { name: '2x Redundant (1+1)', spec: '5200W capacity', price: 1800, capacity: 5200, psuCount: 2 },
    { name: '3x Redundant (2+1)', spec: '6500W capacity', price: 2300, capacity: 6500, psuCount: 3 },
    { name: '4x Redundant (3+1, 2+2)', spec: '8000W capacity', price: 2800, capacity: 8000, psuCount: 4 },
    { name: '5x Redundant (4+1)', spec: '10400W capacity', price: 3500, capacity: 10400, psuCount: 5 },
  ];

  for (const power of powerOptions) {
    await prisma.component.upsert({
      where: { id: `power-${power.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}` },
      update: {},
      create: {
        id: `power-${power.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`,
        category: 'POWER',
        name: power.name,
        spec: power.spec,
        listPrice: power.price,
        metadata: { capacity: power.capacity, psuCount: power.psuCount },
      },
    });
  }

  console.log('✅ Power Supply components seeded');

  // Seed Motherboard components
  const motherboards = [
    { name: 'LM TEK Server MB-8G', spec: '8x PCIe 5.0 GPU Slots, Dual Socket', price: 2500 },
    { name: 'LM TEK Server MB-4G', spec: '4x PCIe 5.0 GPU Slots, Single Socket', price: 1800 },
    { name: 'LM TEK Server MB-8G Pro', spec: '8x PCIe 5.0 GPU Slots, Dual Socket, Enhanced VRM', price: 3200 },
  ];

  for (const mb of motherboards) {
    await prisma.component.upsert({
      where: { id: `motherboard-${mb.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `motherboard-${mb.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'MOTHERBOARD',
        name: mb.name,
        spec: mb.spec,
        listPrice: mb.price,
      },
    });
  }

  console.log('✅ Motherboard components seeded');

  // Seed Cooling Loop components
  const coolingLoops = [
    { name: 'LM TEK Loop 1', spec: 'Single GPU Liquid Cooling', price: 800, gpuSupport: 1 },
    { name: 'LM TEK Loop 2', spec: 'Dual GPU Liquid Cooling', price: 1400, gpuSupport: 2 },
    { name: 'LM TEK Loop 3', spec: 'Triple GPU Liquid Cooling', price: 2000, gpuSupport: 3 },
    { name: 'LM TEK Loop 4', spec: 'Quad GPU Liquid Cooling', price: 2600, gpuSupport: 4 },
    { name: 'LM TEK Loop 5', spec: '5-GPU Liquid Cooling', price: 3200, gpuSupport: 5 },
    { name: 'LM TEK Loop 6', spec: '6-GPU Liquid Cooling', price: 3800, gpuSupport: 6 },
    { name: 'LM TEK Loop 7', spec: '7-GPU Liquid Cooling', price: 4400, gpuSupport: 7 },
    { name: 'LM TEK Loop 8', spec: '8-GPU Liquid Cooling', price: 5000, gpuSupport: 8 },
  ];

  for (const cooling of coolingLoops) {
    await prisma.component.upsert({
      where: { id: `cooling-${cooling.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `cooling-${cooling.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'COOLING',
        name: cooling.name,
        spec: cooling.spec,
        listPrice: cooling.price,
        metadata: { gpuSupport: cooling.gpuSupport },
      },
    });
  }

  console.log('✅ Cooling Loop components seeded');

  // Seed Network components
  const networkOptions = [
    { name: 'Integrated 2x 10G LAN', spec: 'Dual 10Gb Ethernet', price: 0 },
    { name: 'Integrated 2x 10G LAN + BMC', spec: 'Dual 10Gb + Management', price: 500 },
    { name: 'Mellanox 100G InfiniBand', spec: '100Gb InfiniBand', price: 2500 },
  ];

  for (const network of networkOptions) {
    await prisma.component.upsert({
      where: { id: `network-${network.name.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, '')}` },
      update: {},
      create: {
        id: `network-${network.name.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, '')}`,
        category: 'NETWORK',
        name: network.name,
        spec: network.spec,
        listPrice: network.price,
      },
    });
  }

  console.log('✅ Network components seeded');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
