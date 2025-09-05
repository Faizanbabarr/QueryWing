"use client"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Header from '@/components/Header'

export default function SuccessPage(){
  const search = useSearchParams()
  const [embed,setEmbed] = useState<string | null>(null)
  const sessionId = search.get('session_id')

  useEffect(()=>{
    const e = localStorage.getItem('querywing-embed')
    if (e) setEmbed(e)
  },[])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuth={false} showDashboardNav={false} />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Payment Successful</h1>
        <p className="mb-6">Your workspace is being prepared. If you used the test setup, your embed may already be available below.</p>
        {embed ? (
          <>
            <p className="font-medium mb-2">Embed this on your site:</p>
            <pre className="bg-white border rounded p-3 overflow-x-auto text-sm">{embed}</pre>
          </>
        ) : (
          <p className="text-sm text-gray-600 mb-4">Embed will appear after provisioning completes (via webhook).</p>
        )}
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
          <Link href="/demo"><Button variant="outline">View Demo</Button></Link>
        </div>
      </div>
    </div>
  )
}


