import { Sparkles } from 'lucide-react';

export function ChatWelcome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Pixis AI</h1>
        <p className="text-muted-foreground">
          Start a conversation by typing your question below.
        </p>
      </div>
    </div>
  );
}