
import { ServerSpec } from '../types';

export const serverSpecs: ServerSpec[] = [
    {
        category: "Case",
        items: [
            { feature: "Model No.", value: "LM TEK - 4U8G" },
            { feature: "Chassis Form Factor", value: "4U" },
            { feature: "Motherboard", value: "TURIND8X-2T/500W" },
            { feature: "Expansion Slot", value: "Standard PCI Expansion Slots x8" },
            { feature: "Front I/O Port", value: ["USB-A x 2", "Power Button", "Reset Button", "+Motherboard I/O"] },
            { feature: "Indicators", value: "Power/Reset LED x 1: White" },
            { feature: "Dimensions", value: "435mm (W) x 176mm (H) x 800mm (D) / 17.13\" (W) x 6.93\" (H) x 31.49\" (D)" }
        ]
    },
    {
        category: "Cooling (EK Liquid-Cooling Kit)",
        items: [
            { feature: "Pump", value: "2x D5" },
            { feature: "Radiators", value: "EK-Pro Monolith 360 mm" },
            { feature: "Tubes", value: "EK ZMT 10/16" },
            { feature: "Fans", value: "6x 120 mm" },
            { feature: "Manifold", value: "8x GPU, 2x CPU" },
            { feature: "CPU Cooling", value: "EK-Pro CPU WB SP5" }
        ]
    },
    {
        category: "Power Supply",
        items: [
            { feature: "Type", value: "CRPS 4+1" },
            { feature: "Output Power (W)", value: "5x 2000W Platinum" }
        ]
    },
    {
        category: "RAM",
        items: [
            { feature: "Max Capacity", value: "Up To 2048GB" },
            { feature: "Type", value: "DDR5 ECC R-DIMM" }
        ]
    },
    {
        category: "CPU",
        items: [
            { feature: "Support", value: "1 or 2 CPU Supported" },
            { feature: "AMD Models", value: ["EPYC Series 9004", "EPYC Series 9005"] }
        ]
    },
    {
        category: "GPU",
        items: [
            { feature: "Support", value: "Up to 8 GPUs Supported" },
            {
                feature: "GPU Models", value: [
                    "NVIDIA RTX A5000", "NVIDIA RTX A5500", "NVIDIA RTX A6000", "NVIDIA RTX 6000 Ada",
                    "NVIDIA A100 80GB", "NVIDIA A100", "NVIDIA H100 NVL", "NVIDIA H100", "NVIDIA H200 NVL",
                    "NVIDIA PRO 6000 Blackwell Server Edition", "Geforce RTX 5090"
                ]
            }
        ]
    }
];
