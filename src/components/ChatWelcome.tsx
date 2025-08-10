import { Sparkles } from 'lucide-react';
import { PromptForm } from './PromptForm';

export function ChatWelcome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-start pt-20 px-4 max-w-4xl mx-auto w-full">
      {/* Logo and Title */}
      <div className="text-center mb-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-6">
          <Sparkles className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Pixis AI</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ask anything and get comprehensive answers with sources
        </p>
      </div>
      
      {/* Prominent Search Input */}
      <div className="w-full max-w-3xl">
        <PromptForm />
      </div>
      
      {/* Additional Info */}
      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Powered by advanced AI • Sources included • Free to use</p>
      </div>
    </div>
  );
}