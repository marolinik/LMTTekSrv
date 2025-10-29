import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Configuration } from '@/components/Configurator';

interface ConfigurationContextType {
  currentConfig: Configuration | null;
  setCurrentConfig: (config: Configuration) => void;
  configHash: string;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

// Generate a simple hash from configuration to detect changes
function generateConfigHash(config: Configuration | null): string {
  if (!config) return '';
  return JSON.stringify({
    gpu: { model: config.gpu.model, quantity: config.gpu.quantity },
    cpu: { model: config.cpu.model, cores: config.cpu.cores },
    ram: config.ram.capacity,
    storage: { os: config.storage.os, data: config.storage.data },
    power: config.power.capacity,
  });
}

export const ConfigurationProvider = ({ children }: { children: ReactNode }) => {
  const [currentConfig, setCurrentConfigState] = useState<Configuration | null>(null);
  const [configHash, setConfigHash] = useState<string>('');

  const setCurrentConfig = (config: Configuration) => {
    setCurrentConfigState(config);
    setConfigHash(generateConfigHash(config));
  };

  // Update hash when config changes
  useEffect(() => {
    setConfigHash(generateConfigHash(currentConfig));
  }, [currentConfig]);

  return (
    <ConfigurationContext.Provider
      value={{
        currentConfig,
        setCurrentConfig,
        configHash,
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within ConfigurationProvider');
  }
  return context;
};
