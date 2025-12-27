import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { FileText, Download, FileSpreadsheet, FileType, Calendar, CheckCircle } from 'lucide-react';
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

interface ReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportData {
  id: string;
  reviewed: boolean;
  operatorName: string;
  operatorRole: string;
  blockLabel: string;
  blockTime: number;
  report: string;
  completedTasks: string[];
  totalTasks: string[];
  timestamp: string;
  date: string;
}

type DatePreset = 'today' | 'week' | 'month' | 'custom';

export const ReportsModal = ({ open, onOpenChange }: ReportsModalProps) => {
  const { userProfiles, schedules, trackingData } = useApp();
  const today = new Date();

  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);
  const [reviewedReports, setReviewedReports] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('reviewed_reports') || '[]'));
    } catch {
      return new Set();
    }
  });

  const handleMarkAsReviewed = (reportId: string) => {
    const newReviewed = new Set(reviewedReports);
    newReviewed.add(reportId);
    setReviewedReports(newReviewed);
    localStorage.setItem('reviewed_reports', JSON.stringify(Array.from(newReviewed)));
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

  const getAllReports = (): ReportData[] => {
    const reports: ReportData[] = [];

    Object.entries(userProfiles).forEach(([username, profile]) => {
      const schedule = schedules[username] || [];
      const userTracking = trackingData[username] || {};

      Object.entries(userTracking).forEach(([key, tracking]) => {
        const dateMatch = key.match(/^(\d{4}-\d{2}-\d{2})-/);
        if (!dateMatch) return;

        const reportDate = dateMatch[1];
        const reportDateObj = parseISO(reportDate);

        if (!isWithinInterval(reportDateObj, {
          start: startOfDay(dateRange.start),
          end: endOfDay(dateRange.end)
        })) return;

        if (tracking?.reportSent && tracking?.report) {
          const blockId = key.replace(`${reportDate}-`, '');
          const block = schedule.find(b => b.id === blockId);
          const reportId = `report-${reportDate}-${username}-${blockId}`;

          reports.push({
            id: reportId,
            reviewed: reviewedReports.has(reportId),
            operatorName: profile.name,
            operatorRole: profile.role,
            blockLabel: block?.label || 'Bloco',
            blockTime: block?.time || 0,
            report: tracking.report,
            completedTasks: block?.tasks.filter((_, idx) => tracking.tasks.includes(idx)) || [],
            totalTasks: block?.tasks || [],
            timestamp: new Date(reportDate).toLocaleString('pt-BR'),
            date: reportDate,
          });
        }
      });
    });

    return reports.sort((a, b) => b.date.localeCompare(a.date));
  };

  const reports = getAllReports();

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
    doc.text('Relatórios', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Período: ${getDateRangeLabel()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    reports.forEach((report, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${report.operatorName} - ${report.blockLabel}`, 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data: ${format(parseISO(report.date), 'dd/MM/yyyy')}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Cargo: ${report.operatorRole}`, 14, yPosition);
      yPosition += 6;

      doc.text(`Tarefas Concluídas: ${report.completedTasks.length}/${report.totalTasks.length}`, 14, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Relatório:', 14, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const splitReport = doc.splitTextToSize(report.report, pageWidth - 28);
      doc.text(splitReport, 14, yPosition);
      yPosition += splitReport.length * 5 + 10;

      doc.setDrawColor(200);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 10;
    });

    const filename = datePreset === 'today'
      ? `relatorios-${format(today, 'yyyy-MM-dd')}.pdf`
      : `relatorios-${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.pdf`;

    doc.save(filename);
    toast.success('PDF exportado com sucesso!');
  };

  const exportToExcel = () => {
    const data = reports.map(report => ({
      'Data': format(parseISO(report.date), 'dd/MM/yyyy'),
      'Operador': report.operatorName,
      'Cargo': report.operatorRole,
      'Bloco': report.blockLabel,
      'Horário': `${String(report.blockTime).padStart(2, '0')}:00`,
      'Tarefas Concluídas': report.completedTasks.join(', '),
      'Total de Tarefas': report.totalTasks.length,
      'Relatório': report.report,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatórios');

    ws['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 40 },
      { wch: 15 },
      { wch: 50 },
    ];

    const filename = datePreset === 'today'
      ? `relatorios-${format(today, 'yyyy-MM-dd')}.xlsx`
      : `relatorios-${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.xlsx`;

    XLSX.writeFile(wb, filename);
    toast.success('Excel exportado com sucesso!');
  };

  const exportToWord = async () => {
    const children: (Paragraph)[] = [
      new Paragraph({
        text: 'Relatórios',
        heading: HeadingLevel.TITLE,
        alignment: 'center' as const,
      }),
      new Paragraph({
        text: `Período: ${getDateRangeLabel()}`,
        alignment: 'center' as const,
        spacing: { after: 400 },
      }),
    ];

    reports.forEach((report, index) => {
      children.push(
        new Paragraph({
          text: `${index + 1}. ${report.operatorName} - ${report.blockLabel}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Data: ', bold: true }),
            new TextRun(format(parseISO(report.date), 'dd/MM/yyyy')),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Cargo: ', bold: true }),
            new TextRun(report.operatorRole),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Tarefas Concluídas: ', bold: true }),
            new TextRun(`${report.completedTasks.length}/${report.totalTasks.length}`),
          ],
        }),
        new Paragraph({
          text: 'Relatório:',
          spacing: { before: 200 },
          children: [new TextRun({ text: 'Relatório:', bold: true })],
        }),
        new Paragraph({
          text: report.report,
          spacing: { after: 200 },
        }),
      );
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = datePreset === 'today'
      ? `relatorios-${format(today, 'yyyy-MM-dd')}.docx`
      : `relatorios-${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.docx`;

    saveAs(blob, filename);
    toast.success('Word exportado com sucesso!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-accent" />
            Relatórios Enviados - Detalhes
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
              <Button
                variant={datePreset === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('today')}
              >
                Hoje
              </Button>
              <Button
                variant={datePreset === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('week')}
              >
                Últimos 7 dias
              </Button>
              <Button
                variant={datePreset === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('month')}
              >
                Últimos 30 dias
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={datePreset === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDatePreset('custom')}
                  >
                    Personalizado
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 space-y-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Data Inicial</span>
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        disabled={(date) => date > today}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Data Final</span>
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        disabled={(date) => date > today || date < startDate}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-muted-foreground">
              Período selecionado: <span className="font-medium text-foreground">{getDateRangeLabel()}</span>
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-muted/30 border border-border">
            <span className="text-sm font-medium w-full mb-2">Exportar Relatórios:</span>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={reports.length === 0}
            >
              <Download className="w-4 h-4 text-danger" />
              PDF
            </Button>
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={reports.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 text-success" />
              Excel
            </Button>
            <Button
              onClick={exportToWord}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={reports.length === 0}
            >
              <FileType className="w-4 h-4 text-primary" />
              Word
            </Button>
          </div>

          {/* Reports List */}
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200",
                    report.reviewed
                      ? "bg-muted/30 border-border opacity-75"
                      : "bg-card border-primary/20 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className={cn("w-4 h-4", report.reviewed ? "text-muted-foreground" : "text-primary")} />
                      <span className="font-semibold">{report.operatorName}</span>
                      <span className="text-xs text-muted-foreground">({report.operatorRole})</span>
                      {report.reviewed && (
                        <Badge variant="outline" className="h-5 text-[10px] gap-1 bg-success/5 text-success border-success/20">
                          <CheckCircle className="w-3 h-3" />
                          Lido
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(report.date), "dd/MM/yyyy")}
                        </span>
                        <span className="text-sm font-medium text-primary">{report.blockLabel}</span>
                      </div>
                      {!report.reviewed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 text-primary"
                          onClick={() => handleMarkAsReviewed(report.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Marcar como lido
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border">
                    <p className="text-sm">{report.report}</p>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Tarefas: {report.completedTasks.length}/{report.totalTasks.length} concluídas
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum relatório encontrado para o período selecionado</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};