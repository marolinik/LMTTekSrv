import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Source } from '@/types/ai.types';

interface SourceListProps {
  sources: Source[];
}

export const SourceList = ({ sources }: SourceListProps) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sources.map((source, index) => (
            <li key={index} className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <a
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {source.title || source.uri}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
