import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Plus, Trash2 } from 'lucide-react';

const RoutineEditor = () => {
  const { userProfiles, schedules, updateSchedule } = useApp();
  const { addToast } = useToast();
  const [selectedUser, setSelectedUser] = useState(Object.keys(userProfiles)[0] || '');

  const currentSchedule = schedules[selectedUser] || [];

  const addBlock = () => {
    const newBlock = {
      time: 7,
      label: '07:00 - 08:00',
      tasks: ['Nova tarefa'],
      priority: 'medium' as const,
      category: 'sistema' as const,
    };
    updateSchedule(selectedUser, [...currentSchedule, newBlock]);
    addToast('Bloco adicionado', 'success');
  };

  const removeBlock = (index: number) => {
    const newSchedule = currentSchedule.filter((_, i) => i !== index);
    updateSchedule(selectedUser, newSchedule);
    addToast('Bloco removido', 'success');
  };

  const addTask = (blockIndex: number) => {
    const newSchedule = [...currentSchedule];
    newSchedule[blockIndex].tasks.push('Nova tarefa');
    updateSchedule(selectedUser, newSchedule);
  };

  const removeTask = (blockIndex: number, taskIndex: number) => {
    const newSchedule = [...currentSchedule];
    newSchedule[blockIndex].tasks = newSchedule[blockIndex].tasks.filter((_, i) => i !== taskIndex);
    updateSchedule(selectedUser, newSchedule);
  };

  const updateTask = (blockIndex: number, taskIndex: number, value: string) => {
    const newSchedule = [...currentSchedule];
    newSchedule[blockIndex].tasks[taskIndex] = value;
    updateSchedule(selectedUser, newSchedule);
  };

  const applyTemplate = (template: 'morning' | 'afternoon') => {
    const templates = {
      morning: [
        {
          time: 7,
          label: '07:00 - 08:00',
          tasks: ['Check-in de sistemas', 'Verificar e-mails prioritários'],
          priority: 'high' as const,
          category: 'sistema' as const,
        },
        {
          time: 8,
          label: '08:00 - 09:00',
          tasks: ['Processar demandas pendentes', 'Atualizar dashboard'],
          priority: 'high' as const,
          category: 'monitoramento' as const,
        },
      ],
      afternoon: [
        {
          time: 13,
          label: '13:00 - 14:00',
          tasks: ['Revisão de processos', 'Organizar documentação'],
          priority: 'medium' as const,
          category: 'organização' as const,
        },
      ],
    };

    updateSchedule(selectedUser, templates[template]);
    addToast('Template aplicado', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Editor de Rotinas</h2>
          <p className="text-muted-foreground">Configure as rotinas de cada operador</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => applyTemplate('morning')}>
            Template Manhã
          </Button>
          <Button variant="secondary" size="sm" onClick={() => applyTemplate('afternoon')}>
            Template Tarde
          </Button>
        </div>
      </div>

      {/* User Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(userProfiles).map(([username, profile]) => (
          <button
            key={username}
            onClick={() => setSelectedUser(username)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedUser === username
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'glass hover:bg-muted'
            }`}
          >
            <span className="text-lg">{profile.avatar}</span>
            <span className="font-medium">{profile.name}</span>
          </button>
        ))}
      </div>

      {/* Schedule Blocks */}
      <div className="space-y-4">
        {currentSchedule.map((block, blockIndex) => (
          <GlassCard key={blockIndex} className="animate-slideUp">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={block.label}
                  onChange={(e) => {
                    const newSchedule = [...currentSchedule];
                    newSchedule[blockIndex].label = e.target.value;
                    updateSchedule(selectedUser, newSchedule);
                  }}
                  className="text-xl font-bold bg-transparent border-none focus:outline-none w-full"
                />
                <div className="flex gap-2 mt-2">
                  <select
                    value={block.priority}
                    onChange={(e) => {
                      const newSchedule = [...currentSchedule];
                      newSchedule[blockIndex].priority = e.target.value as 'high' | 'medium';
                      updateSchedule(selectedUser, newSchedule);
                    }}
                    className="px-3 py-1 rounded-lg bg-muted border border-border text-sm"
                  >
                    <option value="high">Alta Prioridade</option>
                    <option value="medium">Média Prioridade</option>
                  </select>
                  <select
                    value={block.category}
                    onChange={(e) => {
                      const newSchedule = [...currentSchedule];
                      newSchedule[blockIndex].category = e.target.value as any;
                      updateSchedule(selectedUser, newSchedule);
                    }}
                    className="px-3 py-1 rounded-lg bg-muted border border-border text-sm"
                  >
                    <option value="sistema">Sistema</option>
                    <option value="monitoramento">Monitoramento</option>
                    <option value="organização">Organização</option>
                    <option value="comunicação">Comunicação</option>
                  </select>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeBlock(blockIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              {block.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updateTask(blockIndex, taskIndex, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(blockIndex, taskIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => addTask(blockIndex)}
            >
              <Plus className="w-4 h-4" />
              Adicionar Tarefa
            </Button>
          </GlassCard>
        ))}

        <Button onClick={addBlock} className="w-full">
          <Plus className="w-4 h-4" />
          Adicionar Bloco de Horário
        </Button>
      </div>
    </div>
  );
};

export default RoutineEditor;
