import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map CSV categories to database enum values
const categoryMap: Record<string, string> = {
  'GPU': 'GPU',
  'CPU': 'CPU',
  'Memory': 'RAM',
  'Storage OS': 'STORAGE',
  'Storage Data': 'STORAGE',
  'Motherboard': 'MOTHERBOARD',
  'Network': 'NETWORK',
  'Chases': 'CHASSIS',
  'Power supply': 'POWER',
  'Cooling unit': 'COOLING',
  'R&D': 'RND',
  'Assembly': 'ASSEMBLY',
};

// Parse European number format (comma as decimal separator)
function parseEuropeanNumber(value: string): number {
  // Remove any thousands separators (dots) and replace comma with dot
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized);
}

async function importComponents() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '..', '..', 'Components database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Split by lines and skip header
    const lines = csvContent.split('\n').slice(1).filter(line => line.trim());

    console.log(`Processing ${lines.length} components...`);

    for (const line of lines) {
      // Split by semicolon
      const parts = line.split(';');

      if (parts.length < 4) {
        console.warn(`Skipping invalid line: ${line}`);
        continue;
      }

      const csvCategory = parts[0].trim();
      const name = parts[1].trim();
      const spec = parts[2].trim();
      const priceStr = parts[3].trim();

      // Map category
      const category = categoryMap[csvCategory];
      if (!category) {
        console.warn(`Unknown category: ${csvCategory} for component: ${name}`);
        continue;
      }

      // Parse price
      const listPrice = parseEuropeanNumber(priceStr);

      // Extract metadata based on category
      let metadata: any = {};

      // For cooling units, extract GPU support from the kit number
      if (category === 'COOLING') {
        const kitMatch = name.match(/kit (\d+)/i);
        if (kitMatch) {
          metadata.gpuSupport = parseInt(kitMatch[1]);
        }
      }

      // Insert component
      await prisma.component.create({
        data: {
          category,
          name,
          spec,
          listPrice,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          isActive: true,
        },
      });

      console.log(`✓ Imported: ${category} - ${name} (€${listPrice.toFixed(2)})`);
    }

    console.log('\n✅ Import completed successfully!');

    // Print summary
    const counts = await prisma.component.groupBy({
      by: ['category'],
      _count: true,
    });

    console.log('\nComponents by category:');
    for (const { category, _count } of counts) {
      console.log(`  ${category}: ${_count}`);
    }

  } catch (error) {
    console.error('❌ Error importing components:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importComponents();
