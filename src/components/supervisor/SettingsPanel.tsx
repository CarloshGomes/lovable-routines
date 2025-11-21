import { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Lock, Download, Upload } from 'lucide-react';

const SettingsPanel = () => {
  const { supervisorPin, updateSupervisorPin, exportData, importData } = useApp();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handlePinChange = () => {
    if (newPin.length < 4) {
      addToast('PIN deve ter no mínimo 4 dígitos', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      addToast('PINs não coincidem', 'error');
      return;
    }
    updateSupervisorPin(newPin);
    addToast('PIN atualizado com sucesso', 'success');
    setNewPin('');
    setConfirmPin('');
  };

  const handleExport = () => {
    exportData();
    addToast('Dados exportados com sucesso', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importData(data);
        addToast('Dados importados com sucesso', 'success');
      } catch (error) {
        addToast('Erro ao importar dados', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      {/* PIN Change */}
      <GlassCard>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Alterar PIN do Supervisor
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">PIN Atual</label>
            <input
              type="password"
              value={supervisorPin}
              disabled
              className="w-full px-4 py-2 rounded-xl bg-muted border border-border text-center tracking-widest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Novo PIN</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none text-center tracking-widest"
              placeholder="Mínimo 4 dígitos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Novo PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none text-center tracking-widest"
              placeholder="Confirme o PIN"
            />
          </div>
          <Button onClick={handlePinChange} className="w-full">
            Atualizar PIN
          </Button>
        </div>
      </GlassCard>

      {/* Export */}
      <GlassCard>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Exportar Dados
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Faça backup de todos os dados do sistema (perfis, rotinas, tracking e configurações)
        </p>
        <Button onClick={handleExport} variant="success" className="w-full">
          <Download className="w-4 h-4" />
          Exportar Backup (JSON)
        </Button>
      </GlassCard>

      {/* Import */}
      <GlassCard>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Importar Dados
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Restaure um backup anterior do sistema. Esta ação substituirá todos os dados atuais.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          className="w-full"
        >
          <Upload className="w-4 h-4" />
          Selecionar Arquivo JSON
        </Button>
      </GlassCard>
    </div>
  );
};

export default SettingsPanel;
