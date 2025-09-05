"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Key, 
  Mail, 
  Phone,
  Building,
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  Settings as SettingsIcon,
  Lock,
  Sun,
  Moon,
  Monitor,
  Languages,
  CreditCard,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react'
import Header from '@/components/Header'
import AddOnsManager from '@/components/AddOnsManager'
import NotificationSettings from '@/components/NotificationSettings'
import { useAuth } from '@/hooks/use-auth'

interface UserSettings {
  profile: {
    name: string
    email: string
    phone?: string
    company?: string
    website?: string
    avatar?: string
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    lastPasswordChange: string
  }
  notifications: {
    email: boolean
    browser: boolean
    leads: boolean
    conversations: boolean
    weeklyReports: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    language: string
  }
}

export default function SettingsPage() {
  const { user, isLoaded } = useAuth()
  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0,0,0);
        }
        40%, 43% {
          transform: translate3d(0,-30px,0);
        }
        70% {
          transform: translate3d(0,-15px,0);
        }
        90% {
          transform: translate3d(0,-4px,0);
        }
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slide-in-left {
        animation: slideInLeft 0.6s ease-out forwards;
      }
      
      .animate-pulse-slow {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      .animate-bounce-slow {
        animation: bounce 2s infinite;
      }
      
      .shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .float {
        animation: float 3s ease-in-out infinite;
      }
      
      .gradient-border {
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        padding: 2px;
        border-radius: 0.5rem;
      }
      
      .gradient-border > div {
        background: white;
        border-radius: 0.375rem;
      }
      
      .status-glow {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
      }
      
      .status-glow:hover {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      phone: '',
      company: '',
      website: ''
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      lastPasswordChange: ''
    },
    notifications: {
      email: true,
      browser: true,
      leads: true,
      conversations: true,
      weeklyReports: false
    },
    appearance: {
      theme: 'light',
      language: 'en'
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    loadUserSettings()
    // Apply previously chosen theme
    try {
      const stored = localStorage.getItem('querywing-settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.appearance?.theme) applyTheme(parsed.appearance.theme)
      }
    } catch {}
  }, [])

  const loadUserSettings = () => {
    try {
      const userData = localStorage.getItem('querywing-user')
      if (userData) {
        const user = JSON.parse(userData)
        setSettings(prev => ({
          ...prev,
          profile: {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            company: user.company || '',
            website: user.website || ''
          }
        }))
      }
      // merge saved settings if exist
      const stored = localStorage.getItem('querywing-settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings(prev => ({
          ...prev,
          ...parsed,
          profile: { ...prev.profile, ...(parsed.profile || {}) }
        }))
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  const updateNotification = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
    // Request permissions if enabling browser notifications
    if (field === 'browser' && value && typeof window !== 'undefined' && 'Notification' in window) {
      try { Notification.requestPermission?.() } catch {}
    }
  }

  const updateAppearance = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }))
    if (field === 'theme') applyTheme(value as any)
    if (field === 'language') applyLanguage(value)
  }

  function applyTheme(theme: 'light'|'dark'|'auto') {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'auto' && prefersDark)
    root.classList.toggle('dark', isDark)
  }

  function applyLanguage(lang: string) {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('lang', lang)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update localStorage
      const userData = localStorage.getItem('querywing-user')
      if (userData) {
        const user = JSON.parse(userData)
        const updatedUser = { ...user, ...settings.profile }
        localStorage.setItem('querywing-user', JSON.stringify(updatedUser))
      }
      // Persist app settings
      localStorage.setItem('querywing-settings', JSON.stringify(settings))
      // Persist session timeout for idle logout helper
      localStorage.setItem('querywing-session-timeout-mins', String(settings.security.sessionTimeout))
      
      // Show success feedback
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.new.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      // Update password in localStorage
      const userData = localStorage.getItem('querywing-user')
      if (userData) {
        const user = JSON.parse(userData)
        if (user.password && passwordData.current && user.password !== passwordData.current) {
          alert('Current password is incorrect')
          return
        }
        user.password = passwordData.new
        localStorage.setItem('querywing-user', JSON.stringify(user))
      }

      // Update settings
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          lastPasswordChange: new Date().toISOString()
        }
      }))

      // Clear password fields
      setPasswordData({ current: '', new: '', confirm: '' })
      
      console.log('Password changed successfully')
    } catch (error) {
      console.error('Error changing password:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showAuth={false} showDashboardNav={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuth={false} showDashboardNav={true} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden mb-8">
          {/* Floating Background Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                Settings & Preferences
              </h1>
              <p className="text-gray-600 text-lg">Customize your account, security, and interface preferences</p>
            </div>
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal and company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-orange-500" />
                      Full Name
                    </label>
                    <Input
                      value={settings.profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-orange-500" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      placeholder="Enter your email"
                      className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-orange-500" />
                      Phone Number
                    </label>
                    <Input
                      value={settings.profile.phone}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-orange-500" />
                      Company
                    </label>
                    <Input
                      value={settings.profile.company}
                      onChange={(e) => updateProfile('company', e.target.value)}
                      placeholder="Enter your company name"
                      className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-orange-500" />
                    Website
                  </label>
                  <Input
                    value={settings.profile.website}
                    onChange={(e) => updateProfile('website', e.target.value)}
                    placeholder="Enter your website URL"
                    className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Security Settings */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Password Change */}
                <div className="space-y-6">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-red-500" />
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                          placeholder="Enter current password"
                          className="border-gray-200 focus:border-red-400 focus:ring-red-400 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                        placeholder="Enter new password"
                        className="border-gray-200 focus:border-red-400 focus:ring-red-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className="border-gray-200 focus:border-red-400 focus:ring-red-400 transition-all duration-200"
                    />
                  </div>
                  <Button 
                    onClick={changePassword} 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                {/* Security Options */}
                <div className="space-y-6">
                  <h4 className="font-medium text-gray-900">Security Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div>
                        <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button
                        variant={settings.security.twoFactorEnabled ? 'default' : 'outline'}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            twoFactorEnabled: !prev.security.twoFactorEnabled
                          }
                        }))}
                        className={`transition-all duration-200 ${
                          settings.security.twoFactorEnabled 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                        }`}
                      >
                        {settings.security.twoFactorEnabled ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Disabled
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div>
                        <h5 className="font-medium text-gray-900">Session Timeout</h5>
                        <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                      </div>
                      <select
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            sessionTimeout: parseInt(e.target.value)
                          }
                        }))}
                        className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 border border-red-200 bg-white text-gray-900 transition-all duration-200"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Appearance */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 animate-slide-in-left">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3">
                    <Palette className="w-4 h-4 text-purple-600" />
                  </div>
                  Appearance
                </CardTitle>
                <CardDescription>Customize your interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Monitor className="w-4 h-4 mr-2 text-purple-500" />
                    Theme
                  </label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => updateAppearance('theme', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border border-purple-200 bg-white text-gray-900 transition-all duration-200"
                  >
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌙 Dark</option>
                    <option value="auto">🔄 Auto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Languages className="w-4 h-4 mr-2 text-purple-500" />
                    Language
                  </label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => updateAppearance('language', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border border-purple-200 bg-white text-gray-900 transition-all duration-200"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Account Status */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
                  <span className="text-sm text-gray-600">Plan</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {(typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('querywing_tenant_plan')||'"free"'))) || 'free'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200 shadow-sm">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">
                    {new Date().toLocaleDateString(settings.appearance.language || 'en')}
                  </span>
                </div>
                <div className="flex items-end justify-end gap-2 pt-2">
                  <a href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    Upgrade
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Add-ons Management */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3">
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                  Add-ons & Credits
                </CardTitle>
                <CardDescription>Manage your bot credits, additional bots, and live agents</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.tenantId && <AddOnsManager tenantId={user.tenantId} />}
              </CardContent>
            </Card>

            {/* Enhanced Notification Settings */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              {isLoaded && (
                <NotificationSettings userId={(user as any)?.id || 'demo-user-1'} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
