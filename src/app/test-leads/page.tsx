"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestLeadsPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const testAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(endpoint)
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      }
      if (body) options.body = JSON.stringify(body)
      
      const response = await fetch(`/api${endpoint}`, options)
      const data = await response.json()
      setResults({ endpoint, status: response.status, data })
    } catch (error) {
      setResults({ endpoint, error: error.message })
    } finally {
      setLoading(null)
    }
  }

  const cleanupDemo = async () => {
    setLoading('cleanup')
    try {
      const response = await fetch('/api/cleanup-demo', { method: 'POST' })
      const data = await response.json()
      setResults({ endpoint: 'cleanup-demo', status: response.status, data })
    } catch (error) {
      setResults({ endpoint: 'cleanup-demo', error: error.message })
    } finally {
      setLoading(null)
    }
  }

  const initializeDB = async () => {
    setLoading('init-db')
    try {
      const response = await fetch('/api/init-db', { method: 'POST' })
      const data = await response.json()
      setResults({ endpoint: 'init-db', status: response.status, data })
    } catch (error) {
      setResults({ endpoint: 'init-db', error: error.message })
    } finally {
      setLoading(null)
    }
  }

  const testLeadsAPI = async () => {
    setLoading('leads-get')
    try {
      const response = await fetch('/api/v1/leads')
      const data = await response.json()
      setResults({ endpoint: 'leads-get', status: response.status, data })
    } catch (error) {
      setResults({ endpoint: 'leads-get', error: error.message })
    } finally {
      setLoading(null)
    }
  }

  const testCreateLead = async () => {
    setLoading('leads-post')
    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Lead',
          email: 'test@example.com',
          phone: '+1-555-0123',
          company: 'Test Company',
          status: 'new',
          source: 'Test Source',
          tags: ['test', 'demo'],
          notes: 'This is a test lead created via API'
        })
      })
      const data = await response.json()
      setResults({ endpoint: 'leads-post', status: response.status, data })
    } catch (error) {
      setResults({ endpoint: 'leads-post', error: error.message })
    } finally {
      setLoading(null)
    }
  }

  const testUpdateLead = async () => {
    if (!results?.data?.leads?.[0]) {
      setResults({ error: 'No leads available to update. Please create a lead first.' })
      return
    }
    
    setLoading('leads-put')
    try {
      const leadId = results.data.leads[0]
      const response = await fetch(`/api/v1/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Test Lead',
          email: 'updated@example.com',
          status: 'contacted',
          notes: 'This lead was updated via API'
        })
      })
      const data = await response.json()
      setResults({ endpoint: 'leads-put', status: response.status, data })
    } catch (error) {
      setResults({ endpoint: 'leads-put', error: error.message })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Leads API Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={cleanupDemo} 
              disabled={loading === 'cleanup'}
              variant="outline"
              className="w-full"
            >
              {loading === 'cleanup' ? 'Cleaning...' : 'Cleanup Old Demo Data'}
            </Button>
            
            <Button 
              onClick={initializeDB} 
              disabled={loading === 'init-db'}
              className="w-full"
            >
              {loading === 'init-db' ? 'Initializing...' : 'Initialize Database'}
            </Button>
          </CardContent>
        </Card>

        {/* API Testing */}
        <Card>
          <CardHeader>
            <CardTitle>API Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testLeadsAPI} 
              disabled={loading === 'leads-get'}
              variant="outline"
              className="w-full"
            >
              {loading === 'leads-get' ? 'Testing...' : 'Test GET /leads'}
            </Button>
            
            <Button 
              onClick={testCreateLead} 
              disabled={loading === 'leads-post'}
              variant="outline"
              className="w-full"
            >
              {loading === 'leads-post' ? 'Creating...' : 'Test POST /leads'}
            </Button>
            
            <Button 
              onClick={testUpdateLead} 
              disabled={loading === 'leads-put'}
              variant="outline"
              className="w-full"
            >
              {loading === 'leads-put' ? 'Updating...' : 'Test PUT /leads/[id]'}
            </Button>

            <Button 
              onClick={() => testAPI('test-lead-creation', 'POST')} 
              disabled={loading === 'test-lead-creation'}
              variant="outline"
              className="w-full"
            >
              {loading === 'test-lead-creation' ? 'Testing...' : 'Test Lead Creation'}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>1. <strong>Cleanup</strong> old demo data first</p>
            <p>2. <strong>Initialize</strong> database with new realistic data</p>
            <p>3. <strong>Test</strong> the leads API endpoints</p>
            <p>4. Check the results below for any errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {results && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Response: {results.endpoint}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
