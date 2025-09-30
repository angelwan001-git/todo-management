'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '@/types/database.types';
import { TodoItem } from './TodoItem';
import { GripVertical } from 'lucide-react';

interface SortableTodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SortableTodoItem({ todo, onUpdate, onDelete }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      <div className="flex items-center gap-2">
        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* TodoItem */}
        <div className="flex-1">
          <TodoItem
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}