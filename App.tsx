
import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, FilterType, ToastMessage, Priority, Category, CategoryFilter, PriorityFilter } from './types';
import { generateId, filterTasks, getColumnTitle, getCategoryLabel, getPriorityConfig } from './utils';
import { Icon } from './components/Icon';
import { TaskModal } from './components/Modal';
import { ConfirmModal } from './components/ConfirmModal';
import { TaskCard } from './components/TaskCard';
import { ToastContainer } from './components/Toast';

const STORAGE_KEY_TASKS = 'tarefafacil_tasks';
const STORAGE_KEY_THEME = 'tarefafacil_theme';

const App: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateFilter, setDateFilter] = useState<FilterType>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (storedTasks) {
      try {
        const parsed = JSON.parse(storedTasks);
        // Migration support for old tasks without priority/category
        const hydratedTasks = parsed.map((t: any) => ({
            ...t,
            priority: t.priority || 'MEDIUM',
            category: t.category || 'PERSONAL',
            description: t.description || ''
        }));
        setTasks(hydratedTasks);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }

    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save to LocalStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Handle Theme Toggle
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
      addToast('Tema alterado para escuro', 'info');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
      addToast('Tema alterado para claro', 'info');
    }
  };

  // Toast System
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Task CRUD Actions
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (title: string, description: string, dueDate: string, priority: Priority, category: Category) => {
    if (taskToEdit) {
      // Update existing task
      setTasks((prev) => prev.map((t) => {
        if (t.id === taskToEdit.id) {
          return {
            ...t,
            title,
            description,
            dueDate,
            priority,
            category
          };
        }
        return t;
      }));
      addToast('Tarefa atualizada com sucesso!', 'success');
    } else {
      // Create new task
      const newTask: Task = {
        id: generateId(),
        title,
        description,
        dueDate,
        priority,
        category,
        status: TaskStatus.TODO,
        createdAt: Date.now(),
      };
      setTasks((prev) => [...prev, newTask]);
      addToast('Tarefa adicionada com sucesso!', 'success');
    }
    setTaskToEdit(null);
  };

  const handleDeleteRequest = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
      addToast('Tarefa removida.', 'info');
      setTaskToDelete(null);
    }
  };

  const handleToggleStatus = (taskId: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
              const newStatus = t.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
              return { ...t, status: newStatus };
          }
          return t;
      }));
  }

  // Drag and Drop Logic
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    // Fallback if dataTransfer is empty (some browsers/conditions)
    const activeId = taskId || draggedTaskId;

    if (activeId) {
      // Find the task to check if the status is actually changing
      const task = tasks.find(t => t.id === activeId);
      
      if (task && task.status !== targetStatus) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId ? { ...t, status: targetStatus } : t
          )
        );
        addToast(`Tarefa movida para ${getColumnTitle(targetStatus)}`, 'success');
      }
      setDraggedTaskId(null);
    }
  };

  // Render Helpers
  const renderColumn = (status: TaskStatus) => {
    const filteredTasks = filterTasks(tasks, dateFilter, categoryFilter, priorityFilter);
    const tasksInColumn = filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => {
         // Sort by priority (HIGH -> MEDIUM -> LOW)
         const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
         const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
         if (pDiff !== 0) return pDiff;
         
         // Then by due date
         return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

    return (
      <div
        className="flex-1 min-w-[300px] bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-4 border-2 border-transparent transition-colors duration-200"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-600 dark:text-gray-300 uppercase text-sm tracking-wider flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                    status === TaskStatus.TODO ? 'bg-blue-500' : 
                    status === TaskStatus.IN_PROGRESS ? 'bg-purple-500' : 'bg-green-500'
                }`}></span>
                {getColumnTitle(status)}
            </h2>
            <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                {tasksInColumn.length}
            </span>
        </div>

        <div className="flex flex-col gap-3 min-h-[150px]">
          {tasksInColumn.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm">Nenhuma tarefa</p>
             </div>
          ) : (
            tasksInColumn.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onDelete={handleDeleteRequest}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenEditTask}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg text-white">
                <Icon name="check" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              TarefaFácil
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Alternar tema"
            >
              <Icon name={isDarkMode ? 'sun' : 'moon'} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Filters and Actions Bar */}
        <div className="mb-8 flex flex-col xl:flex-row justify-between items-stretch gap-4">
            
            {/* Left Side: Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto flex-wrap">
                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto min-w-min">
                    {(['ALL', 'TODAY', 'WEEK'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => {
                                setDateFilter(f);
                                addToast(`Filtro atualizado: ${f === 'ALL' ? 'Todas' : f === 'TODAY' ? 'Hoje' : 'Semana'}`, 'info');
                            }}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-none ${
                                dateFilter === f
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {f === 'ALL' ? 'Todas' : f === 'TODAY' ? 'Hoje' : 'Semana'}
                        </button>
                    ))}
                </div>

                {/* Priority Filter */}
                <div className="relative min-w-[180px] flex-1 sm:flex-none">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon name="flag" className="w-4 h-4" />
                    </div>
                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value as PriorityFilter);
                            addToast(`Prioridade: ${e.target.value === 'ALL' ? 'Todas' : getPriorityConfig(e.target.value as Priority).label}`, 'info');
                        }}
                        className="w-full h-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                    >
                        <option value="ALL">Todas Prioridades</option>
                        <option value="HIGH">Alta</option>
                        <option value="MEDIUM">Média</option>
                        <option value="LOW">Baixa</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="relative min-w-[200px] flex-1 sm:flex-none">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon name="tag" className="w-4 h-4" />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value as CategoryFilter);
                            addToast(`Categoria: ${e.target.value === 'ALL' ? 'Todas' : getCategoryLabel(e.target.value as Category)}`, 'info');
                        }}
                        className="w-full h-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                    >
                        <option value="ALL">Todas Categorias</option>
                        <option value="STUDY">Estudo</option>
                        <option value="WORK">Trabalho</option>
                        <option value="PERSONAL">Pessoal</option>
                        <option value="OTHER">Outro</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            
            {/* Right Side: New Task */}
            <button
                onClick={handleOpenNewTask}
                className="w-full xl:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-medium whitespace-nowrap"
            >
                <Icon name="plus" className="w-5 h-5" />
                Nova Tarefa
            </button>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-8">
            {renderColumn(TaskStatus.TODO)}
            {renderColumn(TaskStatus.IN_PROGRESS)}
            {renderColumn(TaskStatus.DONE)}
        </div>
      </main>

      {/* Components */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={taskToEdit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;