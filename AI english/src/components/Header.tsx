import { useNavigate } from 'react-router-dom'
import { Volume2, ChevronDown } from 'lucide-react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
      >
        ←
      </button>
      <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      <div className="w-10" />
    </div>
  )
}
