
import { FilterType, Task, Priority, Category, CategoryFilter, PriorityFilter } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const filterTasks = (tasks: Task[], dateFilter: FilterType, categoryFilter: CategoryFilter, priorityFilter: PriorityFilter): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    // Priority Filter
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
      return false;
    }

    // Category Filter
    if (categoryFilter !== 'ALL' && task.category !== categoryFilter) {
      return false;
    }

    // Date Filter
    if (dateFilter === 'ALL') return true;

    const taskDate = new Date(task.dueDate + 'T00:00:00'); // Fix timezone issue by appending time
    
    if (dateFilter === 'TODAY') {
      return taskDate.getTime() === today.getTime();
    }

    if (dateFilter === 'WEEK') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return taskDate >= today && taskDate <= nextWeek;
    }

    return true;
  });
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
};

export const getColumnTitle = (status: string): string => {
    switch(status) {
        case 'TODO': return 'A Fazer';
        case 'IN_PROGRESS': return 'Em Progresso';
        case 'DONE': return 'Concluído';
        default: return status;
    }
}

export const getPriorityConfig = (priority: Priority) => {
  switch (priority) {
    case 'HIGH':
      return { label: 'Alta', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' };
    case 'MEDIUM':
      return { label: 'Média', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' };
    case 'LOW':
      return { label: 'Baixa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    default:
      return { label: 'Normal', color: 'bg-gray-100 text-gray-700' };
  }
};

export const getCategoryLabel = (category: Category) => {
  switch (category) {
    case 'STUDY': return 'Estudo';
    case 'WORK': return 'Trabalho';
    case 'PERSONAL': return 'Pessoal';
    case 'OTHER': return 'Outro';
    default: return category;
  }
};