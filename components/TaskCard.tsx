
import React from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { Icon } from './Icon';
import { formatDate, getPriorityConfig, getCategoryLabel } from '../utils';

interface TaskCardProps {
  task: Task;
  onDragStart: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onDelete, onToggleStatus, onEdit }) => {
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    // We set the ID in plain text for the drop handler
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task.id);
  };

  // Date comparison for "Late" status (ignoring time for simple day comparison if needed, but current usage suggests full date)
  // To be precise with "Late", we compare against end of today or just now. 
  // Simple check: if due date is before today (not including today) or just strict timestamp comparison.
  // Assuming strict string comparison YYYY-MM-DD against current date YYYY-MM-DD implies "before today".
  const todayStr = new Date().toISOString().split('T')[0];
  const isLate = task.dueDate < todayStr && task.status !== TaskStatus.DONE;

  const priorityConfig = getPriorityConfig(task.priority);
  
  const getPriorityIconName = (priority: Priority) => {
      switch (priority) {
          case 'HIGH': return 'arrow-up';
          case 'LOW': return 'arrow-down';
          default: return 'minus';
      }
  };
  
  // Dynamic Styling based on status
  const borderColor = task.status === TaskStatus.DONE 
    ? 'border-green-500' 
    : isLate 
        ? 'border-red-500' 
        : 'border-transparent';

  const bgClass = task.status === TaskStatus.DONE
    ? 'bg-white dark:bg-gray-800 opacity-75'
    : isLate
        ? 'bg-red-50 dark:bg-red-900/20'
        : 'bg-white dark:bg-gray-800';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`${bgClass} p-4 rounded-lg shadow-sm border-l-4 ${borderColor} hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative animate-fade-in`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex-1 flex gap-2">
            {isLate && (
                <div className="text-red-500 flex-shrink-0 mt-0.5 animate-pulse" title="Tarefa Atrasada">
                    <Icon name="alert" className="w-5 h-5" />
                </div>
            )}
            <h3 className={`font-semibold text-gray-800 dark:text-white leading-tight break-words ${task.status === TaskStatus.DONE ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
            {task.title}
            </h3>
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 gap-1 ml-2">
            <button 
                onClick={() => onEdit(task)}
                className="text-gray-400 hover:text-indigo-500 p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Editar tarefa"
            >
                <Icon name="pencil" className="w-4 h-4" />
            </button>
            <button 
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Excluir tarefa"
            >
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
        </p>
      )}
      
      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${priorityConfig.color} bg-opacity-50`}>
            <Icon name={getPriorityIconName(task.priority)} className="w-3 h-3" />
            {priorityConfig.label}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
            <Icon name="tag" className="w-3 h-3" />
            {getCategoryLabel(task.category)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mt-auto pt-2 border-t border-black/5 dark:border-white/10">
        <div className={`flex items-center gap-1 ${isLate ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
          <Icon name="calendar" className="w-3.5 h-3.5" />
          <span className="text-xs">{formatDate(task.dueDate)}</span>
        </div>
        
        {task.status !== TaskStatus.DONE && (
             <button
                onClick={() => onToggleStatus(task.id)}
                className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-2 py-1 rounded transition-colors shadow-sm"
             >
                Concluir
             </button>
        )}
      </div>
    </div>
  );
};
