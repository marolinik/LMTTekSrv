import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import { findLeads } from '@/services/geminiService';
import { Loader } from '@/components/ai/Loader';
import { SourceList } from '@/components/ai/SourceList';
import { Source } from '@/types/ai.types';
import { markdownToHtml } from '@/utils/markdown';

export default function LeadGenerator() {
  const [profile, setProfile] = useState('');
  const [leads, setLeads] = useState<{ text: string; sources: Source[] }>({ text: '', sources: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!profile.trim()) return;
    setIsLoading(true);
    setError('');
    setLeads({ text: '', sources: [] });

    try {
      const result = await findLeads(profile);
      setLeads(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate leads');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Lead Generator</h1>
          <p className="text-muted-foreground"><span className="text-accent">AI-powered</span> lead discovery based on ideal customer profile</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ideal Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., AI research companies with 50-500 employees, focused on computer vision and deep learning, located in North America or Europe"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                rows={5}
              />
              <Button onClick={handleGenerate} disabled={isLoading || !profile.trim()}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Finding Leads...' : 'Generate Leads'}
              </Button>
            </CardContent>
          </Card>

          {(isLoading || leads.text || error) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Potential Leads</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                {isLoading && <Loader text="Discovering leads with AI..." />}
                {error && <p className="text-destructive">{error}</p>}
                {leads.text && (
                  <>
                    <div className="prose prose-sm max-w-none prose-invert" dangerouslySetInnerHTML={{ __html: markdownToHtml(leads.text) }} />
                    <SourceList sources={leads.sources} />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
