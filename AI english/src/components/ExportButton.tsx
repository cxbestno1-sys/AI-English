import { useState, useRef } from 'react'
import { Download, ChevronDown, FileAudio, Archive } from 'lucide-react'

interface ExportButtonProps {
  onExportSingle?: () => void
  onExportAll?: () => void
  onExportMerged?: () => void
}

export function ExportDropdown({ onExportAll, onExportMerged }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useState(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  })

  const options = [
    { icon: Archive, label: '导出全部 (.zip)', action: onExportAll },
    { icon: FileAudio, label: '拼接为一段 (.wav)', action: onExportMerged },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-all"
      >
        <Download size={14} />
        导出
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50 min-w-[180px]">
          {options.map(opt => {
            const Icon = opt.icon
            return (
              <button
                key={opt.label}
                onClick={() => {
                  opt.action?.()
                  setOpen(false)
                }}
                disabled={!opt.action}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Icon size={16} className="text-slate-500" />
                <span className="text-slate-700">{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
