'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Settings, Smartphone, Monitor, Tablet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bot } from '@/types/api';

export default function BotPreviewPage() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const botId = params.id as string;

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (user && botId) {
      fetchBot();
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
      const apiBot = data.bot;
      
      // Transform API bot data to match our Bot interface
      const transformedBot: Bot = {
        id: apiBot.id,
        tenantId: apiBot.tenantId,
        name: apiBot.name,
        description: apiBot.description,
        instructions: apiBot.instructions,
        publicKey: apiBot.publicKey || apiBot.id,
        isActive: apiBot.status === 'active',
        status: apiBot.status,
        createdAt: new Date(apiBot.createdAt),
        updatedAt: new Date(apiBot.createdAt), // API doesn't provide updatedAt, use createdAt
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
          avgResponseTime: 2.3, // This would need to be calculated from actual message timestamps
          satisfaction: 4.2, // This would need to be collected from user feedback
        },
      };
      
      setBot(transformedBot);
    } catch (error) {
      console.error('Error fetching bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bot for preview',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  const getDeviceWidth = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-80';
      case 'tablet':
        return 'w-96';
      case 'desktop':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Preview: {bot.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Test how your chatbot will appear and behave on your website
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchBot}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Device Preview</CardTitle>
              <CardDescription>
                Test how your bot looks on different devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => setDeviceType('desktop')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    deviceType === 'desktop'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  onClick={() => setDeviceType('tablet')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    deviceType === 'tablet'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                  Tablet
                </button>
                <button
                  onClick={() => setDeviceType('mobile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    deviceType === 'mobile'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Bot Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Bot Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <div className="mt-1">
                  <Badge variant={bot.isActive ? 'default' : 'secondary'}>
                    {bot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                <div className="mt-1 font-medium">{bot.settings.theme}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Position</span>
                <div className="mt-1 font-medium">{bot.settings.position}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Lead Capture</span>
                <div className="mt-1">
                  <Badge variant={bot.settings.leadCapture ? 'default' : 'secondary'}>
                    {bot.settings.leadCapture ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Human Handoff</span>
                <div className="mt-1">
                  <Badge variant={bot.settings.humanHandoff ? 'default' : 'secondary'}>
                    {bot.settings.humanHandoff ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Website Preview</CardTitle>
              <CardDescription>
                This is how your chatbot will appear on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${getDeviceWidth()} mx-auto`}>
                {/* Mock Website Content */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Website Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Your Website</h2>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Website Content */}
                  <div className="p-6 min-h-[500px] relative">
                    <div className="max-w-2xl mx-auto">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Welcome to Our Website
                      </h1>
                      <p className="text-gray-600 mb-6">
                        This is a preview of how your chatbot will appear on your website. 
                        The chatbot widget will be positioned according to your settings.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Product Features</h3>
                          <p className="text-sm text-gray-600">
                            Learn about our amazing features and capabilities.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
                          <p className="text-sm text-gray-600">
                            Get help and support when you need it.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chatbot Widget Preview */}
                    <div className={`fixed ${bot.settings.position === 'bottom-right' ? 'bottom-4 right-4' : 
                                       bot.settings.position === 'bottom-left' ? 'bottom-4 left-4' :
                                       bot.settings.position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'}`}>
                      {/* Chat Launcher */}
                      <div className={`w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors ${
                        bot.settings.theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : ''
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>

                      {/* Chat Window Preview (Collapsed) */}
                      <div className={`mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl ${
                        bot.settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''
                      }`}>
                        <div className={`p-4 border-b ${bot.settings.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <div>
                                <div className={`font-semibold ${bot.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {bot.name}
                                </div>
                                <div className="text-xs text-gray-500">Online</div>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className={`text-sm ${bot.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {bot.settings.welcomeMessage}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your message..."
                              className={`flex-1 px-3 py-2 text-sm border rounded-md ${
                                bot.settings.theme === 'dark' 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                            />
                            <button className={`px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                              bot.settings.theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : ''
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  • This preview shows how your chatbot will appear on your website
                </p>
                <p>
                  • The widget position is set to: <strong>{bot.settings.position}</strong>
                </p>
                <p>
                  • Theme is set to: <strong>{bot.settings.theme}</strong>
                </p>
                <p>
                  • Welcome message: <strong>"{bot.settings.welcomeMessage}"</strong>
                </p>
                <p>
                  • Lead capture is <strong>{bot.settings.leadCapture ? 'enabled' : 'disabled'}</strong>
                </p>
                <p>
                  • Human handoff is <strong>{bot.settings.humanHandoff ? 'enabled' : 'disabled'}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
