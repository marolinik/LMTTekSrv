import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Configuration } from '@/components/Configurator';
import { CircuitBoard, Cpu, MemoryStick, HardDrive, Zap, Network } from 'lucide-react';

interface ConfigurationCardProps {
  config: Configuration;
}

export const ConfigurationCard = ({ config }: ConfigurationCardProps) => {
  const totalPrice =
    config.gpu.price +
    config.cpu.price +
    config.ram.price +
    config.storage.price +
    config.power.price +
    config.network.price +
    config.motherboard.price +
    config.cooling.price;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircuitBoard className="h-5 w-5 text-primary" />
          Current Configuration
        </CardTitle>
        <CardDescription>AI content is based on this server configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <CircuitBoard className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">GPU</p>
            <p className="text-xs text-muted-foreground">
              {config.gpu.quantity}x {config.gpu.model}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">CPU</p>
            <p className="text-xs text-muted-foreground">
              {config.cpu.model} ({config.cpu.cores} Cores)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MemoryStick className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">RAM</p>
            <p className="text-xs text-muted-foreground">{config.ram.capacity}GB DDR5 ECC</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Storage</p>
            <p className="text-xs text-muted-foreground">{config.storage.os}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Power</p>
            <p className="text-xs text-muted-foreground">
              {config.power.model} ({config.power.capacity}W)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Network className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Network</p>
            <p className="text-xs text-muted-foreground">{config.network.model}</p>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Total Price</p>
            <Badge variant="secondary" className="text-base font-bold">
              ${totalPrice.toLocaleString()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
