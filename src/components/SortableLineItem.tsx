import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { LineItem } from '../types/financial';

interface Props {
  item: LineItem & { id: string };
}

export default function SortableLineItem({ item }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${
        isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-1 hover:bg-gray-50 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">
          {item.description}
        </p>
        <p className="text-xs text-gray-500">{item.section}</p>
      </div>

      <p className={`text-sm font-medium tabular-nums ${
        item.amount < 0 ? 'text-red-600' : 'text-green-600'
      }`}>
        {new Intl.NumberFormat('uz-UZ', {
          style: 'decimal',
          minimumFractionDigits: 2
        }).format(Math.abs(item.amount))}
      </p>
    </div>
  );
}