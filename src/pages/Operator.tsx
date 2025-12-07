import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Greeting } from '@/components/Greeting';
import { 
  LogOut, HelpCircle, Focus, Clock, Play, Pause, RotateCcw,
  CheckCircle2, Circle, Filter, Zap, TrendingUp
} from 'lucide-react';
import logoImage from '@/assets/logo.svg';

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

  // Heartbeat para manter status online
  useEffect(() => {
    if (!currentUser) return;

    const sendHeartbeat = () => {
      const heartbeats = JSON.parse(localStorage.getItem('userHeartbeats') || '{}');
      heartbeats[currentUser] = Date.now();
      localStorage.setItem('userHeartbeats', JSON.stringify(heartbeats));
      
      // Broadcast heartbeat
      const channel = new BroadcastChannel('app-sync');
      channel.postMessage({
        type: 'HEARTBEAT',
        data: { username: currentUser, timestamp: Date.now() }
      });
      channel.close();
    };

    // Enviar heartbeat a cada 5 segundos
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

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
  const allUserTracking = trackingData[currentUser] || {};
  
  // Filter tracking to show only today's data
  const today = new Date().toISOString().split('T')[0];
  const userTracking: Record<string, any> = {};
  Object.entries(allUserTracking).forEach(([key, value]) => {
    // Extract blockId from date-blockId format
    if (key.startsWith(today)) {
      const blockId = key.substring(11); // Remove "YYYY-MM-DD-" prefix
      userTracking[blockId] = value;
    }
  });

  const currentHour = simulationMode ? simulatedTime : new Date().getHours();

  const handleTaskToggle = (blockId: string, taskIndex: number) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    const tasks = existing.tasks.includes(taskIndex)
      ? existing.tasks.filter((t: number) => t !== taskIndex)
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
      timestamp: now.toISOString()
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
  const completedTasks = Object.values(userTracking).reduce((sum: number, t: any) => sum + t.tasks.length, 0);
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
    <div className="min-h-screen pb-32 bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-2xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left - Logo & User Info */}
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
              </div>
              
              <div className="h-8 w-px bg-border/50 hidden sm:block" />
              
              <Greeting 
                name={profile.name} 
                showRole 
                role={profile.role} 
                avatar={profile.avatar}
                size="md"
              />
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFocusMode(!focusMode)}
                className={focusMode ? 'bg-primary/10 text-primary' : ''}
              >
                <Focus className="w-4 h-4" />
                <span className="hidden sm:inline">Foco</span>
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Ajuda</span>
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => { logout(); navigate('/'); }}
                className="shadow-lg shadow-danger/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-muted/50 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Progresso do Dia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{Math.round(progress)}%</span>
                <div className="text-xs text-muted-foreground">
                  {completedTasks}/{totalTasks} tarefas
                </div>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Todas', icon: Filter },
            { id: 'pending', label: 'Pendentes', icon: Circle },
            { id: 'completed', label: 'Concluídas', icon: CheckCircle2 },
          ].map((item) => (
            <Button
              key={item.id}
              variant={filter === item.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(item.id as typeof filter)}
              className={filter === item.id ? 'shadow-lg shadow-primary/20' : ''}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Schedule Blocks */}
      <div className="container mx-auto px-4 space-y-4">
        {filteredSchedule.map((block) => {
          const status = getBlockStatus(block.id, block.time);
          const tracking = userTracking[block.id] || { tasks: [], report: '', reportSent: false, timestamp: '' };
          const blockProgress = block.tasks.length > 0 ? (tracking.tasks.length / block.tasks.length) * 100 : 0;
          
          const isLunchBlock = block.time === 12 || 
            block.tasks.some(t => t.toLowerCase().includes('almoço') || t.toLowerCase().includes('intervalo'));

          const statusStyles = {
            current: 'border-primary ring-2 ring-primary/30 shadow-xl shadow-primary/10',
            late: 'border-danger ring-2 ring-danger/30',
            completed: 'border-success/50 bg-success/5',
            future: 'opacity-70',
          };
          
          const lunchStyles = isLunchBlock 
            ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent' 
            : '';

          return (
            <GlassCard
              key={block.id}
              className={`transition-all duration-300 ${statusStyles[status]} ${lunchStyles}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 flex-wrap">
                    {block.label}
                    {status === 'current' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg border border-primary/20">
                        <Zap className="w-3 h-3" />
                        AGORA
                      </span>
                    )}
                    {status === 'late' && (
                      <span className="px-2.5 py-1 bg-danger text-danger-foreground text-xs font-semibold rounded-lg animate-pulse">
                        ATRASADO
                      </span>
                    )}
                    {isLunchBlock && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/30">
                        🍽️ ALMOÇO
                      </span>
                    )}
                  </h3>
                  {block.priority && (
                    <span className={`text-xs font-medium ${block.priority === 'high' ? 'text-danger' : 'text-warning'}`}>
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
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={tracking.tasks.includes(index)}
                      onChange={() => handleTaskToggle(block.id, index)}
                      disabled={status === 'future'}
                      className="mt-1 w-5 h-5 rounded-md border-2 border-primary text-primary focus:ring-2 focus:ring-primary accent-primary"
                    />
                    <span className={`flex-1 ${tracking.tasks.includes(index) ? 'line-through opacity-60' : ''}`}>
                      {task}
                    </span>
                    {block.category && (
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded-lg">
                        {block.category}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {status !== 'future' && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <label className="block text-sm font-medium">Relatório / Retorno</label>
                  <textarea
                    value={tracking.report}
                    onChange={(e) => handleReportChange(block.id, e.target.value)}
                    disabled={tracking.reportSent}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all duration-200"
                    rows={3}
                    placeholder="Descreva as atividades realizadas..."
                  />
                   {tracking.reportSent ? (
                    <div className="flex items-center gap-2 text-sm text-success font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Relatório enviado às {new Date(tracking.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                   ) : (
                    <Button size="sm" className="shadow-lg shadow-primary/20">
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
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-2xl border-t border-border/50 p-4 z-30 shadow-2xl shadow-black/10">
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {simulationMode ? 'Simulação' : 'Ao Vivo'}
                {!simulationMode && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
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
                className="w-full accent-primary"
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
        <div className="fixed bottom-24 right-4 bg-card/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl p-6 w-72 z-40 animate-scaleIn">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Focus className="w-5 h-5 text-primary" />
            </div>
            Modo Foco
          </h3>
          <div className="text-5xl font-bold text-center mb-4 font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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