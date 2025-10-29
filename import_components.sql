-- Insert GPU components
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'GPU', 'Nvidia H200 NVL', 'Nvidia H200 NVL, SXM version, Hopper SXM6 connector, GPU with HBM3e 141GB, 1000W + cooling blower 300W, GPU memory bandwidth 4.8 TB/sec, NVLink 900 GB/sec, max 8 GPUs per system with full NVLink GPU to GPU communication', 23166.34, '{}', true, NOW(), NOW()),
  (gen_random_uuid(), 'GPU', 'Nvidia RTX 6000 Blackwell Server Edition', 'Nvidia RTX 6000 Blackwell Server Edition, Single slot design, 48GB GDDR6 memory, GPU memory bandwidth 864 GB/s, 21760 CUDA cores, 300W', 6880.00, '{}', true, NOW(), NOW()),
  (gen_random_uuid(), 'GPU', 'ZOTAC GAMING GeForce RTX® 5090', 'ZOTAC GAMING GeForce RTX® 5090 AMP Extreme AIRO, Graphics card with 3 slot design, 32 GB GDDR7, GPU memory bandwidth 1792 GB/s, 21760 CUDA cores, 575W', 2000.00, '{}', true, NOW(), NOW());

-- Insert CPU components
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'CPU', 'AMD EPYC 9355P (32 Cores, 280 W) for 2 GPU', 'AMD EPYC 9355P, 32 Cores, 64 threads, max boost up to 3.8 GHz, memory support for 12 channels DDR5 with up to 6000 MHz, processor TDP 280 W, L3 Cache 256 MB', 2093.24, '{"cores": 32}', true, NOW(), NOW()),
  (gen_random_uuid(), 'CPU', 'AMD EPYC 9755 (128 Cores, 500 W) for 4 GPU', 'AMD EPYC 9755, 128 Cores, 256 threads, max boost up to 4.1 GHz, memory support for 12 channels DDR5 with up to 6400 MHz, processor TDP 500 W, L3 Cache 512 MB', 11989.53, '{"cores": 128}', true, NOW(), NOW()),
  (gen_random_uuid(), 'CPU', 'Dual AMD EPYC 9755 (2x 128 Cores, 1000 W) for 8 GPU', 'Dual AMD EPYC 9755, 2x 128 Cores, 2x 256 threads, max boost up to 4.1 GHz, memory support for 24 channels DDR5 with up to 6400 MHz, processor TDP 2x 500 W, L3 Cache 2x 512 MB', 23979.06, '{"cores": 256}', true, NOW(), NOW());

-- Insert Memory component
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'RAM', 'Micron 64 GB DDR5 RDIMM server memory', 'Micron 64 GB DDR5 RDIMM server memory, 4800 MHz, CL40, 1.1V, Registered ECC memory', 264.88, '{"capacity": 64}', true, NOW(), NOW());

-- Insert Storage components
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'STORAGE', 'Micron 7450 PRO, 1.92 TB NVMe M.2', 'Micron 7450 PRO, 1.92 TB (1920 GB), NVMe M.2, PCIe Gen4 x4, 22 mm x 80 mm, read max 6600 MB/s, write max 4700 MB/s', 271.33, '{"capacity": 1920, "type": "OS"}', true, NOW(), NOW()),
  (gen_random_uuid(), 'STORAGE', 'Micron 9550 Pro, 15.36 TB NVMe U.2', 'Micron 9550 Pro, 15.36 TB (15360 GB), NVMe U.2, PCIe Gen5 x4, 2.5" U.2 form factor, read max 12000 MB/s, write max 5000 MB/s', 1019.10, '{"capacity": 15360, "type": "Data"}', true, NOW(), NOW());

-- Insert Motherboard
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'MOTHERBOARD', 'ASRock Rack TURIND8X-2T/500W', 'ASRock Rack TURIND8X-2T/500W, server motherboard, single socket SP6 LGA 6096 for AMD EPYC 9005 / 9004, up to 12x DDR5 RDIMM slots, 8x PCIe Gen5 slots (4x LP + 4x FHFL), 2x 10G LAN, 1x M.2', 1290.00, '{}', true, NOW(), NOW());

-- Insert Network
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'NETWORK', 'NVIDIA ConnectX-7 HEAT', 'NVIDIA ConnectX-7 HEAT, 2-Port 400G InfiniBand & Ethernet Network Adapter, OSFP PCIe 5.0 x16, NDR400 (2x 400 Gb/s), RoCE, SR-IOV, FHHL Heatsink', 1326.23, '{}', true, NOW(), NOW());

-- Insert Chassis
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'CHASSIS', 'LM TEK - RM 4U8G Chassis', 'LM TEK RM 4U8G, 4U rackmount chassis, support for 8x GPUs (8x double width or 4x quad width, vertical GPU mount), mini-redundant PSU support, toolless design, includes rear system rack handles, dust filters', 992.40, '{}', true, NOW(), NOW());

-- Insert Power Supply
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'POWER', 'Power Supply unit', 'Power supply unit GW-CROS2000C3 Titanium, 2000 W, 80 Plus Titanium, mini-redundant 3U form factor, active PFC, modular cables, 92% efficiency', 238.90, '{"capacity": 2000}', true, NOW(), NOW());

-- Insert Cooling unit kits
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 1', 'LM TEK Cooling unit, for 1x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plate, EK-Quantum Vector water block, D5 PWM pump (18W), 360mm radiator, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 3498.16, '{"gpuSupport": 1}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 2', 'LM TEK Cooling unit, for 2x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 480mm radiator, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 3933.74, '{"gpuSupport": 2}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 3', 'LM TEK Cooling unit, for 3x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 560mm radiator, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 4369.32, '{"gpuSupport": 3}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 4', 'LM TEK Cooling unit, for 4x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 2x 480mm radiators, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 4804.90, '{"gpuSupport": 4}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 5', 'LM TEK Cooling unit, for 5x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 2x 560mm radiators, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 5240.48, '{"gpuSupport": 5}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 6', 'LM TEK Cooling unit, for 6x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 3x 480mm radiators, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 5676.06, '{"gpuSupport": 6}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 7', 'LM TEK Cooling unit, for 7x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 3x 560mm radiators, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 6111.64, '{"gpuSupport": 7}', true, NOW(), NOW()),
  (gen_random_uuid(), 'COOLING', 'Cooling unit kit 8', 'LM TEK Cooling unit, for 8x GPU, custom liquid cooling loop with quick disconnect fittings, copper cold plates, EK-Quantum Vector water blocks, D5 PWM pump (18W), 4x 480mm radiators, Noctua NF-A12x25 PWM fans, ZMT tubing, clear coolant', 6547.22, '{"gpuSupport": 8}', true, NOW(), NOW());

-- Insert R&D
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'RND', 'Research & Development', 'Research & Development costs for custom server configuration, thermal simulation, power analysis, and validation testing', 1000.00, '{}', true, NOW(), NOW());

-- Insert Assembly
INSERT INTO "Component" (id, category, name, spec, "listPrice", metadata, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ASSEMBLY', 'Server Assembly', 'Assembly of the server performed by the distributor', 1000.00, '{}', true, NOW(), NOW());
