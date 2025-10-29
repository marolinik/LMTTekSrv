import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { getSalesAdvice } from '@/services/geminiService';
import { Loader } from '@/components/ai/Loader';
import { markdownToHtml } from '@/utils/markdown';

export default function SalesPlaybook() {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setError('');
    setAdvice('');

    try {
      const response = await getSalesAdvice(question);
      setAdvice(response);
    } catch (err: any) {
      setError(err.message || 'Failed to get sales advice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Sales Playbook</h1>
          <p className="text-muted-foreground">Get <span className="text-accent">AI-powered coaching</span> for sales scenarios</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ask a Sales Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., How do I handle objections about price?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSubmit} disabled={isLoading || !question.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Get Advice
              </Button>
            </CardContent>
          </Card>

          {(isLoading || advice || error) && (
            <Card className="bg-card border-border">
              <CardContent className="pt-6 min-h-[300px]">
                {isLoading && <Loader text="Getting sales advice..." />}
                {error && <p className="text-destructive">{error}</p>}
                {advice && <div className="prose prose-sm max-w-none prose-invert" dangerouslySetInnerHTML={{ __html: markdownToHtml(advice) }} />}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
