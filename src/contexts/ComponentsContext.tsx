import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Component, ComponentsByCategory, ComponentCategory } from '@/types/components';
import { componentService } from '@/services/component.service';
import { useToast } from '@/hooks/use-toast';

interface ComponentsContextType {
  components: ComponentsByCategory;
  isLoading: boolean;
  error: Error | null;
  addComponent: (component: Omit<Component, 'id'>) => Promise<void>;
  updateComponent: (id: string, updates: Partial<Component>) => Promise<void>;
  deleteComponent: (id: string, category: ComponentCategory) => Promise<void>;
  getComponentsByCategory: (category: ComponentCategory) => Component[];
}

const ComponentsContext = createContext<ComponentsContextType | undefined>(undefined);

export const ComponentsProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all components from API
  const { data: componentsArray = [], isLoading, error } = useQuery<Component[], Error>({
    queryKey: ['components'],
    queryFn: componentService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Convert array to ComponentsByCategory object
  const components: ComponentsByCategory = useMemo(() => {
    const categorized: ComponentsByCategory = {
      gpu: [],
      cpu: [],
      ram: [],
      storage: [],
      power: [],
      network: [],
      motherboard: [],
      cooling: [],
      chassis: [],
      rnd: [],
      assembly: [],
    };

    componentsArray.forEach((component) => {
      const categoryKey = component.category.toLowerCase();
      if (categoryKey in categorized) {
        categorized[categoryKey].push(component);
      }
    });

    return categorized;
  }, [componentsArray]);

  // Create component mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Component, 'id'>) => componentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast({
        title: 'Component created',
        description: 'The component has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create component',
        description: error.response?.data?.error || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  // Update component mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Component> }) =>
      componentService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast({
        title: 'Component updated',
        description: 'The component has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update component',
        description: error.response?.data?.error || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  // Delete component mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => componentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast({
        title: 'Component deleted',
        description: 'The component has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete component',
        description: error.response?.data?.error || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  const addComponent = async (component: Omit<Component, 'id'>) => {
    await createMutation.mutateAsync(component);
  };

  const updateComponent = async (id: string, updates: Partial<Component>) => {
    await updateMutation.mutateAsync({ id, updates });
  };

  const deleteComponent = async (id: string, category: ComponentCategory) => {
    await deleteMutation.mutateAsync(id);
  };

  const getComponentsByCategory = (category: ComponentCategory) => {
    return components[category] || [];
  };

  return (
    <ComponentsContext.Provider
      value={{
        components,
        isLoading,
        error: error as Error | null,
        addComponent,
        updateComponent,
        deleteComponent,
        getComponentsByCategory,
      }}
    >
      {children}
    </ComponentsContext.Provider>
  );
};

export const useComponents = () => {
  const context = useContext(ComponentsContext);
  if (!context) {
    throw new Error('useComponents must be used within ComponentsProvider');
  }
  return context;
};
