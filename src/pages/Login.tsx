import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { GlassCard } from '@/components/GlassCard';
import { Moon, Sun, ChevronRight } from 'lucide-react';
import logoImage from '@/assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { userProfiles, supervisorPin, login, loginSupervisor } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  const handleLogin = (username: string) => {
    login(username);
    addToast(`Bem-vindo, ${userProfiles[username].name}!`, 'success');
    navigate('/operator');
  };

  const handleSupervisorAccess = () => {
    if (pin === supervisorPin) {
      loginSupervisor();
      addToast('Acesso supervisor concedido', 'success');
      navigate('/supervisor');
    } else {
      addToast('PIN incorreto', 'error');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulseSlow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulseSlow" style={{ animationDelay: '2s' }} />
      </div>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 glass-card hover:scale-105 transition-transform"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-4xl animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-lg">
              <img src={logoImage} alt="Logo" className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-2 text-foreground">Sistema de Controle</h1>
          <p className="text-sm text-muted-foreground tracking-[0.3em] uppercase">Rastreamento V4.0</p>
        </div>

        <GlassCard className="p-8">
          <div className="space-y-4 mb-8">
            {Object.entries(userProfiles).map(([username, profile]) => (
              <button
                key={username}
                onClick={() => handleLogin(username)}
                className="w-full glass-card p-6 hover:scale-[1.02] transition-all text-left group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-${profile.color}-500/20`}
                  >
                    {profile.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile.role}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-6">
            <button
              onClick={() => setShowPinModal(true)}
              className="w-full text-center text-sm text-muted-foreground tracking-[0.2em] uppercase hover:text-foreground transition-colors"
            >
              Administração
            </button>
          </div>
        </GlassCard>
      </div>

      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPin('');
        }}
        title="Acesso Supervisor"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Digite o PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSupervisorAccess()}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none text-center text-2xl tracking-widest"
              placeholder="••••"
              maxLength={10}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowPinModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSupervisorAccess} className="flex-1">
              Entrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
