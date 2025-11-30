
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Priority, Category, Task } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, dueDate: string, priority: Priority, category: Category) => void;
  initialData?: Task | null;
}

export const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [category, setCategory] = useState<Category>('PERSONAL');
  const [error, setError] = useState('');

  // Populate form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setDueDate(initialData.dueDate);
        setPriority(initialData.priority);
        setCategory(initialData.category);
      } else {
        // Reset for new task
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('MEDIUM');
        setCategory('PERSONAL');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !dueDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSave(title, description, dueDate, priority, category);
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative z-50 transform transition-all scale-100 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Icon name={isEditing ? 'pencil' : 'plus'} className="w-6 h-6 text-primary" />
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <Icon name="alert" className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Ex: Estudar Cálculo II"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              placeholder="Adicione detalhes, observações ou subtarefas..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prazo *
                </label>
                <input
                  type="date"
                  id="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
             </div>
             <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                </select>
             </div>
          </div>

          <div>
             <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Categoria
             </label>
             <select
               id="category"
               value={category}
               onChange={(e) => setCategory(e.target.value as Category)}
               className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
             >
                 <option value="STUDY">Estudo</option>
                 <option value="WORK">Trabalho</option>
                 <option value="PERSONAL">Pessoal</option>
                 <option value="OTHER">Outro</option>
             </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-bold"
            >
              {isEditing ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
