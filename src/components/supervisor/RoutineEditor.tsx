import { useState, useEffect } from 'react';
import type { ScheduleBlock } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const RoutineEditor = () => {
  const { userProfiles, schedules, updateSchedule } = useApp();
  const { addToast } = useToast();
  const [selectedUser, setSelectedUser] = useState(Object.keys(userProfiles)[0] || '');

  const currentSchedule = schedules[selectedUser] || [];
  const [localSchedule, setLocalSchedule] = useState<ScheduleBlock[]>(currentSchedule);
  const [preserveEnabled, setPreserveEnabled] = useState(false);
  const [preserveDays, setPreserveDays] = useState(1);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  const toggleBlock = (id: string) => {
    setExpandedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Persist editor drafts per user so reload doesn't lose unsaved edits
  const draftKey = (username: string) => `routineDraft-${username}`;

  useEffect(() => {
    // Load draft when selectedUser changes
    const stored = selectedUser ? localStorage.getItem(draftKey(selectedUser)) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ScheduleBlock[];
        setLocalSchedule(parsed);
        return;
      } catch (e) {
        // ignore parse errors
      }
    }

    // fallback to schedule from context
    setLocalSchedule(schedules[selectedUser] || []);
  }, [selectedUser, schedules]);

  useEffect(() => {
    if (!selectedUser) return;
    try {
      localStorage.setItem(draftKey(selectedUser), JSON.stringify(localSchedule));
    } catch (e) {
      // ignore storage errors
    }
  }, [localSchedule, selectedUser]);

  const addBlock = () => {
    // Encontrar o próximo horário disponível
    const existingTimes = localSchedule.map(b => b.time);
    let nextTime = 7;
    while (existingTimes.includes(nextTime) && nextTime < 19) {
      nextTime++;
    }

    const newBlock = {
      id: `${selectedUser}-${Date.now()}`,
      time: nextTime,
      label: `${String(nextTime).padStart(2, '0')}:00 - ${String(nextTime + 1).padStart(2, '0')}:00`,
      tasks: ['Nova tarefa'],
      priority: 'medium' as const,
      category: 'sistema' as const,
    };
    const updated = [...localSchedule, newBlock];
    setLocalSchedule(updated);
    addToast('Bloco adicionado', 'success');
  };

  const removeBlock = (index: number) => {
    const newSchedule = localSchedule.filter((_, i) => i !== index);
    setLocalSchedule(newSchedule);
    addToast('Bloco removido', 'success');
  };

  const duplicateBlock = (index: number) => {
    const blockToCopy = localSchedule[index];
    const newBlock = {
      ...blockToCopy,
      id: `${selectedUser}-${Date.now()}-copy`,
      label: `${blockToCopy.label} (Cópia)`,
      time: blockToCopy.type === 'break' ? blockToCopy.time : blockToCopy.time // Keep same time, user adjusts
    };

    // Insert after the original
    const newSchedule = [...localSchedule];
    newSchedule.splice(index + 1, 0, newBlock);

    setLocalSchedule(newSchedule);
    // Auto-expand the new block
    setExpandedBlocks(prev => ({ ...prev, [newBlock.id]: true }));
    addToast('Bloco duplicado com sucesso', 'success');
  };

  const addTask = (blockIndex: number) => {
    const newSchedule = [...localSchedule];
    newSchedule[blockIndex].tasks.push('Nova tarefa');
    setLocalSchedule(newSchedule);
  };

  const removeTask = (blockIndex: number, taskIndex: number) => {
    const newSchedule = [...localSchedule];
    newSchedule[blockIndex].tasks = newSchedule[blockIndex].tasks.filter((_, i) => i !== taskIndex);
    setLocalSchedule(newSchedule);
  };

  const updateTask = (blockIndex: number, taskIndex: number, value: string) => {
    const newSchedule = [...localSchedule];
    newSchedule[blockIndex].tasks[taskIndex] = value;
    setLocalSchedule(newSchedule);
  };

  const applyTemplate = (template: 'morning' | 'afternoon' | 'full') => {
    const timestamp = Date.now();
    const templates = {
      morning: [
        {
          id: `${selectedUser}-${timestamp}-1`,
          time: 7,
          label: '07:00 - 08:00',
          tasks: ['Check-in de sistemas', 'Verificar e-mails prioritários'],
          priority: 'high' as const,
          category: 'sistema' as const,
        },
        {
          id: `${selectedUser}-${timestamp}-2`,
          time: 8,
          label: '08:00 - 09:00',
          tasks: ['Processar demandas pendentes', 'Atualizar dashboard'],
          priority: 'high' as const,
          category: 'monitoramento' as const,
        },
      ],
      afternoon: [
        {
          id: `${selectedUser}-${timestamp}-1`,
          time: 13,
          label: '13:00 - 14:00',
          tasks: ['Revisão de processos', 'Organizar documentação'],
          priority: 'medium' as const,
          category: 'organização' as const,
        },
      ],
      full: [
        { id: `${selectedUser}-${timestamp}-1`, time: 7, label: '07:00 - 08:00', tasks: ['Check-in de sistemas'], priority: 'high' as const, category: 'sistema' as const },
        { id: `${selectedUser}-${timestamp}-2`, time: 8, label: '08:00 - 09:00', tasks: ['Monitoramento'], priority: 'high' as const, category: 'monitoramento' as const },
        { id: `${selectedUser}-${timestamp}-3`, time: 9, label: '09:00 - 10:00', tasks: ['Atendimento'], priority: 'medium' as const, category: 'comunicação' as const },
        { id: `${selectedUser}-${timestamp}-4`, time: 10, label: '10:00 - 11:00', tasks: ['Processamento'], priority: 'medium' as const, category: 'sistema' as const },
        { id: `${selectedUser}-${timestamp}-5`, time: 11, label: '11:00 - 12:00', tasks: ['Documentação'], priority: 'medium' as const, category: 'organização' as const },
        { id: `${selectedUser}-${timestamp}-6`, time: 12, label: '12:00 - 13:00', tasks: ['Almoço'], priority: 'medium' as const, category: 'organização' as const },
        { id: `${selectedUser}-${timestamp}-7`, time: 13, label: '13:00 - 14:00', tasks: ['Revisão'], priority: 'medium' as const, category: 'monitoramento' as const },
        { id: `${selectedUser}-${timestamp}-8`, time: 14, label: '14:00 - 15:00', tasks: ['Atendimento'], priority: 'medium' as const, category: 'comunicação' as const },
        { id: `${selectedUser}-${timestamp}-9`, time: 15, label: '15:00 - 16:00', tasks: ['Processamento'], priority: 'medium' as const, category: 'sistema' as const },
        { id: `${selectedUser}-${timestamp}-10`, time: 16, label: '16:00 - 17:00', tasks: ['Documentação'], priority: 'medium' as const, category: 'organização' as const },
        { id: `${selectedUser}-${timestamp}-11`, time: 17, label: '17:00 - 18:00', tasks: ['Fechamento'], priority: 'high' as const, category: 'sistema' as const },
        { id: `${selectedUser}-${timestamp}-12`, time: 18, label: '18:00 - 19:00', tasks: ['Backup e relatórios'], priority: 'high' as const, category: 'sistema' as const },
      ],
    };

    setLocalSchedule(templates[template]);
    addToast('Template aplicado', 'success');
  };

  return (
    <div className="container mx-auto px-4 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Editor de Rotinas</h2>
          <p className="text-muted-foreground">Configure as rotinas de cada operador</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => applyTemplate('morning')}>
            Template Manhã
          </Button>
          <Button variant="secondary" size="sm" onClick={() => applyTemplate('afternoon')}>
            Template Tarde
          </Button>
          <Button variant="secondary" size="sm" onClick={() => applyTemplate('full')}>
            Template Completo (7h-19h)
          </Button>
          <div className="flex items-center gap-2 px-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={preserveEnabled} onChange={(e) => setPreserveEnabled(e.target.checked)} />
              Preservar históricos
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={preserveDays}
              onChange={(e) => setPreserveDays(Math.max(1, parseInt(e.target.value || '1')))}
              className="w-16 px-2 py-1 rounded border bg-muted text-sm"
              title="Últimos N dias"
              disabled={!preserveEnabled}
            />
          </div>
        </div>
      </div>

      {/* User Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(userProfiles).map(([username, profile]) => (
          <button
            key={username}
            onClick={() => setSelectedUser(username)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${selectedUser === username
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
        {localSchedule.map((block, blockIndex) => {
          const isLunchBlock = block.time === 12 || (block as any).isLunchBreak ||
            block.tasks.some(t => t.toLowerCase().includes('almoço') || t.toLowerCase().includes('intervalo'));

          const isExpanded = expandedBlocks[block.id];

          return (
            <GlassCard
              key={block.id}
              className={`animate-slideUp transition-all duration-300 ${isLunchBlock ? 'relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent' : ''}`}
            >
              {/* Header / Summary Row */}
              <div className="flex items-center justify-between gap-4 p-2 -m-2 rounded-lg hover:bg-muted/30 cursor-pointer" onClick={() => toggleBlock(block.id)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md cursor-grab active:cursor-grabbing text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className={`text-lg font-bold ${block.priority === 'high' ? 'text-red-500' : (block.priority === 'low' ? 'text-green-500' : 'text-primary')}`}>
                    {String(block.time).padStart(2, '0')}:00
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{block.label}</span>
                    <span className="text-xs text-muted-foreground">{block.tasks.length} tarefas • {block.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); duplicateBlock(blockIndex); }}
                    title="Duplicar Bloco"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={(e) => { e.stopPropagation(); removeBlock(blockIndex); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-muted-foreground">Horário Início</label>
                          <select
                            value={block.time}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newSchedule = [...localSchedule];
                              const newTime = parseInt(e.target.value);
                              newSchedule[blockIndex].time = newTime;
                              newSchedule[blockIndex].label = `${String(newTime).padStart(2, '0')}:00 - ${String(newTime + 1).padStart(2, '0')}:00`;
                              setLocalSchedule(newSchedule);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm font-bold"
                          >
                            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                              <option key={hour} value={hour}>
                                {String(hour).padStart(2, '0')}:00
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-muted-foreground">Rótulo Visual</label>
                          <input
                            type="text"
                            value={block.label}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newSchedule = [...localSchedule];
                              newSchedule[blockIndex].label = e.target.value;
                              setLocalSchedule(newSchedule);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <select
                          value={block.priority}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newSchedule = [...localSchedule];
                            newSchedule[blockIndex].priority = e.target.value as 'high' | 'medium' | 'low';
                            setLocalSchedule(newSchedule);
                          }}
                          className="px-3 py-2 rounded-lg bg-muted border border-border text-sm w-full"
                        >
                          <option value="high">Alta Prioridade 🔴</option>
                          <option value="medium">Média Prioridade 🟡</option>
                          <option value="low">Baixa Prioridade 🟢</option>
                        </select>
                        <select
                          value={block.category}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newSchedule = [...localSchedule];
                            newSchedule[blockIndex].category = e.target.value as any;
                            setLocalSchedule(newSchedule);
                          }}
                          className="px-3 py-2 rounded-lg bg-muted border border-border text-sm w-full"
                        >
                          <option value="sistema">Sistema</option>
                          <option value="monitoramento">Monitoramento</option>
                          <option value="organização">Organização</option>
                          <option value="comunicação">Comunicação</option>
                          <option value="manutenção">Manutenção</option>
                          <option value="segurança">Segurança</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (!selectedUser) return;
                          updateSchedule(selectedUser, localSchedule, { preserveDays: preserveEnabled ? preserveDays : 0 });
                          addToast('Bloco salvo individualmente', 'success');
                        }}
                      >
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
                      Checklist de Tarefas
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{block.tasks.length} itens</span>
                    </label>
                    {block.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex gap-2 group">
                        <div className="p-2 text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2.5" />
                        </div>
                        <input
                          type="text"
                          value={task}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateTask(blockIndex, taskIndex, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                          placeholder="Descreva a tarefa..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeTask(blockIndex, taskIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-2 border-dashed border-2 bg-transparent hover:bg-muted"
                      onClick={() => addTask(blockIndex)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar nova tarefa
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}

        <Button onClick={addBlock} className="w-full">
          <Plus className="w-4 h-4" />
          Adicionar Bloco de Horário
        </Button>
      </div>
    </div>
  );
};

export default RoutineEditor;
