import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle2, Circle, User, Download } from 'lucide-react';
import { Button } from '@/components/Button';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from 'docx';
import { useToast } from '@/contexts/ToastContext';

interface TasksCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TasksCompletedModal = ({ open, onOpenChange }: TasksCompletedModalProps) => {
  const { userProfiles, schedules, trackingData } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const { addToast } = useToast();

  const [operatorFilter, setOperatorFilter] = useState<string>('all');

  // Helper to download blob with fallback if file-saver/saveAs fails
  const downloadBlob = (filename: string, blob: Blob) => {
    try {
      saveAs(blob, filename);
      return;
    } catch (e) {
      console.warn('[downloadBlob] saveAs failed, falling back to anchor download', e);
    }

    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[downloadBlob] fallback failed', err);
      addToast('Não foi possível iniciar o download do arquivo', 'error');
    }
  };

  const operatorTasks = Object.entries(userProfiles).map(([username, profile]) => {
    const schedule = schedules[username] || [];
    const tasks: { blockLabel: string; task: string; completed: boolean; completedAt?: string | null }[] = [];

    schedule.forEach((block) => {
      const tracking = trackingData[username]?.[`${today}-${block.id}`];
      block.tasks.forEach((task, idx) => {
        const completed = Boolean(tracking?.tasks?.includes(idx));
        const completedAt = completed ? tracking?.timestamp : null;
        tasks.push({
          blockLabel: block.label,
          task,
          completed,
          completedAt,
        });
      });
    });

    return {
      username,
      profile,
      tasks,
      completedCount: tasks.filter(t => t.completed).length,
      totalCount: tasks.length,
    };
  });

  const allRows = operatorTasks.flatMap(({ username, profile, tasks }) => (
    tasks.map((t) => ({
      username,
      name: profile.name,
      role: profile.role,
      blockLabel: t.blockLabel,
      task: t.task,
      completed: Boolean(t.completed),
      completedAt: t.completedAt || null,
    }))
  ));

  const exportExcel = async (operatorFilter?: string) => {
    try {
      const rowsSource = operatorFilter && operatorFilter !== 'all'
        ? allRows.filter(r => r.username === operatorFilter)
        : allRows.slice();
      console.log('[ExportExcel] operatorFilter=', operatorFilter, 'rows=', rowsSource.length);

      const ws = XLSX.utils.json_to_sheet(rowsSource.map(r => ({
        Operador: r.name,
        Usuario: r.username,
        Cargo: r.role,
        Horario: r.blockLabel,
        Tarefa: r.task,
        Concluida: r.completed ? 'Sim' : 'Não',
        HoraConclusao: r.completedAt ? new Date(r.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tarefas Concluidas');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      console.log('[ExportExcel] blob size=', blob.size);
      addToast(`Gerando arquivo Excel (${rowsSource.length} linhas)`, 'info');
      downloadBlob(`tarefas_concluidas_${today}.xlsx`, blob);
      addToast('Exportação Excel concluída', 'success');
    } catch (e) {
      console.error('Erro exportando Excel', e);
      addToast('Erro ao exportar Excel', 'error');
    }
  };

  const exportPDF = async (operatorFilter?: string) => {
    try {
      const rowsSource = operatorFilter && operatorFilter !== 'all'
        ? allRows.filter(r => r.username === operatorFilter)
        : allRows.slice();
      console.log('[ExportPDF] operatorFilter=', operatorFilter, 'rows=', rowsSource.length);

      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Tarefas Concluídas - ${today}`, 14, 20);
      doc.setFontSize(10);
      let y = 30;
      doc.setFont(undefined, 'bold');
      doc.text('Operador | Horário | Tarefa | Concluída | Hora', 14, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      rowsSource.forEach((r) => {
        const status = r.completed ? 'Sim' : 'Não';
        const time = r.completedAt ? new Date(r.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        const line = `${r.name} | ${r.blockLabel} | ${r.task} | ${status} | ${time}`;
        doc.text(line, 14, y);
        y += 7;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      const blob = doc.output('blob');
      console.log('[ExportPDF] blob size=', blob.size);
      addToast(`Gerando arquivo PDF (${rowsSource.length} linhas)`, 'info');
      downloadBlob(`tarefas_concluidas_${today}.pdf`, blob);
      addToast('Exportação PDF concluída', 'success');
    } catch (e) {
      console.error('Erro exportando PDF', e);
      addToast('Erro ao exportar PDF', 'error');
    }
  };

  const exportWord = async (operatorFilter?: string) => {
    try {
      const rowsSource = operatorFilter && operatorFilter !== 'all'
        ? allRows.filter(r => r.username === operatorFilter)
        : allRows.slice();
      console.log('[ExportWord] operatorFilter=', operatorFilter, 'rows=', rowsSource.length);

      const rows = [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun('Operador')]} )], width: { size: 20, type: WidthType.PERCENTAGE }}),
          new TableCell({ children: [new Paragraph({ children: [new TextRun('Horario')]} )], width: { size: 20, type: WidthType.PERCENTAGE }}),
          new TableCell({ children: [new Paragraph({ children: [new TextRun('Tarefa')]} )], width: { size: 45, type: WidthType.PERCENTAGE }}),
          new TableCell({ children: [new Paragraph({ children: [new TextRun('Concluída')]} )], width: { size: 15, type: WidthType.PERCENTAGE }}),
          new TableCell({ children: [new Paragraph({ children: [new TextRun('Hora')]} )], width: { size: 15, type: WidthType.PERCENTAGE }}),
        ]})
      ];

      rowsSource.forEach(r => {
        rows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph(r.name)] }),
          new TableCell({ children: [new Paragraph(r.blockLabel)] }),
          new TableCell({ children: [new Paragraph(r.task)] }),
          new TableCell({ children: [new Paragraph({ children: [ new TextRun({ text: r.completed ? 'Sim' : 'Não', color: r.completed ? '008000' : 'B00000' }) ] })] }),
          new TableCell({ children: [new Paragraph(r.completedAt ? new Date(r.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '')] }),
        ]}));
      });

      const doc = new Document({ sections: [{ children: [ new Paragraph({ text: `Tarefas Concluídas - ${today}`, heading: 'Heading1' }), new Table({ rows }) ] }] });
      const blob = await Packer.toBlob(doc);
      console.log('[ExportWord] blob size=', blob.size);
      addToast(`Gerando arquivo Word (${rowsSource.length} linhas)`, 'info');
      downloadBlob(`tarefas_concluidas_${today}.docx`, blob);
      addToast('Exportação Word concluída', 'success');
    } catch (e) {
      console.error('Erro exportando Word', e);
      addToast('Erro ao exportar Word', 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Tarefas Concluídas - Detalhes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                className="px-3 py-1 rounded bg-muted border border-border text-sm"
              >
                <option value="all">Todos</option>
                {Object.keys(userProfiles).map((u) => (
                  <option key={u} value={u}>{userProfiles[u].name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" variant="primary" onClick={() => exportPDF(operatorFilter)} aria-label="Exportar PDF">
                <Download className="w-4 h-4" /> PDF
              </Button>
              <Button size="sm" variant="success" onClick={() => exportExcel(operatorFilter)} aria-label="Exportar Excel">
                <Download className="w-4 h-4" /> Excel
              </Button>
              <Button size="sm" variant="secondary" onClick={() => exportWord(operatorFilter)} aria-label="Exportar Word">
                <Download className="w-4 h-4" /> Word
              </Button>
            </div>
          </div>
          {operatorTasks.map(({ username, profile, tasks, completedCount, totalCount }) => (
            <div key={username} className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${profile.color}-500/20 text-xl`}>
                  {profile.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-xs text-muted-foreground">{profile.role}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{completedCount}/{totalCount}</div>
                  <div className="text-xs text-muted-foreground">tarefas</div>
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.task}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {task.blockLabel}
                        </span>
                        {task.completedAt && (
                          <span className="text-xs text-success/80 px-2 py-1 rounded bg-success/10">
                            {new Date(task.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tarefa programada
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
