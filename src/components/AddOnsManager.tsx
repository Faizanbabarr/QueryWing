"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { getPlanConfig } from '@/lib/plan-config'

interface UsageData {
  plan: string
  limits: {
    botCredits: number
    maxBots: number
    maxLiveAgents: number
  }
  current: {
    botCredits: number
    bots: number
    liveAgents: number
  }
  usage: {
    botCredits: {
      used: number
      total: number
      percentage: number
    }
    bots: {
      used: number
      total: number
      percentage: number
    }
    liveAgents: {
      used: number
      total: number
      percentage: number
    }
  }
  analytics: {
    totalConversations: number
    totalLeads: number
    totalTokensUsed: number
    totalCost: number
  }
}

export default function AddOnsManager({ tenantId }: { tenantId: string }) {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsageData()
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchUsageData, 30000)
    return () => clearInterval(interval)
  }, [tenantId])

  const fetchUsageData = async () => {
    try {
      const response = await fetch(`/api/v1/usage?tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setUsageData(data)
      } else {
        throw new Error('Failed to fetch usage data')
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
      toast({
        title: "Error",
        description: "Failed to load usage data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseAddon = async (addonType: string, quantity: number) => {
    try {
      const response = await fetch('/api/checkout/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addonType,
          quantity,
          tenantId
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error purchasing addon:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase addon. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!usageData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load usage data</p>
      </div>
    )
  }

  const planConfig = getPlanConfig(usageData.plan)

  return (
    <div className="space-y-6">
      {/* Current Usage & Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage & Limits</CardTitle>
          <CardDescription>
            Your current plan: <Badge variant="outline">{usageData.plan}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bot Credits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Bot Credits</span>
              <span className="text-sm text-gray-600">
                {usageData.usage.botCredits.used} / {usageData.usage.botCredits.total === -1 ? '∞' : usageData.usage.botCredits.total}
              </span>
            </div>
            <Progress 
              value={usageData.usage.botCredits.percentage} 
              className="h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {usageData.usage.botCredits.total === -1 ? 'Unlimited credits included' : `${usageData.usage.botCredits.total} credits included`}
            </p>
          </div>

          {/* Bots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Bots</span>
              <span className="text-sm text-gray-600">
                {usageData.usage.bots.used} / {usageData.usage.bots.total}
              </span>
            </div>
            <Progress 
              value={usageData.usage.bots.percentage} 
              className="h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {usageData.usage.bots.total} bots included
            </p>
          </div>

          {/* Live Agents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Live Agents</span>
              <span className="text-sm text-gray-600">
                {usageData.usage.liveAgents.used} / {usageData.usage.liveAgents.total === -1 ? '∞' : usageData.usage.liveAgents.total}
              </span>
            </div>
            <Progress 
              value={usageData.usage.liveAgents.percentage} 
              className="h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {usageData.usage.liveAgents.total === -1 ? 'Unlimited agents included' : `${usageData.usage.liveAgents.total} agents included`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Add-ons</CardTitle>
          <CardDescription>
            Need more capacity? Purchase additional features as you grow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Additional Bot Credits */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Additional Bot Credits</h3>
                <p className="text-sm text-gray-600">Extra message credits for your chatbots</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">$0.15</div>
                <div className="text-sm text-gray-500">per message</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePurchaseAddon('credits', 1000)}
              >
                Buy 1000 Credits
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePurchaseAddon('credits', 5000)}
              >
                Buy 5000 Credits
              </Button>
            </div>
          </div>

          {/* Additional Bots */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Additional Bots</h3>
                <p className="text-sm text-gray-600">Add more chatbots to your workspace</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">$19</div>
                <div className="text-sm text-gray-500">per bot/month</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePurchaseAddon('bots', 1)}
              >
                Buy 1 Bot
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePurchaseAddon('bots', 5)}
              >
                Buy 5 Bots
              </Button>
            </div>
          </div>

          {/* Live Agents */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Live Agents</h3>
                <p className="text-sm text-gray-600">Human support for complex queries</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">$40</div>
                <div className="text-sm text-gray-500">per agent/month</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePurchaseAddon('agents', 1)}
              >
                Buy 1 Agent
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePurchaseAddon('agents', 3)}
              >
                Buy 3 Agents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
