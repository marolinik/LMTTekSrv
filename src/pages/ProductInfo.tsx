import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { generateTechnicalDescription, generatePitch } from '@/services/geminiService';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { configurationToServerSpecs } from '@/utils/configConverter';
import { ConfigurationCard } from '@/components/ai/ConfigurationCard';
import { Loader } from '@/components/ai/Loader';
import { markdownToHtml } from '@/utils/markdown';

export default function ProductInfo() {
  const [technicalDescription, setTechnicalDescription] = useState('');
  const [pitch, setPitch] = useState('');
  const [isLoadingTech, setIsLoadingTech] = useState(false);
  const [isLoadingPitch, setIsLoadingPitch] = useState(false);
  const [error, setError] = useState('');
  const { currentConfig } = useConfiguration();

  const specs = currentConfig ? configurationToServerSpecs(currentConfig) : [];

  const handleGenerateTechnicalDescription = useCallback(async () => {
    if (!currentConfig) return;

    setIsLoadingTech(true);
    setError('');
    setTechnicalDescription('');

    try {
      const onChunk = (chunk: string) => {
        setTechnicalDescription((prev) => prev + chunk);
      };
      await generateTechnicalDescription(specs, onChunk);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the technical description.');
      console.error(err);
    } finally {
      setIsLoadingTech(false);
    }
  }, [currentConfig, specs]);

  const handleGeneratePitch = useCallback(async () => {
    if (!currentConfig) {
      setError('No configuration available. Please configure a server first.');
      return;
    }

    setIsLoadingPitch(true);
    setError('');
    setPitch('');

    try {
      const onChunk = (chunk: string) => {
        setPitch((prev) => prev + chunk);
      };
      await generatePitch(specs, onChunk);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the pitch.');
      console.error(err);
    } finally {
      setIsLoadingPitch(false);
    }
  }, [currentConfig, specs]);

  // Manual generation only - no auto-generation

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Product Deep Dive</h1>
          <p className="text-muted-foreground">LM TEK RM-4U8G Server - <span className="text-accent">AI-Powered Sales Intelligence</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Config */}
          <div className="lg:col-span-1">
            {currentConfig ? (
              <ConfigurationCard config={currentConfig} />
            ) : (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">No Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">Configure a server first to generate sales content</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Right Column - Technical Description and Pitch */}
          <div className="lg:col-span-2 space-y-8">
            {/* Technical Specifications */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-foreground">Technical Specifications</h2>
                <Button onClick={handleGenerateTechnicalDescription} disabled={isLoadingTech || !currentConfig} size="sm">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingTech ? 'animate-spin' : ''}`} />
                  {technicalDescription ? 'Regenerate' : 'Generate'}
                </Button>
              </div>
              <Card className="bg-card border-border">
                <CardContent className="pt-6 min-h-[300px]">
                  {isLoadingTech && !technicalDescription && <Loader text="Generating technical description..." />}
                  {error && <p className="text-destructive">{error}</p>}
                  {technicalDescription && (
                    <div
                      className="prose prose-sm max-w-none prose-invert"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(technicalDescription) }}
                    />
                  )}
                  {!isLoadingTech && !technicalDescription && !error && (
                    <p className="text-muted-foreground text-center py-12">Click "Generate" to create technical specifications</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI-Generated Sales Pitch */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-foreground"><span className="text-accent">AI-Generated</span> Sales Pitch</h2>
                <Button onClick={handleGeneratePitch} disabled={isLoadingPitch || !currentConfig} size="sm">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingPitch ? 'animate-spin' : ''}`} />
                  {pitch ? 'Regenerate' : 'Generate'}
                </Button>
              </div>
              <Card className="bg-card border-border">
                <CardContent className="pt-6 min-h-[500px]">
                  {isLoadingPitch && !pitch && <Loader text="Generating sales pitch..." />}
                  {error && <p className="text-destructive">{error}</p>}
                  {pitch && (
                    <div
                      className="prose prose-sm max-w-none prose-invert"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(pitch) }}
                    />
                  )}
                  {!isLoadingPitch && !pitch && !error && (
                    <p className="text-muted-foreground text-center py-12">Click "Generate" to create AI sales pitch</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
