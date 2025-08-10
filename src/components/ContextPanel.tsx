'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, FileText } from 'lucide-react';
import { useChatStore, Citation } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

// Source card component
const SourceCard = ({ citation }: { citation: Citation }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {citation.favicon ? (
              <img
                src={citation.favicon}
                alt=""
                className="w-4 h-4 rounded-sm mt-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {citation.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {citation.domain}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open(citation.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Related result component
const RelatedResult = ({ title, description, url }: { title: string; description: string; url: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function ContextPanel() {
  const { currentConversation, showSources } = useChatStore();
  
  // Get citations from the last assistant message
  const lastAssistantMessage = currentConversation?.messages
    .filter(m => m.role === 'assistant')
    .pop();

  const citations = lastAssistantMessage?.citations || [];
  const hasCitations = citations.length > 0;

  // Mock related results (in a real app, this would come from the API)
  const relatedResults = [
    {
      title: "Next.js App Router: The Complete Guide",
      description: "Learn how to build modern web applications with Next.js 14 and the App Router.",
      url: "https://nextjs.org/docs/app"
    },
    {
      title: "React Server Components Explained",
      description: "Understanding the new paradigm of server and client components in React.",
      url: "https://react.dev/learn/server-components"
    },
    {
      title: "Tailwind CSS Best Practices",
      description: "Tips and tricks for writing maintainable CSS with Tailwind CSS.",
      url: "https://tailwindcss.com/docs/best-practices"
    }
  ];

  if (!currentConversation) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Start a conversation to see sources and related results</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Sources Section */}
        {showSources && hasCitations && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sources</h3>
              <Badge variant="secondary">{citations.length}</Badge>
            </div>
            <AnimatePresence>
              <div className="space-y-2">
                {citations.map((citation) => (
                  <SourceCard key={citation.id} citation={citation} />
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}

        {/* Related Results Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Related Results</h3>
          <AnimatePresence>
            <div className="space-y-2">
              {relatedResults.map((result, index) => (
                <RelatedResult key={index} {...result} />
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Empty state when no sources */}
        {showSources && !hasCitations && (
          <div className="text-center text-muted-foreground py-8">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sources available for this response</p>
          </div>
        )}
      </div>
    </div>
  );
}
