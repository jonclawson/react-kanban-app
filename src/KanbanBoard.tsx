import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';
import { fetchCharacters } from './api';
import type { BoardState, KanbanItem, Character, ColumnId } from './types';
import ItemForm from './TaskForm';
import Task from './Task';


export default function KanbanBoard () {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [board, setBoard] = useState<BoardState>({ todo: [], doing: [], done: [] });  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedCharId, setSelectedCharId] = useState('');

  useEffect(() => {
    fetchCharacters().then((data) => {
      setCharacters(data);
    });
  }, []);

  const handleAddItem = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !selectedCharId) return;

    const character = characters.find(c => c.id === selectedCharId)!;
    const newItem: KanbanItem = {
      id: crypto.randomUUID(),
      title,
      description: desc,
      character
    };

    setBoard(prev => ({ ...prev, todo: [...prev.todo, newItem] }));
    setTitle('');
    setDesc('');
    setSelectedCharId('');
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId as ColumnId;
    const destCol = destination.droppableId as ColumnId;

    if (sourceCol === destCol) {
      const items = Array.from(board[sourceCol]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setBoard(prev => ({ ...prev, [sourceCol]: items }));
      return;
    }

    const sourceItems = Array.from(board[sourceCol]);
    const destItems = Array.from(board[destCol]);
    const [movedItem] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedItem);

    setBoard(prev => ({
      ...prev,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    }));

    if (destCol === 'done') {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="mb-8">Rick & Morty Kanban</h1>

      <ItemForm 
        setSelectedCharId={setSelectedCharId}
        selectedCharId={selectedCharId}
        characters={characters}
        handleAddItem={handleAddItem}
        title={title}
        setTitle={setTitle}
        desc={desc}
        setDesc={setDesc}
      />

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {(['todo', 'doing', 'done'] as ColumnId[]).map((colId) => (
            <div key={colId} className="bg-slate-100 rounded-2xl p-4 flex flex-col min-h-[500px]">

              <h2 className="text-lg font-bold capitalize mb-4 px-1 flex justify-between">
                <span>{{'todo': 'To Do', 'doing': 'Doing', 'done': 'Done'}[colId]}</span>
              </h2>

              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl p-2 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-slate-200/70' : 'bg-transparent'}`}
                  >
                    {board[colId].map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`bg-white p-4 rounded-xl m-2 shadow-sm  select-none hover:shadow-md transition-shadow `}
                          >
                              <Task item={item} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );

}