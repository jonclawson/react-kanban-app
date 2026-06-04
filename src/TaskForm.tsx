import type { Character } from "./types";

export default function TaskForm({ setSelectedCharId, selectedCharId, characters, handleAddItem, title, setTitle, desc, setDesc }: {
  setSelectedCharId: React.Dispatch<React.SetStateAction<string>>;
  selectedCharId: string;
  characters: Character[];
  handleAddItem: (e: React.SubmitEvent<HTMLFormElement>) => void;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  desc: string;
  setDesc: React.Dispatch<React.SetStateAction<string>>;


}) {

  return (
          <form onSubmit={handleAddItem} className="p-4 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end ">
        <div>
          <label className="block mb-1">Task Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded-md bg-white" required />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full p-2 border rounded-md bg-white" />
        </div>
        <div>
          <label className="block  mb-1">Character</label>
          <select value={selectedCharId} onChange={e => setSelectedCharId(e.target.value)} className="w-full p-2 border rounded-md bg-white">
            <option value="">Select a character</option>
            {characters.map(char => (
              <option key={char.id} value={char.id}>{char.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2 rounded-md transition-colors">
          Add Task
        </button>
      </form>
  )
}