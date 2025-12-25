import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Greeting } from '@/components/Greeting';
import {
  LogOut, HelpCircle, Clock, Sun, Moon,
  CheckCircle2, Circle, Filter, Zap, TrendingUp, LayoutDashboard,
  AlertTriangle, XCircle, Send
} from 'lucide-react';
import logoImage from '@/assets/logo.svg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CelebrationModal } from '@/components/CelebrationModal';
import { OperatorAnalytics } from '@/components/operator/OperatorAnalytics';
import { RoutineCard, RoutineBlock } from '@/components/operator/RoutineCard';
import { SecuritySetupModal } from '@/components/SecuritySetupModal';

const Operator = () => {
  const navigate = useNavigate();
  const { currentUser, userProfiles, schedules, trackingData, updateTracking, logout } = useApp();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // Simulation mode removed for operators — always use real time
  const [reportsDraft, setReportsDraft] = useState<Record<string, string>>({});
  const [celebrationOpen, setCelebrationOpen] = useState(false);

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

    const handleUnload = () => {
      try {
        const heartbeats = JSON.parse(localStorage.getItem('userHeartbeats') || '{}');
        if (heartbeats && heartbeats[currentUser]) {
          delete heartbeats[currentUser];
          localStorage.setItem('userHeartbeats', JSON.stringify(heartbeats));
        }
        try {
          const c = new BroadcastChannel('app-sync');
          c.postMessage({ type: 'HEARTBEAT_REMOVE', data: { username: currentUser } });
          c.close();
        } catch (e) { console.warn('BroadcastChannel remove failed', e); }
      } catch (e) { console.warn('handleUnload failed', e); }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser]);


  if (!currentUser) return null;

  const profile = userProfiles[currentUser];

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando perfil...</p>
        </div>
      </div>
    );
  }
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

  const currentHour = new Date().getHours();

  const handleTaskToggle = (blockId: string, taskIndex: number) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    const tasks = existing.tasks.includes(taskIndex)
      ? existing.tasks.filter((t: number) => t !== taskIndex)
      : [...existing.tasks, taskIndex];

    updateTracking(currentUser, blockId, { ...existing, tasks });
    addToast(tasks.includes(taskIndex) ? 'Tarefa concluída!' : 'Tarefa reaberta', 'success');
  };

  const handleReportChange = (blockId: string, report: string) => {
    setReportsDraft((prev) => ({ ...prev, [blockId]: report }));
  };

  const handleReportSend = (blockId: string) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    const draft = (reportsDraft[blockId] ?? existing.report ?? '').toString();
    if (!draft.trim()) {
      addToast('Digite um relatório antes de enviar', 'warning');
      return;
    }
    const now = new Date();
    updateTracking(currentUser, blockId, {
      ...existing,
      report: draft,
      reportSent: true,
      timestamp: now.toISOString()
    });
    // keep draft in sync
    setReportsDraft((prev) => ({ ...prev, [blockId]: draft }));
    addToast('Relatório enviado com sucesso!', 'success');
  };

  const handleDelayReport = (blockId: string, reason: string, isImpossible: boolean = false) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };

    updateTracking(currentUser, blockId, {
      ...existing,
      delayReason: reason,
      isImpossible: isImpossible,
      escalated: true, // Auto-escalation
      timestamp: new Date().toISOString()
    });

    if (isImpossible) {
      addToast('Bloco marcado como impossível. Supervisor notificado.', 'error');
    } else {
      addToast('Justificativa de atraso registrada.', 'warning');
    }
  };

  const handleAttachment = async (blockId: string, files: FileList) => {
    const existing = userTracking[blockId] || { tasks: [], report: '', reportSent: false, timestamp: '' };
    const currentAttachments = existing.attachments || [];

    // Process files
    const newAttachments: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Convert to Base64 (simple storage)
      const reader = new FileReader();

      const filePromise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });

      try {
        const base64 = await filePromise;
        newAttachments.push(base64);
      } catch (err) {
        console.error('Error reading file', err);
        addToast('Erro ao anexar arquivo', 'error');
      }
    }

    if (newAttachments.length > 0) {
      updateTracking(currentUser, blockId, {
        ...existing,
        attachments: [...currentAttachments, ...newAttachments]
      });
      addToast('Arquivos anexados com sucesso!', 'success');
    }
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

  // Check for celebration
  useEffect(() => {
    if (progress === 100 && totalTasks > 0) {
      setCelebrationOpen(true);
    }
  }, [progress, totalTasks]);

  const getBlockStatus = (blockId: string, time: number) => {
    const tracking = userTracking[blockId];
    const block = userSchedule.find((b) => b.id === blockId);
    if (!block) return 'future';

    const hasTasks = block.tasks.length > 0;
    const isCompleted = hasTasks && tracking && tracking.tasks.length === block.tasks.length;

    // Blocos completos sempre aparecem como completos
    if (isCompleted) return 'done';

    // Blocos sem tarefas (intervalos) se auto-completam quando o horário passa
    if (!hasTasks && time < currentHour) return 'done';

    // Bloco atual
    if (time === currentHour) return 'current';


    // Blocos com tarefas incompletas no passado estão atrasados
    if (hasTasks && time < currentHour) return 'late';

    // Blocos futuros
    return 'future';
  };


  return (
    <div className="min-h-screen pb-32 bg-background relative overflow-hidden">
      <SecuritySetupModal />
      {/* Premium Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '-3s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
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
                onClick={toggleTheme}
                className="hover:bg-primary/10"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDashboard(true)}
                className="hover:bg-primary/10"
                aria-label="Meu Desempenho"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Meu Desempenho</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                aria-label="Central de Ajuda"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Ajuda</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => { await logout(); navigate('/'); }}
                className="shadow-lg shadow-danger/20"
                aria-label="Sair do sistema"
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
      <div className="container mx-auto px-4 space-y-6">
        {filteredSchedule.map((block) => {
          const status = getBlockStatus(block.id, block.time);
          const tracking = userTracking[block.id] || { tasks: [], report: '', reportSent: false, timestamp: '' };

          const routineTasks = block.tasks.map((taskLabel, index) => ({
            id: index.toString(),
            label: taskLabel,
            completed: tracking.tasks.includes(index)
          }));

          const routineBlock: RoutineBlock = {
            id: block.id,
            time: `${block.time.toString().padStart(2, '0')}:00`,
            label: block.label,
            priority: block.priority as any,
            category: block.category || 'Geral',
            tasks: routineTasks,
            status: status as any
          };

          return (
            <RoutineCard
              key={block.id}
              block={routineBlock}
              onTaskToggle={(taskId) => handleTaskToggle(block.id, parseInt(taskId))}
              noteValue={reportsDraft[block.id] ?? tracking.report ?? ''}
              onNoteChange={(val) => handleReportChange(block.id, val)}
              onSendReport={() => handleReportSend(block.id)}
              isReportSent={tracking.reportSent}
              timestamp={tracking.timestamp}
              // Delay Handling
              onDelayReport={(reason, isImpossible) => handleDelayReport(block.id, reason, isImpossible)}
              isEscalated={tracking.escalated}
              delayReason={tracking.delayReason}
              isImpossible={tracking.isImpossible}
              // Attachments
              onAttachment={(files) => handleAttachment(block.id, files)}
              attachments={tracking.attachments}
            />
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
                Ao Vivo
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Simulation controls removed for operators */}
        </div>
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Central de Ajuda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Completar Tarefas
                </h4>
                <p className="text-sm text-muted-foreground">
                  Clique na caixa de seleção ao lado de cada tarefa para marcá-la como concluída.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Filtros
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use os botões de filtro para ver todas as tarefas, apenas pendentes ou apenas concluídas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  Relatórios
                </h4>
                <p className="text-sm text-muted-foreground">
                  Após concluir as tarefas de um bloco, preencha o campo de relatório e clique em "Enviar Relatório".
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Status dos Blocos
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>AGORA:</strong> Bloco atual • <strong>ATRASADO:</strong> Bloco passado com tarefas pendentes • <strong>Opaco:</strong> Blocos futuros
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CelebrationModal
        open={celebrationOpen}
        onOpenChange={setCelebrationOpen}
        userName={profile.name}
      />

      <OperatorAnalytics
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </div>
  );
};

export default Operator;
