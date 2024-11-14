import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { LineItem } from '../types/financial';

interface Props {
  item: LineItem;
}

export function DraggableLineItem({ item }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.section });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 bg-white rounded-lg ${
        isDragging ? 'shadow-lg' : 'hover:bg-gray-50'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex-1">
        <p className="font-medium">{item.description}</p>
        <p className="text-sm text-gray-500">{item.section}</p>
      </div>

      <p className={`text-right font-medium ${
        item.amount < 0 ? 'text-red-600' : 'text-green-600'
      }`}>
        {new Intl.NumberFormat('uz-UZ', {
          style: 'decimal',
          minimumFractionDigits: 2
        }).format(item.amount)}
      </p>
    </div>
  );
}