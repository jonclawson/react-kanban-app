import type { KanbanItem } from "./types";

export default function Task ({ item }: { item: KanbanItem;  }) {
  return (
    <div>
      <h3 className="font-bold text-slate-800">{item.title}</h3>
      {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
      
      <div className="mt-4 flex items-center gap-2 border-t pt-3 border-slate-100">
        <img src={item.character.image} alt={item.character.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" />
        <span className="text-xs font-medium text-slate-600 truncate">{item.character.name}</span>
      </div>
    </div>
  )
}