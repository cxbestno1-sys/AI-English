import { Play, Square, Volume2, Mic, Download } from 'lucide-react'
import type { Line, ContentType } from '../types/dialogue'

interface DialogueCardProps {
  line: Line
  index: number
  speakerType: string
  playing: boolean
  onPlay: (text: string, rate: number) => void
  onStop: () => void
  onRecord: () => void
  listening: boolean
  onExport?: () => void
}

export function DialogueCard({
  line, index, speakerType, playing,
  onPlay, onStop, onRecord, listening, onExport,
}: DialogueCardProps) {
  const isDialogue = 'speaker' in line
  const speaker = isDialogue ? line.speaker : line.narrator
  const english = line.english
  const chinese = line.chinese

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      {/* Speaker badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm">
          {isDialogue ? '👤' : '📖'}
        </div>
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {speaker}
        </span>
      </div>

      {/* English text */}
      <p className="text-base font-medium text-slate-800 leading-relaxed mb-1.5">
        {english}
      </p>

      {/* Chinese translation */}
      <p className="text-sm text-slate-400 mb-4">
        {chinese}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Speed controls */}
        <div className="flex gap-1">
          <button
            onClick={() => onPlay(english, 0.5)}
            disabled={playing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-all"
          >
            <Volume2 size={12} />
            慢速
          </button>
          <button
            onClick={() => onPlay(english, 1.0)}
            disabled={playing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-all"
          >
            <Volume2 size={12} />
            正常
          </button>
        </div>

        {/* Export */}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          >
            <Download size={12} />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Record button */}
        <button
          onClick={onRecord}
          disabled={playing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            listening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-red-50 text-red-500 hover:bg-red-100'
          } disabled:opacity-40`}
        >
          <Mic size={14} />
          {listening ? '录音中...' : '跟读'}
        </button>
      </div>
    </div>
  )
}
