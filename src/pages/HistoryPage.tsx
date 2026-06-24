import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Calendar } from 'lucide-react'
import { removeFromHistory } from '../utils/storage'
import type { GeneratedContent } from '../types/dialogue'

export function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<GeneratedContent[]>(() => {
    return JSON.parse(localStorage.getItem('speaknow_history') || '[]')
  })

  const handleDelete = (id: string) => {
    removeFromHistory(id)
    setHistory(history.filter(h => h.id !== id))
  }

  const handleOpen = (id: string) => {
    navigate('/learn/' + id)
  }

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">History</h1>

      {history.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">No learning history yet</p>
          <p className="text-xs mt-1">Go home to generate some content!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => handleOpen(item.id)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'dialogue' ? 'bg-primary-100 text-primary-600' : 'bg-purple-100 text-purple-600'}`}>
                      {item.type === 'dialogue' ? '💬 Dialogue' : '📖 Story'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={10} />{new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.lines[0]?.english}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-400 p-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
