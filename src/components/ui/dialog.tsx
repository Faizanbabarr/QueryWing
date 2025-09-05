"use client"

import { useEffect, useRef } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function Dialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  variant = 'info'
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      iconBg: 'bg-red-100'
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      iconBg: 'bg-yellow-100'
    },
    info: {
      icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconBg: 'bg-blue-100'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              className={styles.confirmButton}
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
