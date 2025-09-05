'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, Copy, Download, Upload, Settings, MessageSquare, Palette, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bot } from '@/types/api';

export default function BotSettingsPage() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const botId = params.id as string;

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user && botId) {
      fetchBot();
      
      // Set up auto-refresh every 30 seconds to keep stats current
      const interval = setInterval(fetchBot, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, isLoaded, router, botId]);

  const fetchBot = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/bots?id=${botId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bot');
      }
      
      const data = await response.json();
      const apiBot = data.bot || data; // tolerate both { bot } and plain bot
      
      // Transform API bot data to match our Bot interface
      const transformedBot: Bot = {
        id: apiBot.id,
        tenantId: apiBot.tenantId,
        name: apiBot.name,
        description: apiBot.description,
        instructions: apiBot.instructions,
        status: apiBot.status,
        publicKey: apiBot.publicKey || apiBot.id,
        isActive: apiBot.status === 'active',
        createdAt: new Date(apiBot.createdAt),
        updatedAt: new Date(apiBot.updatedAt || apiBot.createdAt),
        settings: {
          theme: apiBot.settings?.theme ?? 'light',
          position: apiBot.settings?.position ?? 'bottom-right',
          welcomeMessage: apiBot.settings?.welcomeMessage ?? 'Hello! How can I help you today?',
          leadCapture: apiBot.settings?.leadCapture ?? true,
          humanHandoff: apiBot.settings?.humanHandoff ?? true,
          maxTokens: apiBot.settings?.maxTokens ?? 1000,
          temperature: apiBot.settings?.temperature ?? 0.7,
          enableLiveAgents: apiBot.settings?.enableLiveAgents ?? true,
          transferPriority: apiBot.settings?.transferPriority ?? 'fastest',
          transferTimeout: apiBot.settings?.transferTimeout ?? 30,
          gdpr: apiBot.settings?.gdpr ?? true,
          dataRetention30Days: apiBot.settings?.dataRetention30Days ?? true,
        },
        stats: {
          conversations: apiBot.conversations || 0,
          leads: apiBot.leads || 0,
          avgResponseTime: apiBot.avgResponseTime || 2.3,
          satisfaction: apiBot.satisfaction || 4.2,
        },
      };
      
      setBot(transformedBot);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bot settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBot = async () => {
    if (!bot) return;

    try {
      setSaving(true);
      
      // Prepare the data to send to the API
      const updateData = {
        botId: bot.id,
        name: bot.name,
        description: bot.description,
        instructions: bot.instructions,
        status: bot.isActive ? 'active' : 'inactive',
        settings: {
          theme: bot.settings.theme,
          position: bot.settings.position,
          welcomeMessage: bot.settings.welcomeMessage,
          leadCapture: bot.settings.leadCapture,
          humanHandoff: bot.settings.humanHandoff,
          maxTokens: bot.settings.maxTokens,
          temperature: bot.settings.temperature,
          enableLiveAgents: bot.settings.enableLiveAgents,
          transferPriority: bot.settings.transferPriority,
          transferTimeout: bot.settings.transferTimeout,
          gdpr: bot.settings.gdpr,
          dataRetention30Days: bot.settings.dataRetention30Days,
        }
      };
      
      // Update bot via API
      const response = await fetch('/api/v1/bots', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save bot');
      }
      
      const data = await response.json();
      
      // Update local bot state with the response
      if (data.bot) {
        setBot(prev => prev ? {
          ...prev,
          name: data.bot.name,
          description: data.bot.description,
          instructions: data.bot.instructions,
          isActive: data.bot.status === 'active',
          settings: {
            ...prev.settings,
            ...(data.bot.settings || {})
          }
        } : null);
      }
      
      toast({
        title: 'Success',
        description: 'Bot settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to save bot settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = () => {
    if (!bot) return;
    
    // Generate proper embed code with all necessary attributes
    const embedCode = `<!-- QueryWing Chatbot Widget -->
<script async src="${window.location.origin}/widget.js" 
  data-bot-id="${bot.id}" 
  data-bot-name="${bot.name || 'Chatbot'}" 
  data-primary-color="#6366f1" 
  data-position="${bot.settings?.position || 'bottom-right'}" 
  data-theme="${bot.settings?.theme || 'light'}"
  data-welcome-message="${bot.settings?.welcomeMessage || 'Hello! How can I help you today?'}"
></script>`;
    
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard. Add this to your website HTML.',
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: MessageSquare },
    { id: 'live-agents', label: 'Live Agents', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (!isLoaded || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bot not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The bot you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/dashboard/bots')}>
              Back to Bots
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/bots')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {bot.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={bot.isActive ? 'default' : 'secondary'}>
                {bot.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last updated {bot.updatedAt.toLocaleDateString()} at {bot.updatedAt.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/bots/${bot.id}/preview`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/demo-external.html', '_blank')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Test External
          </Button>
          <Button
            variant="outline"
            onClick={copyEmbedCode}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Embed
          </Button>
          <Button
            variant="outline"
            onClick={fetchBot}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
          <Button
            onClick={saveBot}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Conversations</span>
                <span className="font-semibold">{bot.stats.conversations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Leads Captured</span>
                <span className="font-semibold">{bot.stats.leads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                <span className="font-semibold">{bot.stats.avgResponseTime}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</span>
                <span className="font-semibold">{bot.stats.satisfaction}/5</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic information and configuration for your bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bot Name
                    </label>
                    <input
                      type="text"
                      value={bot.name}
                      onChange={(e) => setBot({ ...bot, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Enter bot name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={bot.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setBot({ ...bot, isActive: e.target.value === 'active' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={bot.description}
                    onChange={(e) => setBot({ ...bot, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Describe what this bot does"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Instructions
                  </label>
                  <textarea
                    value={bot.instructions}
                    onChange={(e) => setBot({ ...bot, instructions: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Provide instructions for how the AI should behave and respond"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    These instructions will be used as the system prompt for the AI model.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how your chatbot widget looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={bot.settings.theme}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, theme: e.target.value as 'light' | 'dark' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (follows website)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position
                    </label>
                    <select
                      value={bot.settings.position}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, position: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={bot.settings.welcomeMessage}
                    onChange={(e) => setBot({
                      ...bot,
                      settings: { ...bot.settings, welcomeMessage: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter welcome message"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'behavior' && (
            <Card>
              <CardHeader>
                <CardTitle>Behavior Settings</CardTitle>
                <CardDescription>
                  Configure how your bot behaves and responds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={bot.settings.maxTokens}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, maxTokens: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="100"
                      max="4000"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Maximum length of AI responses (100-4000)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temperature
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={bot.settings.temperature}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, temperature: parseFloat(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>Focused (0)</span>
                      <span>{bot.settings.temperature}</span>
                      <span>Creative (2)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lead Capture
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Collect visitor information during conversations
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={bot.settings.leadCapture}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, leadCapture: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Human Handoff
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow conversations to be transferred to human agents
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={bot.settings.humanHandoff}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, humanHandoff: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'live-agents' && (
            <Card>
              <CardHeader>
                <CardTitle>Live Agents Settings</CardTitle>
                <CardDescription>
                  Configure how your bot interacts with live agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enable Live Agents
                  </label>
                  <select
                    value={bot.settings.enableLiveAgents ? 'enabled' : 'disabled'}
                    onChange={(e) => setBot({
                      ...bot,
                      settings: { ...bot.settings, enableLiveAgents: e.target.value === 'enabled' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    When enabled, visitors can be transferred to a live agent for immediate assistance.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transfer Priority
                  </label>
                  <select
                    value={bot.settings.transferPriority}
                    onChange={(e) => setBot({
                      ...bot,
                      settings: { ...bot.settings, transferPriority: e.target.value as 'fastest' | 'cheapest' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="fastest">Fastest Agent</option>
                    <option value="cheapest">Cheapest Agent</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose how the bot prioritizes transferring to a live agent.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transfer Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={bot.settings.transferTimeout}
                    onChange={(e) => setBot({
                      ...bot,
                      settings: { ...bot.settings, transferTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="5"
                    max="60"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Time in seconds to wait for a live agent response before transferring.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and privacy settings for your bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Public Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bot.publicKey}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(bot.publicKey);
                        toast({
                          title: 'Copied!',
                          description: 'Public key copied to clipboard',
                        });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This key is used to identify your bot in the widget embed code.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Data Retention
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically delete conversation data after 30 days
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!bot.settings.dataRetention30Days}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, dataRetention30Days: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        GDPR Compliance
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable GDPR-compliant data handling
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!bot.settings.gdpr}
                      onChange={(e) => setBot({
                        ...bot,
                        settings: { ...bot.settings, gdpr: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
