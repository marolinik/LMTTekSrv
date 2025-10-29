import { useEffect, useState } from 'react';
import { useComponents } from '@/contexts/ComponentsContext';
import { Component, ComponentCategory } from '@/types/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ComponentFormProps {
  component: Component | null;
  category: ComponentCategory;
  onClose: () => void;
}

export const ComponentForm = ({ component, category, onClose }: ComponentFormProps) => {
  const { addComponent, updateComponent } = useComponents();
  const [formData, setFormData] = useState({
    name: '',
    spec: '',
    listPrice: 0,
    capacity: 0,
    cores: 0,
    psuCount: 0,
    gpuSupport: 0,
  });

  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name,
        spec: component.spec,
        listPrice: component.listPrice,
        capacity: component.metadata?.capacity || 0,
        cores: component.metadata?.cores || 0,
        psuCount: component.metadata?.psuCount || 0,
        gpuSupport: component.metadata?.gpuSupport || 0,
      });
    } else {
      setFormData({
        name: '',
        spec: '',
        listPrice: 0,
        capacity: 0,
        cores: 0,
        psuCount: 0,
        gpuSupport: 0,
      });
    }
  }, [component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const componentData = {
      category,
      name: formData.name,
      spec: formData.spec,
      listPrice: formData.listPrice,
      metadata: {} as any,
    };

    // Add metadata based on category
    if (category === 'ram') {
      componentData.metadata.capacity = formData.capacity;
    }
    if (category === 'power') {
      componentData.metadata.capacity = formData.capacity;
      componentData.metadata.psuCount = formData.psuCount;
    }
    if (category === 'cpu') {
      componentData.metadata.cores = formData.cores;
    }
    if (category === 'cooling') {
      componentData.metadata.gpuSupport = formData.gpuSupport;
    }

    if (component) {
      updateComponent(component.id, componentData);
    } else {
      addComponent(componentData);
    }

    onClose();
  };

  const showCapacityField = category === 'ram' || category === 'power';
  const showCoresField = category === 'cpu';
  const showPSUCountField = category === 'power';
  const showGPUSupportField = category === 'cooling';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{component ? 'Edit' : 'Add'} Component</DialogTitle>
          <DialogDescription>
            {component ? 'Update the component details below.' : 'Add a new component to the configurator.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Component Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., NVIDIA RTX 4090"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spec">Specification</Label>
              <Input
                id="spec"
                value={formData.spec}
                onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                placeholder="e.g., 24GB GDDR6X"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">List Price (€)</Label>
              <Input
                id="price"
                type="number"
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: parseFloat(e.target.value) })}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            {showCapacityField && (
              <div className="space-y-2">
                <Label htmlFor="capacity">
                  {category === 'ram' ? 'Capacity (GB)' : 'Capacity (W)'}
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            )}

            {showCoresField && (
              <div className="space-y-2">
                <Label htmlFor="cores">Number of Cores</Label>
                <Input
                  id="cores"
                  type="number"
                  value={formData.cores}
                  onChange={(e) => setFormData({ ...formData, cores: parseInt(e.target.value) })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            )}

            {showPSUCountField && (
              <div className="space-y-2">
                <Label htmlFor="psuCount">Number of PSU Units</Label>
                <Input
                  id="psuCount"
                  type="number"
                  value={formData.psuCount}
                  onChange={(e) => setFormData({ ...formData, psuCount: parseInt(e.target.value) })}
                  placeholder="0"
                  min="1"
                  max="5"
                  required
                />
              </div>
            )}

            {showGPUSupportField && (
              <div className="space-y-2">
                <Label htmlFor="gpuSupport">Number of GPUs Supported</Label>
                <Input
                  id="gpuSupport"
                  type="number"
                  value={formData.gpuSupport}
                  onChange={(e) => setFormData({ ...formData, gpuSupport: parseInt(e.target.value) })}
                  placeholder="0"
                  min="1"
                  max="8"
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {component ? 'Update' : 'Add'} Component
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
