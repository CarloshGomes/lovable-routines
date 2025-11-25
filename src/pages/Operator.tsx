import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Greeting } from '@/components/Greeting';
import { 
  LogOut, HelpCircle, Focus, Clock, Play, Pause, RotateCcw,
  CheckCircle2, Circle, Filter
} from 'lucide-react';

const Operator = () => {
  const navigate = useNavigate();
  const { currentUser, userProfiles, schedules, trackingData, updateTracking, logout } = useApp();
  const { addToast } = useToast();
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(7);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (focusRunning && focusTime > 0) {
      const timer = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (focusTime === 0) {
      addToast('Sessão Pomodoro concluída!', 'success');
      setFocusRunning(false);
      setFocusTime(25 * 60);
    }
  }, [focusRunning, focusTime, addToast]);

  if (!currentUser) return null;

  const profile = userProfiles[currentUser];
  const userSchedule = schedules[currentUser] || [];
  const userTracking = trackingData[currentUser] || {};

  const currentHour = simulationMode ? simulatedTime : new Date().getHours();

  const handleTaskToggle = (blockId: string, taskIndex: number) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    const tasks = existing.tasks.includes(taskIndex)
      ? existing.tasks.filter((t) => t !== taskIndex)
      : [...existing.tasks, taskIndex];
    
    updateTracking(currentUser, blockId, { ...existing, tasks });
    addToast(tasks.includes(taskIndex) ? 'Tarefa concluída!' : 'Tarefa reaberta', 'success');
  };

  const handleReportChange = (blockId: string, report: string) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    updateTracking(currentUser, blockId, { ...existing, report });
  };

  const handleReportSend = (blockId: string) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    if (!existing.report.trim()) {
      addToast('Digite um relatório antes de enviar', 'warning');
      return;
    }
    const now = new Date();
    updateTracking(currentUser, blockId, { 
      ...existing, 
      reportSent: true, 
      timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    });
    addToast('Relatório enviado com sucesso!', 'success');
  };

  const filteredSchedule = userSchedule.filter((block) => {
    const tracking = userTracking[block.id];
    if (filter === 'completed') {
      return tracking && tracking.tasks.length === block.tasks.length;
    }
    if (filter === 'pending') {
      return !tracking || tracking.tasks.length < block.tasks.length;
    }
    return true;
  });

  const totalTasks = userSchedule.reduce((sum, block) => sum + block.tasks.length, 0);
  const completedTasks = Object.values(userTracking).reduce((sum, t) => sum + t.tasks.length, 0);
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getBlockStatus = (blockId: string, time: number) => {
    const tracking = userTracking[blockId];
    const block = userSchedule.find((b) => b.id === blockId);
    if (!block) return 'future';
    
    const hasTasks = block.tasks.length > 0;
    const isCompleted = hasTasks && tracking && tracking.tasks.length === block.tasks.length;
    
    // Blocos completos sempre aparecem como completos
    if (isCompleted) return 'completed';
    
    // Blocos sem tarefas (intervalos) se auto-completam quando o horário passa
    if (!hasTasks && time < currentHour) return 'completed';
    
    // Bloco atual
    if (time === currentHour) return 'current';
    
    // Blocos com tarefas incompletas no passado estão atrasados
    if (hasTasks && time < currentHour) return 'late';
    
    // Blocos futuros
    return 'future';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulseSlow" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulseSlow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${profile.color}-500/20`}>
                {profile.avatar}
              </div>
              <div>
                <Greeting name={profile.name} />
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setFocusMode(!focusMode)}>
                <Focus className="w-4 h-4" />
                Foco
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
                Ajuda
              </Button>
              <Button variant="danger" size="sm" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progresso do Dia</span>
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Filter className="w-4 h-4" />
            Todas
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            <Circle className="w-4 h-4" />
            Pendentes
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluídas
          </Button>
        </div>
      </div>

      {/* Schedule Blocks */}
      <div className="container mx-auto px-4 space-y-4">
        {filteredSchedule.map((block) => {
          const status = getBlockStatus(block.id, block.time);
          const tracking = userTracking[block.id] || { tasks: [], report: '', reportSent: false, timestamp: '' };
          const blockProgress = block.tasks.length > 0 ? (tracking.tasks.length / block.tasks.length) * 100 : 0;

          const statusStyles = {
            current: 'border-primary ring-2 ring-primary/50 scale-105',
            late: 'border-danger animate-pulseRed',
            completed: 'border-success',
            future: 'opacity-60',
          };

          return (
            <GlassCard
              key={block.id}
              className={`transition-all duration-300 ${statusStyles[status]} ${block.type === 'break' ? 'bg-warning/5' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {block.label}
                    {status === 'late' && (
                      <span className="px-2 py-1 bg-danger text-danger-foreground text-xs rounded-lg">
                        ATRASADO
                      </span>
                    )}
                    {block.type === 'break' && (
                      <span className="px-2 py-1 bg-warning text-warning-foreground text-xs rounded-lg">
                        INTERVALO
                      </span>
                    )}
                  </h3>
                  {block.priority && (
                    <span className={`text-xs ${block.priority === 'high' ? 'text-danger' : 'text-warning'}`}>
                      Prioridade: {block.priority === 'high' ? 'Alta' : 'Média'}
                    </span>
                  )}
                </div>
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                      className="text-primary transition-all duration-500"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - blockProgress / 100)}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {Math.round(blockProgress)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {block.tasks.map((task, index) => (
                  <label
                    key={`${block.time}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={tracking.tasks.includes(index)}
                      onChange={() => handleTaskToggle(block.id, index)}
                      disabled={status === 'future'}
                      className="mt-1 w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className={`flex-1 ${tracking.tasks.includes(index) ? 'line-through opacity-60' : ''}`}>
                      {task}
                    </span>
                    {block.category && (
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded">
                        {block.category}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {status !== 'future' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Relatório / Retorno</label>
                  <textarea
                    value={tracking.report}
                    onChange={(e) => handleReportChange(block.id, e.target.value)}
                    disabled={tracking.reportSent}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    rows={3}
                    placeholder="Descreva as atividades realizadas..."
                  />
                  {tracking.reportSent ? (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      Relatório enviado às {tracking.timestamp}
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleReportSend(block.id)}>
                      Enviar Relatório
                    </Button>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* HUD */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4 z-30">
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">
                {simulationMode ? 'Simulação' : 'Ao Vivo'}
                {!simulationMode && <span className="inline-block w-2 h-2 bg-danger rounded-full ml-2 animate-pulseRed" />}
              </div>
              <div className="text-2xl font-bold">
                {simulationMode ? `${simulatedTime}:00` : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {simulationMode && (
            <div className="flex-1 max-w-md">
              <input
                type="range"
                min="7"
                max="19"
                value={simulatedTime}
                onChange={(e) => setSimulatedTime(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <Button
            variant={simulationMode ? 'warning' : 'ghost'}
            size="sm"
            onClick={() => setSimulationMode(!simulationMode)}
          >
            {simulationMode ? 'Desativar' : 'Ativar'} Simulação
          </Button>
        </div>
      </div>

      {/* Focus Mode */}
      {focusMode && (
        <div className="fixed bottom-24 right-4 glass-card p-6 w-64 z-40 animate-scaleIn">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Focus className="w-5 h-5 text-primary" />
            Modo Foco
          </h3>
          <div className="text-5xl font-bold text-center mb-4 text-gradient">
            {formatTime(focusTime)}
          </div>
          <div className="flex gap-2">
            <Button
              variant={focusRunning ? 'warning' : 'success'}
              size="sm"
              className="flex-1"
              onClick={() => setFocusRunning(!focusRunning)}
            >
              {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFocusTime(25 * 60); setFocusRunning(false); }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operator;
