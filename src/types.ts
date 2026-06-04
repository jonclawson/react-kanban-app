export interface Character {
  id: string;
  name: string;
  image: string;
}

export interface KanbanItem {
  id: string;
  title: string;
  description: string;
  character: Character;
}

export type ColumnId = 'todo' | 'doing' | 'done';

export interface BoardState {
  todo: KanbanItem[];
  doing: KanbanItem[];
  done: KanbanItem[];
}