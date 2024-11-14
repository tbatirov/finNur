import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { LineItem } from '../types/financial';
import SortableLineItem from './SortableLineItem';

interface Props {
  sectionId: string;
  title: string;
  items: LineItem[];
}

export default function StatementSection({ sectionId, title, items }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: { type: 'section' }
  });

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Total:</span>
          <span className={`text-sm font-medium ${
            total < 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {new Intl.NumberFormat('uz-UZ', {
              style: 'decimal',
              minimumFractionDigits: 2
            }).format(Math.abs(total))}
          </span>
        </div>
      </div>

      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableLineItem 
              key={item.id} 
              item={item}
            />
          ))}
        </div>
      </SortableContext>

      {items.length === 0 && (
        <div className={`py-8 text-center rounded-lg border-2 border-dashed transition-colors ${
          isOver 
            ? 'border-blue-300 bg-blue-50/50 text-blue-600'
            : 'border-gray-200 text-gray-400'
        }`}>
          Drop items here
        </div>
      )}
    </div>
  );
}