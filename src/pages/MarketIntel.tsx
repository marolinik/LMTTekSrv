import { useState, useCallback, FormEvent } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X } from 'lucide-react';
import { analyzeCompetition, discoverCompetitors } from '@/services/geminiService';
import { Loader } from '@/components/ai/Loader';
import { SourceList } from '@/components/ai/SourceList';
import { Source } from '@/types/ai.types';
import { markdownToHtml } from '@/utils/markdown';

export default function MarketIntel() {
  const [allCompetitors, setAllCompetitors] = useState<string[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [analysis, setAnalysis] = useState<{ text: string; sources: Source[] }>({ text: '', sources: [] });
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState('');

  const handleDiscoverCompetitors = useCallback(async () => {
    setIsLoadingDiscovery(true);
    setError('');
    try {
      const newlyDiscovered = await discoverCompetitors();
      const updatedAllCompetitors = Array.from(new Set([...allCompetitors, ...newlyDiscovered]));
      setAllCompetitors(updatedAllCompetitors);
      setSelectedCompetitors(Array.from(new Set([...selectedCompetitors, ...newlyDiscovered])));
    } catch (err: any) {
      setError(err.message || 'An error occurred while discovering competitors.');
    } finally {
      setIsLoadingDiscovery(false);
    }
  }, [allCompetitors, selectedCompetitors]);

  const handleManualAdd = (e: FormEvent) => {
    e.preventDefault();
    const newCompetitor = manualInput.trim();
    if (newCompetitor && !allCompetitors.includes(newCompetitor)) {
      setAllCompetitors([...allCompetitors, newCompetitor]);
      setSelectedCompetitors([...selectedCompetitors, newCompetitor]);
      setManualInput('');
    }
  };

  const toggleCompetitor = (competitor: string) => {
    setSelectedCompetitors((prev) =>
      prev.includes(competitor) ? prev.filter((c) => c !== competitor) : [...prev, competitor]
    );
  };

  const handleAnalyze = useCallback(async () => {
    if (selectedCompetitors.length === 0) {
      setError('Please select at least one competitor to analyze.');
      return;
    }
    setIsLoadingAnalysis(true);
    setError('');
    setAnalysis({ text: '', sources: [] });

    try {
      let analysisText = '';
      const onChunk = (chunk: string) => {
        analysisText += chunk;
        setAnalysis((prev) => ({ ...prev, text: analysisText }));
      };
      const { sources } = await analyzeCompetition(selectedCompetitors, onChunk);
      setAnalysis({ text: analysisText, sources });
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing competition.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [selectedCompetitors]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Market Intelligence</h1>
          <p className="text-muted-foreground">Competitive analysis powered by <span className="text-accent">AI with Google Search</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Competitor Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Competitors</CardTitle>
                <CardDescription className="text-muted-foreground">Discover or add competitors manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleDiscoverCompetitors} disabled={isLoadingDiscovery} className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  {isLoadingDiscovery ? 'Discovering...' : 'Discover Competitors'}
                </Button>

                <form onSubmit={handleManualAdd} className="flex gap-2">
                  <Input
                    placeholder="Add competitor manually"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>

                <div className="space-y-2">
                  {allCompetitors.map((comp) => (
                    <div key={comp} className="flex items-center justify-between p-2 border border-border rounded-lg bg-muted">
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCompetitors.includes(comp)}
                          onChange={() => toggleCompetitor(comp)}
                          className="rounded"
                        />
                        <span className="text-sm text-foreground">{comp}</span>
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setAllCompetitors(allCompetitors.filter((c) => c !== comp))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={handleAnalyze} disabled={isLoadingAnalysis || selectedCompetitors.length === 0} className="w-full">
                  {isLoadingAnalysis ? 'Analyzing...' : `Analyze ${selectedCompetitors.length} Competitor(s)`}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground"><span className="text-accent">Competitive Analysis</span></CardTitle>
                <CardDescription className="text-muted-foreground">AI-generated comparison with web sources</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[500px]">
                {isLoadingAnalysis && !analysis.text && <Loader text="Analyzing competition..." />}
                {error && <p className="text-destructive">{error}</p>}
                {analysis.text && (
                  <>
                    <div className="prose prose-sm max-w-none prose-invert" dangerouslySetInnerHTML={{ __html: markdownToHtml(analysis.text) }} />
                    <SourceList sources={analysis.sources} />
                  </>
                )}
                {!isLoadingAnalysis && !analysis.text && !error && (
                  <p className="text-muted-foreground text-center py-12">Select competitors and click "Analyze" to generate a comparison</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
