'use client'

import { useState, useRef } from 'react'
import { ImagePlus, Loader2, X, RefreshCw } from 'lucide-react'
import { csrfFetch } from '@/lib/csrf-client'

interface Props {
  logoUrl: string
  onChangeUrl: (url: string) => void
  folderPrefix?: string
}

export function CompanyLogoUploader({
  logoUrl,
  onChangeUrl,
  folderPrefix = 'connect-plus-company-logos',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(file: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, SVG)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await csrfFetch(`/api/upload?folder=${encodeURIComponent(folderPrefix)}`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.url) {
        onChangeUrl(data.url)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload company logo')
    } finally {
      setUploading(false)
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-neutral-300">
        Company Logo
      </label>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
          }
        }}
      />

      {logoUrl ? (
        /* Image Preview Box */
        <div className="p-4 rounded-2xl bg-[#191919] border border-[#2E2E2E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#141414] border border-[#2B2B2B] flex items-center justify-center overflow-hidden p-2">
              <img src={logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Logo Uploaded</p>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate max-w-[220px] sm:max-w-xs">
                {logoUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Replace Logo"
            >
              <RefreshCw size={14} className={uploading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => onChangeUrl('')}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Remove Logo"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Screenshot Drag & Drop Box */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`py-10 px-6 rounded-2xl bg-[#191919] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${
            dragActive
              ? 'border-[#10B981] bg-[#10B981]/5'
              : 'border-[#2E2E2E] hover:border-neutral-500'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
              <span className="text-xs font-semibold text-neutral-300">Uploading logo to DigitalOcean...</span>
            </div>
          ) : (
            <>
              {/* Image Plus Icon from Figma Screenshot */}
              <div className="p-3 rounded-xl bg-neutral-800/60 text-neutral-400 group-hover:text-white group-hover:bg-neutral-800 transition-all">
                <ImagePlus size={28} />
              </div>
              <p className="text-xs font-medium text-neutral-400 text-center leading-relaxed">
                Take a picture and leave it here or click to select a photo.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
