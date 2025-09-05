"use client"
import { ReactNode, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  className?: string
  variant?: any
  size?: any
}

export default function StartFreeButton({ children, className, variant, size }: Props) {
  const router = useRouter()

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    try {
      const raw = localStorage.getItem('querywing-user')
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.isAuthenticated) {
          router.push('/dashboard')
          return
        }
      }
    } catch {}
    router.push('/auth/sign-up')
  }

  return (
    <Button onClick={handleClick} className={className} variant={variant} size={size}>
      {children}
    </Button>
  )
}


