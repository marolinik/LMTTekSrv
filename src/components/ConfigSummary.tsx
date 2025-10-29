import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Configuration } from "./Configurator";
import { Badge } from "./ui/badge";
import { QuoteDialog } from "./QuoteDialog";
import { CircuitBoard, Cpu, MemoryStick, HardDrive, Zap, Network, Server, Waves, Box, Percent } from "lucide-react";
import { Slider } from "./ui/slider";

interface ConfigSummaryProps {
  config: Configuration;
}

export const ConfigSummary = ({ config }: ConfigSummaryProps) => {
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [margin, setMargin] = useState(0); // 0-40 range for 10-50%

  const totalPrice =
    config.gpu.price +
    (config.gpu.nvlink?.totalPrice || 0) +
    config.cpu.price +
    config.ram.price +
    config.storage.price +
    config.power.price +
    config.network.price +
    config.motherboard.price +
    config.cooling.price +
    config.chassis.price +
    config.rnd.price +
    config.assembly.price;

  // Calculate margin percentage (10% + slider value, max 50%)
  const marginPercentage = 10 + margin;
  const marginAmount = totalPrice * (marginPercentage / 100);
  const finalPrice = totalPrice + marginAmount;

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-50">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          {/* Component Summary Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-4">
            {/* GPU */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <CircuitBoard className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium">x{config.gpu.quantity}</span>
              <span className="text-[10px] text-white/60">GPU</span>
            </div>

            {/* CPU */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Cpu className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium">{config.cpu.cores}</span>
              <span className="text-[10px] text-white/60">Cores</span>
            </div>

            {/* RAM */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <MemoryStick className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium">{config.ram.quantity}x{config.ram.capacity}GB</span>
              <span className="text-[10px] text-white/60">RAM</span>
            </div>

            {/* Storage */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <HardDrive className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium truncate max-w-[80px]">OS+Data</span>
              <span className="text-[10px] text-white/60">Storage</span>
            </div>

            {/* Power */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium">x{config.power.quantity}</span>
              <span className="text-[10px] text-white/60">PSU</span>
            </div>

            {/* Network */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Network className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium truncate max-w-[80px]">NIC</span>
              <span className="text-[10px] text-white/60">Network</span>
            </div>

            {/* Motherboard */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Server className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium truncate max-w-[80px]">MB</span>
              <span className="text-[10px] text-white/60">Mobo</span>
            </div>

            {/* Cooling */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Waves className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium truncate max-w-[80px]">Loop</span>
              <span className="text-[10px] text-white/60">Cooling</span>
            </div>

            {/* Chassis */}
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Box className="h-5 w-5 text-accent" />
              <span className="text-xs text-white/90 font-medium truncate max-w-[80px]">4U8G</span>
              <span className="text-[10px] text-white/60">Chassis</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-left flex-1">
                <p className="text-xs text-muted-foreground">Total Configuration</p>
                {marginPercentage > 10 ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg md:text-xl font-medium text-white/60">€{totalPrice.toLocaleString()}</p>
                    <p className="text-2xl md:text-3xl font-bold text-accent">€{finalPrice.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-2xl md:text-3xl font-bold text-white">€{finalPrice.toLocaleString()}</p>
                )}
              </div>

              {/* Margin Slider */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Percent className="h-4 w-4 text-accent" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-white/60">Margin</span>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[margin]}
                      onValueChange={(value) => setMargin(value[0])}
                      min={0}
                      max={40}
                      step={1}
                      className="w-32"
                    />
                    <span className="text-sm font-semibold text-accent min-w-[45px]">{marginPercentage}%</span>
                  </div>
                </div>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 text-white shadow-lg whitespace-nowrap rounded-full px-8"
                size="lg"
                onClick={() => setShowQuoteDialog(true)}
              >
                Make Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      <QuoteDialog
        open={showQuoteDialog}
        onOpenChange={setShowQuoteDialog}
        config={config}
        totalPrice={totalPrice}
        marginPercentage={marginPercentage}
        finalPrice={finalPrice}
      />
    </>
  );
};
