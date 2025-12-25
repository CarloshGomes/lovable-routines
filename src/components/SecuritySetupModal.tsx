import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { ShieldAlert, Lock, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export const SecuritySetupModal = () => {
    const { supervisorPin, updateSupervisorPin, currentUser, isSupervisor, userProfiles, updateProfile } = useAuth();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    useEffect(() => {
        // Supervisor Logic: Force if '1234'
        if (isSupervisor && supervisorPin === '1234') {
            setIsOpen(true);
            return;
        }

        // Operator Logic: Force if Logged In AND (No PIN OR PIN is '1234')
        if (currentUser && !isSupervisor && userProfiles[currentUser]) {
            const profile = userProfiles[currentUser];
            if (!profile.pin || profile.pin === '1234') {
                setIsOpen(true);
                return;
            }
        }

        setIsOpen(false);
    }, [supervisorPin, currentUser, isSupervisor, userProfiles]);

    const handleSave = async () => {
        if (newPin.length < 4) {
            addToast('O PIN deve ter pelo menos 4 dígitos', 'error');
            return;
        }
        if (newPin === '1234') {
            addToast('Não use o PIN padrão. Escolha outro.', 'warning');
            return;
        }
        if (newPin !== confirmPin) {
            addToast('Os PINs não coincidem', 'error');
            return;
        }

        try {
            if (isSupervisor) {
                await updateSupervisorPin(newPin);
                addToast('Sua segurança foi atualizada com sucesso!', 'success');
            } else if (currentUser) {
                const profile = userProfiles[currentUser];
                if (profile) {
                    await updateProfile(currentUser, { ...profile, pin: newPin });
                    addToast('Seu PIN pessoal foi definido com sucesso!', 'success');
                }
            }
            setIsOpen(false);
        } catch (error) {
            addToast('Erro ao atualizar PIN', 'error');
        }
    };

    const getMessage = () => {
        if (isSupervisor) return "Detectamos que você ainda está usando o PIN padrão (1234).";
        return "Para sua segurança, é obrigatório definir um PIN de acesso pessoal.";
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { }} // Cannot be closed remotely
            title="Segurança Crítica"
            size="sm"
        >
            <div className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <h4 className="font-bold text-amber-500 mb-1">Ação Necessária</h4>
                        <p className="text-muted-foreground">
                            {getMessage()} Para proteger o sistema, defina uma nova senha de acesso agora.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Novo PIN</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="password"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono tracking-widest"
                                placeholder="••••"
                                maxLength={8}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirmar Novo PIN</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="password"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono tracking-widest"
                                placeholder="••••"
                                maxLength={8}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                    <Save className="w-4 h-4" />
                    Definir Nova Senha Segura
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />
                    Você não poderá fechar esta janela até alterar a senha.
                </p>
            </div>
        </Modal>
    );
};
