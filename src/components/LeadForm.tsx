"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface LeadFormData {
  name: string
  email: string
  phone: string
  company: string
  status: string
  source: string
  tags: string[]
  notes: string
}

interface LeadFormProps {
  initialData?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-orange-100 text-orange-800' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
]

const sourceOptions = [
  'QueryWing Assistant',
  'Website Form',
  'Phone Call',
  'Email',
  'Social Media',
  'Referral',
  'Other'
]

export function LeadForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode 
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: 'QueryWing Assistant',
    tags: [],
    notes: ''
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Partial<LeadFormData>>({})

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.phone && !/^[\+]?[\d\s\-\(\)\.]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except +, -, (, ), ., and space
    const cleaned = value.replace(/[^\d\s\-\(\)\.\+]/g, '')
    
    // Limit length to 20 characters
    if (cleaned.length > 20) {
      return cleaned.substring(0, 20)
    }
    
    return cleaned
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => {
              const formattedPhone = formatPhoneNumber(e.target.value)
              setFormData(prev => ({ ...prev, phone: formattedPhone }))
              // Clear phone error when user starts typing
              if (errors.phone) {
                setErrors(prev => ({ ...prev, phone: undefined }))
              }
            }}
            placeholder="+1 (555) 123-4567"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Supports formats: +1 (555) 123-4567, 555-123-4567, 555.123.4567
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <Input
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sourceOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTag}
            disabled={!newTag.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any additional notes about this lead"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Lead' : 'Update Lead'}
        </Button>
      </div>
    </form>
  )
}
