"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Mail, Monitor, Users, MessageCircle, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationPreferences {
  email: boolean
  browser: boolean
  leads: boolean
  conversations: boolean
  weeklyReports: boolean
}

export default function NotificationSettings({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    browser: true,
    leads: true,
    conversations: true,
    weeklyReports: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/v1/notifications?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePreference = async (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPreferences)
    
    try {
      setSaving(true)
      const response = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferences: newPreferences
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences updated'
        })
      } else {
        // Revert on error
        setPreferences(preferences)
        toast({
          title: 'Error',
          description: 'Failed to update preferences',
          variant: 'destructive'
        })
      }
    } catch (error) {
      // Revert on error
      setPreferences(preferences)
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const getToggleButton = (key: keyof NotificationPreferences, label: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="text-gray-600">{icon}</div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">
            {key === 'email' && 'Receive notifications via email'}
            {key === 'browser' && 'Show browser notifications'}
            {key === 'leads' && 'Notify when new leads are captured'}
            {key === 'conversations' && 'Notify about important conversations'}
            {key === 'weeklyReports' && 'Send weekly performance reports'}
          </p>
        </div>
      </div>
      <Button
        variant={preferences[key] ? 'default' : 'outline'}
        size="sm"
        onClick={() => togglePreference(key)}
        disabled={saving}
        className={preferences[key] ? 'bg-purple-600 hover:bg-purple-700' : ''}
      >
        {preferences[key] ? 'On' : 'Off'}
      </Button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
        </CardTitle>
        <CardDescription>
          Choose what notifications you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {getToggleButton('email', 'Email', <Mail className="w-4 h-4" />)}
        {getToggleButton('browser', 'Browser', <Monitor className="w-4 h-4" />)}
        {getToggleButton('leads', 'Leads', <Users className="w-4 h-4" />)}
        {getToggleButton('conversations', 'Conversations', <MessageCircle className="w-4 h-4" />)}
        {getToggleButton('weeklyReports', 'Weekly Reports', <BarChart3 className="w-4 h-4" />)}
      </CardContent>
    </Card>
  )
}
