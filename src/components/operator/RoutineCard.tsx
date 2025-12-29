import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CheckCircle2, AlertTriangle, ChevronDown,
    MessageSquare, Paperclip, Check, Send, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface Task {
    id: string;
    label: string;
    completed: boolean;
}

export interface RoutineBlock {
    id: string;
    time: string;
    label: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    tasks: Task[];
    status: 'future' | 'current' | 'late' | 'done';
}

const statusConfig = {
    future: {
        icon: Clock,
        label: 'Aguardando',
        className: 'opacity-60 hover:opacity-80 bg-muted/30 border-dashed',
        badgeVariant: 'secondary' as const,
    },
    current: {
        icon: Clock,
        label: 'AGORA',
        className: 'ring-2 ring-primary ring-offset-2 shadow-lg bg-card',
        badgeVariant: 'default' as const,
    },
    late: {
        icon: AlertTriangle,
        label: 'ATRASADO',
        className: 'border-l-4 border-l-destructive bg-destructive/5',
        badgeVariant: 'destructive' as const,
    },
    done: {
        icon: CheckCircle2,
        label: 'Concluído',
        className: 'opacity-70 bg-success/5 border-l-4 border-l-success',
        badgeVariant: 'outline' as const,
    },
};

const priorityConfig = {
    high: { label: 'Alta', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    medium: { label: 'Média', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    low: { label: 'Baixa', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

interface RoutineCardProps {
    block: RoutineBlock;
    onTaskToggle: (taskId: string) => void;
    // Reporting Props
    noteValue?: string;
    onNoteChange?: (note: string) => void;
    onSendReport?: () => void;
    isReportSent?: boolean;
    // Delay Handling Props
    onDelayReport?: (reason: string, isImpossible: boolean) => void;
    isEscalated?: boolean;
    delayReason?: string;
    isImpossible?: boolean;
    timestamp?: string;
    // Attachment Props
    onAttachment?: (files: FileList) => void;
    attachments?: string[];
    readOnly?: boolean;
}

export function RoutineCard({
    block,
    onTaskToggle,
    noteValue = '',
    onNoteChange,
    onSendReport,
    isReportSent = false,
    onDelayReport,
    isEscalated = false,
    delayReason,
    isImpossible,
    timestamp,
    onAttachment,
    attachments = [],
    readOnly = false
}: RoutineCardProps) {
    const [isOpen, setIsOpen] = useState(block.status === 'current');
    // Local state for visibility toggle only, content controlled by parent
    const [showNotes, setShowNotes] = useState(false);
    // Local state for delay justification
    const [selectedDelayReason, setSelectedDelayReason] = useState<string>('');

    const handleFileClick = () => {
        document.getElementById(`file-upload-${block.id}`)?.click();
    };

    const handleSendJustification = () => {
        if (selectedDelayReason && onDelayReport) {
            onDelayReport(selectedDelayReason, false);
            setSelectedDelayReason(''); // Reset after sending
        }
    };

    const handleMarkImpossible = () => {
        if (onDelayReport) {
            onDelayReport('impossible_to_complete', true);
            setSelectedDelayReason(''); // Reset after sending
        }
    };

    const config = statusConfig[block.status];
    const StatusIcon = config.icon;
    const completedTasks = block.tasks.filter(t => t.completed).length;
    const totalTasks = block.tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const isCompleted = progress === 100;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-card rounded-xl border shadow-sm transition-all duration-300 overflow-hidden",
                config.className,
                isOpen && "ring-1 ring-primary/20",
                block.status === 'current' && "shadow-primary/5"
            )}
            role="article"
            aria-label={`Bloco: ${block.label}, Status: ${config.label}`}
        >
            {/* Header */}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        {/* Left: Time + Info */}
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center min-w-[3.5rem] bg-muted/50 rounded-lg p-2">
                                <span className="text-2xl font-bold tabular-nums leading-none">
                                    {block.time.split(':')[0]}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {block.time.split(':')[1]}
                                </span>
                            </div>

                            <div className="space-y-1.5 pt-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-lg leading-tight tracking-tight text-foreground">
                                        {block.label}
                                    </h3>
                                    <Badge
                                        variant={config.badgeVariant}
                                        className="text-[10px] px-1.5 h-5 font-bold uppercase tracking-wider gap-1"
                                    >
                                        <StatusIcon className="w-3 h-3" />
                                        {config.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-background/50">
                                        {block.category}
                                    </Badge>
                                    {block.priority && (
                                        <Badge className={cn("text-xs font-normal border-0", priorityConfig[block.priority].className)}>
                                            {priorityConfig[block.priority].label}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
                                <Progress value={progress} className="w-16 h-1.5" />
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform duration-200",
                                        isOpen && "rotate-180"
                                    )} />
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>

                    {/* Mobile Progress Bar (Visible when closed) */}
                    {!isOpen && (
                        <div className="mt-3 sm:hidden">
                            <Progress value={progress} className="h-1" />
                        </div>
                    )}
                </div>

                {/* Expandable Content */}
                <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4">
                        {/* Divider */}
                        <div className="h-px bg-border/50 w-full" />

                        {/* Tasks */}
                        <div className="space-y-1">
                            {block.tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-all duration-200",
                                        "hover:bg-muted/50 border border-transparent hover:border-border/50",
                                        task.completed ? "bg-muted/30" : "bg-card"
                                    )}
                                    whileTap={{ scale: 0.995 }}
                                >
                                    <Checkbox
                                        id={`task-${task.id}`}
                                        checked={task.completed}
                                        onCheckedChange={() => !readOnly && onTaskToggle(task.id)}
                                        disabled={readOnly}
                                        className="w-5 h-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label
                                        htmlFor={`task-${task.id}`}
                                        className={cn(
                                            "flex-1 text-sm font-medium leading-normal select-none transition-colors",
                                            !readOnly && "cursor-pointer",
                                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                                        )}>
                                        {task.label}
                                    </label>
                                    {task.completed && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-success">
                                            <Check className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Actions */}
                        {!readOnly && (
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="h-9 gap-2 text-xs"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {showNotes || noteValue ? 'Observação' : 'Adicionar Nota'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2 text-xs"
                                    onClick={handleFileClick}
                                    disabled={isReportSent}
                                >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    {attachments.length > 0 ? `${attachments.length} Anexo(s)` : 'Anexo'}
                                </Button>
                                <input
                                    id={`file-upload-${block.id}`}
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        if (e.target.files && onAttachment) {
                                            onAttachment(e.target.files);
                                        }
                                    }}
                                />
                                <div className="flex-1" />

                                {isReportSent ? (
                                    <div className="flex items-center gap-2 text-sm text-success font-medium px-3 py-1.5 bg-success/10 rounded-md">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Enviado às {timestamp ? new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00'}</span>
                                    </div>
                                ) : (
                                    <Button
                                        variant={isCompleted ? "default" : "secondary"}
                                        size="sm"
                                        onClick={onSendReport}
                                        disabled={!isCompleted && !noteValue}
                                        className={cn(
                                            "min-w-[140px] h-9 gap-2 transition-all",
                                            isCompleted ? "bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20" : ""
                                        )}
                                    >
                                        {isCompleted ? <Send className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {isCompleted ? 'Enviar Relatório' : 'Aguardando Tarefas'}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Notes Input */}
                        <AnimatePresence>
                            {(showNotes || noteValue) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <textarea
                                        value={noteValue}
                                        onChange={(e) => onNoteChange?.(e.target.value)}
                                        disabled={isReportSent || readOnly}
                                        className="w-full min-h-[80px] mt-3 p-3 rounded-lg border bg-muted/30 focus:bg-background resize-none text-sm transition-colors focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/50 disabled:opacity-70 disabled:cursor-not-allowed"
                                        placeholder="Adicione observações ou o relatório das atividades..."
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Late Block Handling - Escalation UI */}
                        {block.status === 'late' && !isEscalated && onDelayReport && !readOnly && (
                            <div className="mt-4 p-4 rounded-xl bg-danger/5 border border-danger/20 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-3 text-danger font-medium">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm">Justificar Atraso</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <select
                                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-danger/30 focus:border-danger focus:ring-2 focus:ring-danger/20 outline-none text-sm h-9"
                                        onChange={(e) => setSelectedDelayReason(e.target.value)}
                                        value={selectedDelayReason}
                                    >
                                        <option value="" disabled>Selecione o motivo...</option>
                                        <option value="high_demand">Alta demanda de chamados</option>
                                        <option value="system_slowness">Lentidão no sistema</option>
                                        <option value="external_factor">Fatores externos</option>
                                        <option value="break_adjustment">Ajuste de intervalo</option>
                                        <option value="other">Outro (Descrever acima)</option>
                                    </select>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground shadow-none h-9"
                                            onClick={handleSendJustification}
                                            disabled={!selectedDelayReason}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Justificativa
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="whitespace-nowrap shadow-none border border-danger/50 h-9"
                                            onClick={handleMarkImpossible}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Marcar Impossível
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Escalated Feedback */}
                        {block.status === 'late' && isEscalated && (
                            <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-between">
                                <span className="text-sm font-medium text-danger flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    {isImpossible ? 'Marcado como Impossível' : 'Atraso Justificado'}
                                </span>
                                <Badge variant="destructive" className="bg-danger/20 text-danger hover:bg-danger/20 border-0">
                                    {delayReason === 'high_demand' && 'Alta Demanda'}
                                    {delayReason === 'system_slowness' && 'Sistema Lento'}
                                    {delayReason === 'external_factor' && 'Externo'}
                                    {delayReason === 'break_adjustment' && 'Intervalo'}
                                    {delayReason === 'other' && 'Outro'}
                                    {delayReason === 'impossible_to_complete' && 'Cancelado'}
                                </Badge>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </motion.div>
    );
}
