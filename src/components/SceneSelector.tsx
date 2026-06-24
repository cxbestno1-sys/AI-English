import { SCENES } from '../utils/prompts'

interface SceneSelectorProps {
  selected: string
  onChange: (scene: string) => void
}

export function SceneSelector({ selected, onChange }: SceneSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        场景
      </label>
      <div className="flex flex-wrap gap-2">
        {SCENES.map(scene => (
          <button
            key={scene.id}
            onClick={() => onChange(scene.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selected === scene.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
            }`}
          >
            <span>{scene.icon}</span>
            <span>{scene.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
