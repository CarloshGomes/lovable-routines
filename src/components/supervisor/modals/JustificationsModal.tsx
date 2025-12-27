import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { AlertTriangle, Download, FileSpreadsheet, FileType, Calendar, CheckCircle, XCircle, Filter, Paperclip, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { REASON_LABELS, REASON_COLORS } from '@/constants/operations';

interface JustificationsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface JustificationData {
    id: string;
    reviewed: boolean;
    operatorName: string;
    operatorRole: string;
    blockLabel: string;
    blockTime: number | string;
    reason: string;
    reasonLabel: string;
    reasonColor: string;
    isImpossible: boolean;
    timestamp: string;
    date: string;
}

type DatePreset = 'today' | 'week' | 'month' | 'custom';

export const JustificationsModal = ({ open, onOpenChange }: JustificationsModalProps) => {
    const { userProfiles, schedules, trackingData } = useApp();
    const today = new Date();

    const [datePreset, setDatePreset] = useState<DatePreset>('today');
    const [startDate, setStartDate] = useState<Date>(today);
    const [endDate, setEndDate] = useState<Date>(today);
    const [reviewedJustifications, setReviewedJustifications] = useState<Set<string>>(() => {
        try {
            return new Set(JSON.parse(localStorage.getItem('reviewed_justifications') || '[]'));
        } catch {
            return new Set();
        }
    });

    const handleMarkAsReviewed = (id: string) => {
        const newReviewed = new Set(reviewedJustifications);
        newReviewed.add(id);
        setReviewedJustifications(newReviewed);
        localStorage.setItem('reviewed_justifications', JSON.stringify(Array.from(newReviewed)));
    };

    const getDateRange = (): { start: Date; end: Date } => {
        switch (datePreset) {
            case 'today':
                return { start: today, end: today };
            case 'week':
                return { start: subDays(today, 7), end: today };
            case 'month':
                return { start: subDays(today, 30), end: today };
            case 'custom':
                return { start: startDate, end: endDate };
            default:
                return { start: today, end: today };
        }
    };

    const dateRange = getDateRange();

    const getAllJustifications = (): JustificationData[] => {
        const items: JustificationData[] = [];

        Object.entries(userProfiles).forEach(([username, profile]) => {
            const schedule = schedules[username] || [];
            const userTracking = trackingData[username] || {};

            Object.entries(userTracking).forEach(([key, tracking]: [string, any]) => {
                const dateMatch = key.match(/^(\d{4}-\d{2}-\d{2})-/);
                if (!dateMatch) return;

                const dateStr = dateMatch[1];
                const dateObj = parseISO(dateStr);

                if (!isWithinInterval(dateObj, {
                    start: startOfDay(dateRange.start),
                    end: endOfDay(dateRange.end)
                })) return;

                if (tracking?.delayReason) {
                    const blockId = key.substring(11);
                    const block = schedule.find(b => b.id === blockId);
                    const id = `justification-${dateStr}-${username}-${blockId}`; // Original card used today-username-blockId, but key has date.
                    // JustificationsCard used: const justificationId = `${today}-${username}-${blockId}`; assuming it only showed today.
                    // Here we support ranges, so we must use the date from the key.
                    // Ideally consist with the previous card if we want to honor old reviews. 
                    // Previous card only showed 'today', so keys started with today's date.
                    // So `${dateStr}-${username}-${blockId}` is compatible.

                    const simpleId = `${dateStr}-${username}-${blockId}`;

                    items.push({
                        id: simpleId,
                        reviewed: reviewedJustifications.has(simpleId),
                        operatorName: profile.name,
                        operatorRole: profile.role,
                        blockLabel: block?.label || 'Bloco',
                        blockTime: block?.time ? `${String(block.time).padStart(2, '0')}:00` : '',
                        reason: tracking.delayReason,
                        reasonLabel: REASON_LABELS[tracking.delayReason] || tracking.delayReason,
                        reasonColor: REASON_COLORS[tracking.delayReason] || 'text-muted-foreground',
                        isImpossible: tracking.isImpossible || false,
                        timestamp: tracking.timestamp ? new Date(tracking.timestamp).toLocaleString('pt-BR') : '',
                        date: dateStr,
                        attachments: tracking.attachments || [],
                    });
                }
            });
        });

        return items.sort((a, b) => b.date.localeCompare(a.date));
    };

    const justifications = getAllJustifications();

    const getDateRangeLabel = () => {
        if (datePreset === 'today') return format(today, "dd 'de' MMMM", { locale: ptBR });
        if (datePreset === 'week') return `Últimos 7 dias`;
        if (datePreset === 'month') return `Últimos 30 dias`;
        return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        doc.setFontSize(18);
        doc.text('Justificativas de Operadores', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        doc.setFontSize(12);
        doc.text(`Período: ${getDateRangeLabel()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        justifications.forEach((item, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${item.operatorName} - ${item.blockLabel}`, 14, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Data: ${format(parseISO(item.date), 'dd/MM/yyyy')}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Cargo: ${item.operatorRole}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Motivo: ${item.reasonLabel}${item.isImpossible ? ' (Impossível de realizar)' : ''}`, 14, yPosition);
            yPosition += 10;

            doc.setDrawColor(200);
            doc.line(14, yPosition, pageWidth - 14, yPosition);
            yPosition += 10;
        });

        doc.save(`justificativas-${format(today, 'yyyy-MM-dd')}.pdf`);
        toast.success('PDF exportado com sucesso!');
    };

    const exportToExcel = () => {
        const data = justifications.map(item => ({
            'Data': format(parseISO(item.date), 'dd/MM/yyyy'),
            'Operador': item.operatorName,
            'Cargo': item.operatorRole,
            'Bloco': item.blockLabel,
            'Horário': item.blockTime,
            'Motivo': item.reasonLabel,
            'Impossível': item.isImpossible ? 'Sim' : 'Não',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Justificativas');
        XLSX.writeFile(wb, `justificativas.xlsx`);
        toast.success('Excel exportado com sucesso!');
    };

    const exportToWord = async () => {
        const children: Paragraph[] = [
            new Paragraph({
                text: 'Justificativas de Operadores',
                heading: HeadingLevel.TITLE,
                alignment: 'center' as const,
            }),
            new Paragraph({
                text: `Período: ${getDateRangeLabel()}`,
                alignment: 'center' as const,
                spacing: { after: 400 },
            }),
        ];

        justifications.forEach((item, index) => {
            children.push(
                new Paragraph({
                    text: `${index + 1}. ${item.operatorName} - ${item.blockLabel}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: 'Data: ', bold: true }),
                        new TextRun(format(parseISO(item.date), 'dd/MM/yyyy')),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: 'Cargo: ', bold: true }),
                        new TextRun(item.operatorRole),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: 'Motivo: ', bold: true }),
                        new TextRun(item.reasonLabel),
                        item.isImpossible ? new TextRun({ text: ' (IMPOSSÍVEL)', bold: true, color: 'FF0000' }) : new TextRun(""),
                    ],
                    spacing: { after: 200 },
                }),
            );
        });

        const doc = new Document({
            sections: [{ children }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `justificativas.docx`);
        toast.success('Word exportado com sucesso!');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        Justificativas de Atividades
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Date Filter */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Filtrar por Período:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setDatePreset('today')} variant={datePreset === 'today' ? 'default' : 'outline'} size="sm">Hoje</Button>
                            <Button onClick={() => setDatePreset('week')} variant={datePreset === 'week' ? 'default' : 'outline'} size="sm">7 dias</Button>
                            <Button onClick={() => setDatePreset('month')} variant={datePreset === 'month' ? 'default' : 'outline'} size="sm">30 dias</Button>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-muted/30 border border-border">
                        <span className="text-sm font-medium w-full mb-2">Exportar:</span>
                        <Button onClick={exportToPDF} variant="outline" size="sm" disabled={justifications.length === 0}><Download className="w-4 h-4 mr-2 text-danger" />PDF</Button>
                        <Button onClick={exportToExcel} variant="outline" size="sm" disabled={justifications.length === 0}><FileSpreadsheet className="w-4 h-4 mr-2 text-success" />Excel</Button>
                        <Button onClick={exportToWord} variant="outline" size="sm" disabled={justifications.length === 0}><FileType className="w-4 h-4 mr-2 text-primary" />Word</Button>
                    </div>

                    {/* List */}
                    {justifications.length > 0 ? (
                        <div className="space-y-4">
                            {justifications.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all duration-200",
                                        item.reviewed
                                            ? "bg-muted/30 border-border opacity-75"
                                            : "bg-card border-warning/30 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={cn("w-4 h-4", item.reviewed ? "text-muted-foreground" : "text-warning")} />
                                            <span className="font-semibold">{item.operatorName}</span>
                                            <span className="text-xs text-muted-foreground">({item.operatorRole})</span>
                                            {item.reviewed && <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-success/5 text-success border-success/20"><CheckCircle className="w-3 h-3" /> Revisado</Badge>}
                                            {item.isImpossible && <Badge variant="destructive" className="h-5 text-[10px] gap-1"><XCircle className="w-3 h-3" /> Impossível</Badge>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">{format(parseISO(item.date), "dd/MM")}</span>
                                                <span className="font-medium text-primary">{item.blockLabel}</span>
                                            </div>
                                            {!item.reviewed && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 text-primary"
                                                    onClick={() => handleMarkAsReviewed(item.id)}
                                                >
                                                    <CheckCircle className="w-3 h-3 mr-1.5" />
                                                    Revisar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="font-medium text-muted-foreground">Motivo:</span>
                                            <span className={cn("font-medium", item.reasonColor)}>{item.reasonLabel}</span>
                                        </p>
                                    </div>

                                    {item.attachments && item.attachments.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-border">
                                            <p className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground">
                                                <Paperclip className="w-3.5 h-3.5" />
                                                Anexos ({item.attachments.length}):
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.attachments.map((url, attachIdx) => (
                                                    <a
                                                        key={attachIdx}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border hover:bg-accent/5 transition-colors text-xs"
                                                    >
                                                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                                                        ) : (
                                                            <FileText className="w-3.5 h-3.5 text-orange-500" />
                                                        )}
                                                        <span className="max-w-[150px] truncate text-foreground group-hover:text-primary transition-colors">
                                                            Anexo {attachIdx + 1}
                                                        </span>
                                                        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Nenhuma justificativa encontrada.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
