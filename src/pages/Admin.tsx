import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComponents } from '@/contexts/ComponentsContext';
import { Component, ComponentCategory } from '@/types/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, FileText } from 'lucide-react';
import { ComponentForm } from '@/components/admin/ComponentForm';
import { Header } from '@/components/Header';

export default function Admin() {
  const { components, deleteComponent } = useComponents();
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('gpu');
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const categories: { value: ComponentCategory; label: string }[] = [
    { value: 'gpu', label: 'GPUs' },
    { value: 'cpu', label: 'CPUs' },
    { value: 'ram', label: 'RAM' },
    { value: 'storage', label: 'Storage' },
    { value: 'power', label: 'Power Supply' },
    { value: 'motherboard', label: 'Motherboard' },
    { value: 'cooling', label: 'Cooling Loop' },
    { value: 'network', label: 'Network' },
    { value: 'chassis', label: 'Chassis' },
    { value: 'rnd', label: 'R&D' },
    { value: 'assembly', label: 'Assembly' },
  ];

  const handleEdit = (component: Component) => {
    setEditingComponent(component);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, category: ComponentCategory) => {
    if (confirm('Are you sure you want to delete this component?')) {
      deleteComponent(id, category);
    }
  };

  const handleAddNew = () => {
    setEditingComponent(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingComponent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage components and quotes for the configurator</p>
          </div>
          <Link to="/admin/quotes">
            <Button size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Manage Quotes
            </Button>
          </Link>
        </div>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ComponentCategory)}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1 mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{cat.label} Components</CardTitle>
                      <CardDescription>
                        Manage {cat.label.toLowerCase()} options available in the configurator
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {components[cat.value].length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No components added yet. Click "Add Component" to get started.
                      </div>
                    ) : (
                      components[cat.value].map((component) => (
                        <div
                          key={component.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{component.name}</div>
                            <div className="text-sm text-muted-foreground">{component.spec}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-foreground">
                                €{component.listPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">List Price</div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(component)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(component.id, component.category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {isFormOpen && (
        <ComponentForm
          component={editingComponent}
          category={activeCategory}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
