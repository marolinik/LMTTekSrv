import { useState, useEffect } from "react";
import { ConfigSection } from "./ConfigSection";
import { ConfigSummary } from "./ConfigSummary";
import { useComponents } from "@/contexts/ComponentsContext";
import { useConfiguration } from "@/contexts/ConfigurationContext";
import { getMinimumPSUCount } from "@/utils/psuValidation";

export interface Configuration {
  gpu: {
    model: string;
    quantity: number;
    price: number;
    nvlink?: {
      required: boolean;
      quantity: number;
      pricePerUnit: number;
      totalPrice: number;
    };
  };
  cpu: {
    model: string;
    cores: number;
    price: number;
  };
  ram: {
    capacity: number;
    quantity: number;
    price: number;
  };
  storage: {
    os: string;
    data: string[];
    price: number;
  };
  power: {
    model: string;
    capacity: number;
    quantity: number;
    price: number;
  };
  network: {
    model: string;
    price: number;
  };
  motherboard: {
    model: string;
    price: number;
  };
  cooling: {
    model: string;
    price: number;
  };
  chassis: {
    model: string;
    price: number;
  };
  rnd: {
    model: string;
    price: number;
  };
  assembly: {
    model: string;
    price: number;
  };
}

const defaultConfig: Configuration = {
  gpu: {
    model: "Nvidia H200 NVL",
    quantity: 8,
    price: 23166.34 * 8,
  },
  cpu: {
    model: "Dual AMD EPYC 9755 (2x 128 Cores, 1000 W) for 8 GPU",
    cores: 256,
    price: 23979.06,
  },
  ram: {
    capacity: 64,
    quantity: 4,
    price: 264.88 * 4,
  },
  storage: {
    os: "Micron 7450 PRO, 1.92 TB NVMe M.2",
    data: ["Micron 9550 Pro, 15.36 TB NVMe U.2"],
    price: 271.33 + 1019.10,
  },
  power: {
    model: "Power Supply unit",
    capacity: 2000,
    quantity: 1,
    price: 238.90,
  },
  network: {
    model: "NVIDIA ConnectX-7 HEAT",
    price: 1326.23,
  },
  motherboard: {
    model: "ASRock Rack TURIND8X-2T/500W",
    price: 1290,
  },
  cooling: {
    model: "Cooling unit kit 8",
    price: 6547.22,
  },
  chassis: {
    model: "LM TEK - RM 4U8G Chassis",
    price: 992.40,
  },
  rnd: {
    model: "Research & Development",
    price: 1000,
  },
  assembly: {
    model: "Server Assembly",
    price: 1000,
  },
};

export const Configurator = () => {
  const [config, setConfig] = useState<Configuration>(defaultConfig);
  const { components } = useComponents();
  const { setCurrentConfig } = useConfiguration();

  const updateConfig = (category: keyof Configuration, updates: Partial<Configuration[keyof Configuration]>) => {
    setConfig((prev) => ({
      ...prev,
      [category]: { ...prev[category], ...updates },
    }));
  };

  // Sync config to context for AI features
  useEffect(() => {
    setCurrentConfig(config);
  }, [config, setCurrentConfig]);

  // Auto-select PSU based on GPU quantity
  useEffect(() => {
    const minimumPSU = getMinimumPSUCount(config.gpu.quantity);

    // Find the PSU that exactly matches the minimum required count
    const requiredPSU = components.power.find(p => (p.metadata?.psuCount || 0) === minimumPSU);

    if (requiredPSU) {
      // Always update to match the required PSU count and pricing
      setConfig((prev) => ({
        ...prev,
        power: {
          model: requiredPSU.name,
          capacity: requiredPSU.metadata?.capacity || 0,
          quantity: minimumPSU, // Set quantity to match PSU count
          price: requiredPSU.listPrice, // Price is already total for the PSU configuration
        },
      }));
    }
  }, [config.gpu.quantity, components.power]);

  // Auto-adjust cooling loop when GPU quantity changes
  useEffect(() => {
    const requiredCooling = components.cooling.find(c => c.metadata?.gpuSupport === config.gpu.quantity);

    if (requiredCooling && config.cooling.model !== requiredCooling.name) {
      setConfig((prev) => ({
        ...prev,
        cooling: {
          model: requiredCooling.name,
          price: requiredCooling.listPrice,
        },
      }));
    }
  }, [config.gpu.quantity, components.cooling]);

  // Auto-select CPU based on GPU quantity
  useEffect(() => {
    const gpuCount = config.gpu.quantity;

    // Find the appropriate CPU based on GPU count
    const appropriateCPU = components.cpu.find(cpu => {
      const minGpus = cpu.metadata?.minGpus || 0;
      const maxGpus = cpu.metadata?.maxGpus || 999;
      return gpuCount >= minGpus && gpuCount <= maxGpus;
    });

    if (appropriateCPU && config.cpu.model !== appropriateCPU.name) {
      setConfig((prev) => ({
        ...prev,
        cpu: {
          model: appropriateCPU.name,
          cores: appropriateCPU.metadata?.cores || 0,
          price: appropriateCPU.listPrice,
        },
      }));
    }
  }, [config.gpu.quantity, components.cpu]);

  // Auto-calculate NVLink bridges for H200, H100, and RTX 6000 series
  useEffect(() => {
    const gpuModel = config.gpu.model;
    const gpuQuantity = config.gpu.quantity;

    // Define which GPUs need NVLink and their prices
    const nvlinkRequirements: Record<string, number> = {
      "Nvidia H200 NVL": 400,
      "NVIDIA H200 141GB": 400,
      "NVIDIA H100 94GB": 200,
      "NVIDIA RTX PRO 6000 96GB": 200,
      "NVIDIA RTX 6000 ADA 48GB": 200,
      "Nvidia RTX 6000 Blackwell Server Edition": 200,
    };

    const pricePerUnit = nvlinkRequirements[gpuModel];

    if (pricePerUnit && gpuQuantity >= 2) {
      // Calculate NVLink quantity: 1 for 2 cards, 2 for 4 cards, 3 for 6 cards, 4 for 8 cards
      const nvlinkQuantity = Math.floor(gpuQuantity / 2);
      const totalNvlinkPrice = nvlinkQuantity * pricePerUnit;

      // Update config with NVLink info
      setConfig((prev) => ({
        ...prev,
        gpu: {
          ...prev.gpu,
          nvlink: {
            required: true,
            quantity: nvlinkQuantity,
            pricePerUnit,
            totalPrice: totalNvlinkPrice,
          },
        },
      }));
    } else {
      // Remove NVLink if not required
      setConfig((prev) => ({
        ...prev,
        gpu: {
          ...prev.gpu,
          nvlink: undefined,
        },
      }));
    }
  }, [config.gpu.model, config.gpu.quantity]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-black min-h-[90vh] flex items-center px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Video */}
            <div className="relative rounded-xl overflow-hidden order-2 lg:order-1">
              <video
                src="/hero-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Right - Text */}
            <div className="space-y-6 order-1 lg:order-2">
              <p className="text-accent text-sm md:text-base font-medium tracking-wide uppercase">
                The RM-4U8G Server
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Density<br />Redefined.
              </h1>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                The world's most dense, <span className="text-accent">liquid-cooled 4U server</span>, built from the ground up to support the extreme demands of modern AI. Integrating up to <span className="text-accent">eight next-generation NVIDIA GPUs</span>, the LM TEK RM-4U8G Server is the state-of-the-art foundation for achieving your largest AI, HPC and machine learning goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Title */}
      <section className="bg-background py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <p className="text-accent text-sm font-medium tracking-wide uppercase">
            Build Your Configuration
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Configure Your Server
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Customize every component to match your exact requirements
          </p>
        </div>
      </section>

      {/* Configuration Sections */}
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 mb-24">
        <ConfigSection config={config} updateConfig={updateConfig} />
      </div>

      {/* Sticky Summary */}
      <ConfigSummary config={config} />
    </div>
  );
};
