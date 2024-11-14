import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { GeneratedStatement, LineItem } from '../types/financial';
import StatementSection from './StatementSection';
import { SECTION_TITLES, getSectionForAccount } from '../services/statement-structure';
import { logger } from '../services/logger';
import { TransitionValidator } from '../services/rag/transition-validator';

interface Props {
  statement: GeneratedStatement;
  onStatementChange: (statement: GeneratedStatement) => void;
}

export default function DraggableStatement({ statement, onStatementChange }: Props) {
  const [sections, setSections] = useState<Record<string, LineItem[]>>({});

  useEffect(() => {
    // Group items by their sections
    const grouped = statement.lineItems.reduce((acc, item) => {
      const accountCode = typeof item.section === 'string' 
        ? item.section.split(' ')[0]
        : item.section.code;
        
      const sectionKey = getSectionForAccount(accountCode, 'balance-sheet');
      
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }
      
      acc[sectionKey].push({
        ...item,
        id: `${accountCode}-${item.description}`
      });
      
      return acc;
    }, {} as Record<string, LineItem[]>);

    setSections(grouped);
  }, [statement]);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeSection = Object.entries(sections).find(([_, items]) => 
      items.some(item => item.id === active.id)
    )?.[0];

    const overSection = over.data.current?.type === 'section' 
      ? over.id.toString()
      : Object.entries(sections).find(([_, items]) => 
          items.some(item => item.id === over.id)
        )?.[0];

    if (!activeSection || !overSection || activeSection === overSection) return;

    const activeItem = sections[activeSection].find(item => item.id === active.id);
    if (!activeItem) return;

    // Validate transition
    const validation = TransitionValidator.validateTransition(
      activeItem,
      activeSection,
      overSection,
      'balance-sheet'
    );

    if (!validation.isValid) {
      logger.log('Invalid transition:', validation.reason);
      return;
    }

    setSections(prev => {
      const newSections = { ...prev };
      newSections[activeSection] = prev[activeSection].filter(item => item.id !== active.id);
      newSections[overSection] = [...prev[overSection], activeItem];
      return newSections;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Update parent with new statement
    const newLineItems = Object.values(sections).flat();
    onStatementChange({
      ...statement,
      lineItems: newLineItems,
      subtotals: calculateSubtotals(sections),
      total: calculateTotal(newLineItems)
    });

    logger.log('Statement updated after drag and drop');
  };

  const calculateSubtotals = (sections: Record<string, LineItem[]>) => {
    return Object.entries(sections).map(([section, items]) => ({
      description: `Total ${SECTION_TITLES['balance-sheet'][section as keyof typeof SECTION_TITLES['balance-sheet']] || section}`,
      amount: items.reduce((sum, item) => sum + item.amount, 0)
    }));
  };

  const calculateTotal = (items: LineItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <DndContext onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {Object.entries(sections).map(([sectionId, items]) => (
          <StatementSection
            key={sectionId}
            sectionId={sectionId}
            title={SECTION_TITLES['balance-sheet'][sectionId as keyof typeof SECTION_TITLES['balance-sheet']] || sectionId}
            items={items}
          />
        ))}
      </div>
    </DndContext>
  );
}