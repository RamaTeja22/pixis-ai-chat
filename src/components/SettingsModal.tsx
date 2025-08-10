'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Eye, EyeOff, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { chatAPI } from '@/lib/api';

export function SettingsModal() {
  const [open, setOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('');
  const [connectionStatus, setConnectionStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = React.useState(false);

  const {
    model,
    setModel,
    showFollowUps,
    setShowFollowUps,
    messageWidth,
    setMessageWidth,
    theme,
    setTheme,
  } = useChatStore();

  const models = [
    { value: 'Balanced', label: 'Balanced' },
    { value: 'Creative', label: 'Creative' },
    { value: 'Precise', label: 'Precise' },
  ];

  const messageWidthOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'wide', label: 'Wide' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const success = await chatAPI.testConnection();
      setConnectionStatus(success ? 'success' : 'error');
    } catch {
      setConnectionStatus('error');
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
      // This would require a clearHistory function in the store
      console.log('Clear history');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your chat experience and configure API settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General</h3>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((modelOption) => (
                    <SelectItem key={modelOption.value} value={modelOption.value}>
                      {modelOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(newTheme) => {
                setTheme(newTheme as 'light' | 'dark' | 'system');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((themeOption) => (
                    <SelectItem key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current theme: {theme} | DOM class: {typeof document !== 'undefined' ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light') : 'unknown'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-width">Message Width</Label>
              <Select value={messageWidth} onValueChange={setMessageWidth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message width" />
                </SelectTrigger>
                <SelectContent>
                  {messageWidthOptions.map((widthOption) => (
                    <SelectItem key={widthOption.value} value={widthOption.value}>
                      {widthOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Data Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data & Privacy</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-followups">Show Follow-up Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Display suggested follow-up questions
                </p>
              </div>
              <Switch
                id="show-followups"
                checked={showFollowUps}
                onCheckedChange={setShowFollowUps}
              />
            </div>

            <div className="pt-4">
              <Button variant="outline" onClick={clearHistory} className="w-full">
                Clear Conversation History
              </Button>
            </div>
          </div>

          <Separator />

          {/* API Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="base-url">LibreChat Base URL</Label>
              <Input
                id="base-url"
                type="url"
                placeholder="https://your-libreachat-instance.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="flex items-center gap-2"
              >
                {connectionStatus === 'testing' ? (
                  <TestTube className="h-4 w-4 animate-spin" />
                ) : connectionStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : connectionStatus === 'error' ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                Test Connection
              </Button>
              {connectionStatus === 'success' && (
                <span className="text-sm text-green-600">Connection successful!</span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-sm text-red-600">Connection failed</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}