# Power Supply (PSU) Reference Guide

## Quick Reference

### PSU Auto-Selection Rules

| GPU Count | GPU Power | Required PSU | Total Capacity | Price | Component Name |
|-----------|-----------|--------------|----------------|-------|----------------|
| 1 GPU | 650W | 2x PSU | 4000W | €477.80 | 2x PSU (4000W) |
| 2 GPUs | 1300W | 2x PSU | 4000W | €477.80 | 2x PSU (4000W) |
| 3 GPUs | 1950W | 3x PSU | 6000W | €716.70 | 3x PSU (6000W) |
| 4 GPUs | 2600W | 3x PSU | 6000W | €716.70 | 3x PSU (6000W) |
| 5 GPUs | 3250W | 4x PSU | 8000W | €955.60 | 4x PSU (8000W) |
| 6 GPUs | 3900W | 4x PSU | 8000W | €955.60 | 4x PSU (8000W) |
| 7 GPUs | 4550W | 5x PSU | 10000W | €1,194.50 | 5x PSU (10000W) |
| 8 GPUs | 5200W | 5x PSU | 10000W | €1,194.50 | 5x PSU (10000W) |

---

## Technical Specifications

### PSU Unit Specifications
- **Model:** GW-CROS2000C3 Titanium
- **Power per Unit:** 2000W
- **Efficiency:** 80 Plus Titanium (92% efficiency)
- **Form Factor:** Mini-redundant 3U
- **Features:** Active PFC, modular cables
- **Unit Price:** €238.90

### Power Calculations
```
GPU Power Requirement = GPU Count × 650W
Total PSU Capacity = PSU Count × 2000W
Total PSU Price = PSU Count × €238.90
```

### Redundancy Strategy
- **2x PSU:** 1+1 redundancy (one active, one backup)
- **3x PSU:** 2+1 redundancy (two active, one backup)
- **4x PSU:** 3+1 or 2+2 redundancy
- **5x PSU:** 4+1 redundancy (four active, one backup)

---

## Implementation Details

### Code Locations

#### Frontend
**Validation Logic:** `src/utils/psuValidation.ts`
```typescript
export const getMinimumPSUCount = (gpuCount: number): number => {
  if (gpuCount <= 2) return 2;
  if (gpuCount <= 4) return 3;
  if (gpuCount <= 6) return 4;
  return 5; // 7-8 GPUs
};
```

**Auto-Selection:** `src/components/Configurator.tsx` (lines 137-156)
```typescript
useEffect(() => {
  const minimumPSU = getMinimumPSUCount(config.gpu.quantity);
  const requiredPSU = components.power.find(p =>
    (p.metadata?.psuCount || 0) === minimumPSU
  );

  if (requiredPSU) {
    setConfig((prev) => ({
      ...prev,
      power: {
        model: requiredPSU.name,
        capacity: requiredPSU.metadata?.capacity || 0,
        quantity: minimumPSU,
        price: requiredPSU.listPrice,
      },
    }));
  }
}, [config.gpu.quantity, components.power]);
```

**UI Display:** `src/components/ConfigSection.tsx` (lines 356-421)
- Shows auto-selected PSU configuration
- Displays informative message
- No manual selection possible

#### Backend
**Database Schema:** `server/prisma/schema.prisma`
```prisma
model Component {
  metadata    Json?  // { capacity: number, psuCount: number }
}
```

**Seed Data:** `server/prisma/seed.ts` (lines 124-159)
```typescript
const powerOptions = [
  { name: '2x PSU (4000W)', spec: '...', price: 477.80, capacity: 4000, psuCount: 2 },
  { name: '3x PSU (6000W)', spec: '...', price: 716.70, capacity: 6000, psuCount: 3 },
  { name: '4x PSU (8000W)', spec: '...', price: 955.60, capacity: 8000, psuCount: 4 },
  { name: '5x PSU (10000W)', spec: '...', price: 1194.50, capacity: 10000, psuCount: 5 },
];
```

---

## User Experience Flow

### 1. User Selects GPU Quantity
```
User action: Selects 5 GPUs from configurator
```

### 2. System Calculates Power Requirement
```
GPU Power = 5 × 650W = 3250W
Minimum PSU Count = 4 (from validation logic)
```

### 3. System Auto-Selects PSU Configuration
```
Component: 4x PSU (8000W)
Total Capacity: 4 × 2000W = 8000W
Total Price: €955.60
Status: Auto-selected
```

### 4. User Sees Updated Configuration
```
Power Supply Section:
┌──────────────────────────────────────────┐
│ Power Supply                      €955.60│
│ 4x PSU (8000W) • 8000W                   │
├──────────────────────────────────────────┤
│ ℹ PSU automatically matched to 5 GPUs   │
│                                           │
│ [4x PSU (8000W)]                         │
│ 4x 2000W PSU, 8000W total capacity       │
│ for 5-6 GPUs                      €955.60│
│                                           │
│ ℹ️ Power supply configuration is         │
│ automatically determined based on        │
│ your GPU selection for optimal           │
│ performance and redundancy.              │
└──────────────────────────────────────────┘
```

---

## Database Structure

### Component Table (POWER category)
```sql
SELECT id, name, "listPrice", metadata
FROM "Component"
WHERE category = 'POWER' AND "isActive" = true;
```

**Result:**
| id | name | listPrice | metadata |
|----|------|-----------|----------|
| power-2x-psu-4000w | 2x PSU (4000W) | 477.80 | {"capacity": 4000, "psuCount": 2} |
| power-3x-psu-6000w | 3x PSU (6000W) | 716.70 | {"capacity": 6000, "psuCount": 3} |
| power-4x-psu-8000w | 4x PSU (8000W) | 955.60 | {"capacity": 8000, "psuCount": 4} |
| power-5x-psu-10000w | 5x PSU (10000W) | 1194.50 | {"capacity": 10000, "psuCount": 5} |

---

## API Endpoints

### Get PSU Components
```bash
GET /api/components/category/POWER
```

**Response:**
```json
{
  "components": [
    {
      "id": "power-2x-psu-4000w",
      "category": "POWER",
      "name": "2x PSU (4000W)",
      "spec": "2x 2000W PSU, 4000W total capacity for 1-2 GPUs",
      "listPrice": 477.80,
      "metadata": {
        "capacity": 4000,
        "psuCount": 2
      },
      "isActive": true
    }
  ]
}
```

---

## Troubleshooting

### PSU Not Auto-Selecting
1. Check if components are loaded: `components.power.length > 0`
2. Verify GPU quantity is set: `config.gpu.quantity`
3. Check validation logic: `getMinimumPSUCount(gpuCount)`
4. Verify component metadata has `psuCount` field

### Wrong PSU Selected
1. Verify database has correct PSU components
2. Check metadata: `psuCount` matches expected value
3. Review validation logic in `psuValidation.ts`
4. Check Configurator useEffect dependencies

### Pricing Incorrect
1. Verify `listPrice` in database matches total price (not per unit)
2. Check: 2x PSU = €477.80 (not €238.90)
3. Database should store total price for configuration

### Manual Selection Still Showing
1. Verify ConfigSection.tsx has been updated
2. Check that quantity selector buttons are removed
3. Ensure frontend container is rebuilt after changes
4. Clear browser cache if necessary

---

## Testing Checklist

- [ ] Test PSU selection for 1 GPU → 2x PSU (€477.80)
- [ ] Test PSU selection for 2 GPUs → 2x PSU (€477.80)
- [ ] Test PSU selection for 3 GPUs → 3x PSU (€716.70)
- [ ] Test PSU selection for 4 GPUs → 3x PSU (€716.70)
- [ ] Test PSU selection for 5 GPUs → 4x PSU (€955.60)
- [ ] Test PSU selection for 6 GPUs → 4x PSU (€955.60)
- [ ] Test PSU selection for 7 GPUs → 5x PSU (€1,194.50)
- [ ] Test PSU selection for 8 GPUs → 5x PSU (€1,194.50)
- [ ] Verify pricing in quote summary
- [ ] Check PDF generation includes correct PSU info
- [ ] Test quote submission with various GPU counts
- [ ] Verify admin can see correct PSU data

---

## Maintenance Notes

### Adding New PSU Configuration
1. Update validation logic in `psuValidation.ts`
2. Add component to seed data in `seed.ts`
3. Update this reference document
4. Reseed database or add via API
5. Test all GPU count scenarios

### Changing PSU Pricing
1. Update `listPrice` in `seed.ts`
2. Update pricing table in this document
3. Reseed database or update via API
4. Test quote generation with new pricing

### Modifying Auto-Selection Logic
1. Update `getMinimumPSUCount()` in `psuValidation.ts`
2. Update mapping table in this document
3. Add/update test cases
4. Verify all GPU counts work correctly

---

**Last Updated:** 2025-10-29
**Version:** 1.1.0
**Status:** Production Ready ✅
