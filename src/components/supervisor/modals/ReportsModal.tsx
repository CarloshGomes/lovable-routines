import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { FileText, Download, FileSpreadsheet, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface ReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportData {
  operatorName: string;
  operatorRole: string;
  blockLabel: string;
  blockTime: number;
  report: string;
  completedTasks: string[];
  totalTasks: string[];
  timestamp: string;
}

export const ReportsModal = ({ open, onOpenChange }: ReportsModalProps) => {
  const { userProfiles, schedules, trackingData } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const reports: ReportData[] = [];

  Object.entries(userProfiles).forEach(([username, profile]) => {
    const schedule = schedules[username] || [];
    schedule.forEach((block) => {
      const tracking = trackingData[username]?.[`${today}-${block.id}`];
      if (tracking?.reportSent && tracking?.report) {
        reports.push({
          operatorName: profile.name,
          operatorRole: profile.role,
          blockLabel: block.label,
          blockTime: block.time,
          report: tracking.report,
          completedTasks: block.tasks.filter((_, idx) => tracking.tasks.includes(idx)),
          totalTasks: block.tasks,
          timestamp: new Date().toLocaleString('pt-BR'),
        });
      }
    });
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    doc.setFontSize(18);
    doc.text('Relatórios do Dia', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
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

    doc.save(`relatorios-${today}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const exportToExcel = () => {
    const data = reports.map(report => ({
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
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 40 },
      { wch: 15 },
      { wch: 50 },
    ];

    XLSX.writeFile(wb, `relatorios-${today}.xlsx`);
    toast.success('Excel exportado com sucesso!');
  };

  const exportToWord = async () => {
    const children: (Paragraph)[] = [
      new Paragraph({
        text: 'Relatórios do Dia',
        heading: HeadingLevel.TITLE,
        alignment: 'center' as const,
      }),
      new Paragraph({
        text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
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
    saveAs(blob, `relatorios-${today}.docx`);
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
                <div key={idx} className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{report.operatorName}</span>
                      <span className="text-xs text-muted-foreground">({report.operatorRole})</span>
                    </div>
                    <span className="text-sm font-medium text-primary">{report.blockLabel}</span>
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
              <p>Nenhum relatório enviado hoje</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
