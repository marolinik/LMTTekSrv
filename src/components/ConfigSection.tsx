import { CircuitBoard, Cpu, HardDrive, MemoryStick, Network, Zap, Waves, Server, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Configuration } from "./Configurator";
import { useComponents } from "@/contexts/ComponentsContext";
import { getMinimumPSUCount } from "@/utils/psuValidation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ConfigSectionProps {
  config: Configuration;
  updateConfig: (category: keyof Configuration, updates: any) => void;
}

const quantities = [1, 2, 3, 4, 5, 6, 7, 8];

export const ConfigSection = ({ config, updateConfig }: ConfigSectionProps) => {
  const { components } = useComponents();
  const minimumPSU = getMinimumPSUCount(config.gpu.quantity);

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gpu: false,
    cpu: false,
    ram: false,
    storage: false,
    power: false,
    motherboard: false,
    cooling: false,
    network: false,
    chassis: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* GPU Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('gpu')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <CircuitBoard className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Graphics Cards (GPU)</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.gpu.quantity}x {config.gpu.model}
                  {config.gpu.nvlink && (
                    <span className="text-accent"> + {config.gpu.nvlink.quantity}x NVLink Bridge</span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">
                €{(config.gpu.price + (config.gpu.nvlink?.totalPrice || 0)).toLocaleString()}
              </span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.gpu && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.gpu && (
          <CardContent className="space-y-4 border-t border-border/50 pt-6">
          <div>
            <p className="text-sm font-medium mb-3">Quantity</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {quantities.map((qty) => (
                <Button
                  key={qty}
                  size="lg"
                  variant={config.gpu.quantity === qty ? "default" : "outline"}
                  onClick={() => updateConfig("gpu", { quantity: qty, price: (config.gpu.price / config.gpu.quantity) * qty })}
                  className="w-full"
                >
                  x{qty}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Model</p>
            <div className="grid gap-2">
              {components.gpu.filter((gpu) => {
                // Filter out NVLink bridges (accessories)
                if (gpu.name.toLowerCase().includes('nvlink')) return false;
                if (gpu.metadata && typeof gpu.metadata === 'object' && 'accessory' in gpu.metadata && gpu.metadata.accessory) return false;
                return true;
              }).map((gpu) => (
                <Button
                  key={gpu.id}
                  variant={config.gpu.model === gpu.name ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4 px-4"
                  onClick={() => updateConfig("gpu", { model: gpu.name, price: gpu.listPrice * config.gpu.quantity })}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                    <span className="font-medium truncate">{gpu.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">€{gpu.listPrice.toLocaleString()}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {config.gpu.nvlink && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-sm font-medium text-accent mb-2">NVLink Bridges Required</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground whitespace-nowrap">
                  {config.gpu.nvlink.quantity}x NVLink 2-way bridge @ €{config.gpu.nvlink.pricePerUnit}
                </span>
                <span className="font-semibold text-accent">€{config.gpu.nvlink.totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Automatically added for {config.gpu.model}
              </p>
            </div>
          )}
        </CardContent>
        )}
      </Card>

      {/* CPU Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('cpu')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Processor (CPU)</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.cpu.model.split('(')[0].trim()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.cpu.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.cpu && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.cpu && (
          <CardContent className="border-t border-border/50 pt-6">
          <div className="mb-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              CPU automatically matched to {config.gpu.quantity} GPU{config.gpu.quantity > 1 ? 's' : ''} (auto-selected)
            </p>
          </div>
          <div className="grid gap-2">
            {components.cpu.filter(cpu => {
              // Only show CPUs that match the current GPU count
              const minGpus = cpu.metadata?.minGpus || 0;
              const maxGpus = cpu.metadata?.maxGpus || 999;
              return config.gpu.quantity >= minGpus && config.gpu.quantity <= maxGpus;
            }).map((cpu) => (
              <Button
                key={cpu.id}
                variant="default"
                className="w-full justify-start text-left h-auto py-4 px-4 cursor-default"
                disabled
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <span className="font-medium truncate">{cpu.name}</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">€{cpu.listPrice.toLocaleString()}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        )}
      </Card>

      {/* RAM Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('ram')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <MemoryStick className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Memory (RAM)</CardTitle>
                <CardDescription className="text-muted-foreground whitespace-nowrap">
                  {config.ram.quantity}x {config.ram.capacity}GB DDR5
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.ram.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.ram && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.ram && (
          <CardContent className="border-t border-border/50 pt-6">
          <div>
            <p className="text-sm font-medium mb-3">Memory Module</p>
            <div className="grid gap-2">
              {components.ram.map((ram) => (
                <Button
                  key={ram.id}
                  variant="default"
                  className="w-full justify-start text-left h-auto py-4 px-4 cursor-default"
                  disabled
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                    <span className="font-medium truncate">{ram.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">€{ram.listPrice.toLocaleString()} / unit</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-3">Quantity (1-8 units)</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((qty) => (
                <Button
                  key={qty}
                  size="lg"
                  variant={config.ram.quantity === qty ? "default" : "outline"}
                  onClick={() => {
                    const ram = components.ram[0];
                    updateConfig("ram", {
                      quantity: qty,
                      capacity: ram?.metadata?.capacity || 64,
                      price: (ram?.listPrice || 264.88) * qty
                    });
                  }}
                  className="w-full"
                >
                  x{qty}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Storage Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('storage')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <HardDrive className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Storage</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  OS: {config.storage.os.split(',')[0]} • Data: {config.storage.data.length > 0 ? config.storage.data[0].split(',')[0] : 'None'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.storage.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.storage && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.storage && (
          <CardContent className="space-y-4 border-t border-border/50 pt-6">
          <div>
            <p className="text-sm font-medium mb-3">Storage OS</p>
            <div className="grid gap-2">
              {components.storage.filter(drive => drive.metadata?.storageType === 'os').map((drive) => (
                <Button
                  key={drive.id}
                  variant={config.storage.os === drive.name ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4 px-4"
                  onClick={() => {
                    const currentDataPrice = config.storage.data.reduce((sum, dataName) => {
                      const dataDrive = components.storage.find(d => d.name === dataName);
                      return sum + (dataDrive?.listPrice || 0);
                    }, 0);
                    updateConfig("storage", {
                      os: drive.name,
                      price: drive.listPrice + currentDataPrice
                    });
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                    <span className="font-medium truncate">{drive.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">€{drive.listPrice.toLocaleString()}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Storage Data</p>
            <div className="grid gap-2">
              {components.storage.filter(drive => drive.metadata?.storageType === 'data').map((drive) => (
                <Button
                  key={drive.id}
                  variant={config.storage.data.includes(drive.name) ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4 px-4"
                  onClick={() => {
                    const osDrive = components.storage.find(d => d.name === config.storage.os);
                    const osPrice = osDrive?.listPrice || 0;

                    updateConfig("storage", {
                      data: [drive.name],
                      price: osPrice + drive.listPrice
                    });
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                    <span className="font-medium truncate">{drive.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">€{drive.listPrice.toLocaleString()}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Power Supply Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('power')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Zap className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Power Supply</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.power.model} • {config.power.capacity}W
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.power.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.power && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.power && (
          <CardContent className="border-t border-border/50 pt-6">
          <div className="mb-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-sm text-muted-foreground">
              PSU automatically matched to {config.gpu.quantity} GPU{config.gpu.quantity > 1 ? 's' : ''} (auto-selected)
            </p>
          </div>
          <div className="grid gap-2">
            {components.power.filter(psu => {
              const psuCount = psu.metadata?.psuCount || 1;
              return psuCount === minimumPSU;
            }).map((psu) => (
                <Button
                  key={psu.id}
                  variant="default"
                  className="w-full justify-start text-left h-auto py-4 px-4 cursor-default"
                  disabled
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{psu.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {psu.spec}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-accent whitespace-nowrap">€{psu.listPrice.toLocaleString()}</span>
                  </div>
                </Button>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400">
              ℹ️ Power supply configuration is automatically determined based on your GPU selection for optimal performance and redundancy.
            </p>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Motherboard Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('motherboard')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Server className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Motherboard</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.motherboard.model}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.motherboard.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.motherboard && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.motherboard && (
          <CardContent className="border-t border-border/50 pt-6">
          <div className="grid gap-2">
            {components.motherboard.map((mb) => (
              <Button
                key={mb.id}
                variant={config.motherboard.model === mb.name ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-4 px-4"
                onClick={() => updateConfig("motherboard", {
                  model: mb.name,
                  price: mb.listPrice
                })}
              >
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="font-medium">{mb.name}</div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">€{mb.listPrice.toLocaleString()}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        )}
      </Card>

      {/* Cooling Loop Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('cooling')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Waves className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Liquid Cooling Loop</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.cooling.model}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.cooling.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.cooling && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.cooling && (
          <CardContent className="border-t border-border/50 pt-6">
          <div className="mb-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Cooling loop matched to {config.gpu.quantity} GPU{config.gpu.quantity > 1 ? 's' : ''} (auto-selected)
            </p>
          </div>
          <div className="grid gap-2">
            {components.cooling.filter(cooling => cooling.metadata?.gpuSupport === config.gpu.quantity).map((cooling) => (
                <Button
                  key={cooling.id}
                  variant="default"
                  className="w-full justify-start text-left h-auto py-4 px-4 cursor-default"
                  disabled
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="font-medium">{cooling.name}</div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">€{cooling.listPrice.toLocaleString()}</span>
                  </div>
                </Button>
            ))}
          </div>
        </CardContent>
        )}
      </Card>

      {/* Network Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('network')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Network className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Network</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.network.model}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">
                {config.network.price === 0 ? "Included" : `€${config.network.price.toLocaleString()}`}
              </span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.network && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.network && (
          <CardContent className="border-t border-border/50 pt-6">
          <div className="grid gap-2">
            {components.network.map((net) => (
              <Button
                key={net.id}
                variant={config.network.model === net.name ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-4 px-4"
                onClick={() => updateConfig("network", {
                  model: net.name,
                  price: net.listPrice
                })}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <span className="font-medium truncate">{net.name}</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {net.listPrice === 0 ? "Included" : `€${net.listPrice.toLocaleString()}`}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        )}
      </Card>

      {/* Chassis Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <CardHeader
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => toggleSection('chassis')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Server className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground">Chassis</CardTitle>
                <CardDescription className="text-muted-foreground truncate">
                  {config.chassis.model}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-accent">€{config.chassis.price.toLocaleString()}</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                expandedSections.chassis && "rotate-180"
              )} />
            </div>
          </div>
        </CardHeader>
        {expandedSections.chassis && (
          <CardContent className="border-t border-border/50 pt-6">
          <div className="grid gap-2">
            {components.chassis.map((chassis) => (
              <Button
                key={chassis.id}
                variant={config.chassis.model === chassis.name ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-4 px-4"
                onClick={() => updateConfig("chassis", {
                  model: chassis.name,
                  price: chassis.listPrice
                })}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <span className="font-medium truncate">{chassis.name}</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">€{chassis.listPrice.toLocaleString()}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        )}
      </Card>
    </>
  );
};
