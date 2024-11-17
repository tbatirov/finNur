import React from 'react';
import { Eye, EyeOff, Brain, CircleOff } from 'lucide-react';

interface Props {
  isDraggable: boolean;
  onDraggableChange: (isDraggable: boolean) => void;
  isAIEnabled: boolean;
  onAIEnabledChange: (isEnabled: boolean) => void;
}

export default function StatementControls({
  isDraggable,
  onDraggableChange,
  isAIEnabled,
  onAIEnabledChange
}: Props) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <button
        onClick={() => onDraggableChange(!isDraggable)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          isDraggable
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        {isDraggable ? (
          <>
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">View Mode</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span className="text-sm font-medium">Edit Mode</span>
          </>
        )}
      </button>

      {/* <button
        onClick={() => onAIEnabledChange(!isAIEnabled)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          isAIEnabled
            ? 'bg-purple-50 text-purple-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        {isAIEnabled ? (
          <>
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">AI Analysis On</span>
          </>
        ) : (
          <>
            <CircleOff className="w-4 h-4" />
            <span className="text-sm font-medium">AI Analysis Off</span>
          </>
        )}
      </button> */}
    </div>
  );
}