import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { GlassCard } from '@/components/GlassCard';
import { Moon, Sun, Shield, User, ChevronRight } from 'lucide-react';
import logoImage from '@/assets/logo.svg';

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
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 glass-card hover:scale-105 transition-all duration-300 animate-fadeIn z-10"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
      </button>

      <div className="w-full max-w-5xl animate-fadeIn">
        {/* Header com Logo */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative animate-float">
              <img 
                src={logoImage} 
                alt="Logo Sistema de Rotinas" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl -z-10 animate-glow" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient tracking-tight">
              Sistema de Rotinas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              Gestão Operacional Inteligente
            </p>
          </div>
        </div>

        {/* Card Principal */}
        <GlassCard className="p-8 md:p-10 animate-scaleIn">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-2">
              <User className="w-7 h-7 text-primary" />
              Selecione seu perfil
            </h2>
            <p className="text-muted-foreground ml-10">Escolha o operador para continuar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(userProfiles).map(([username, profile], index) => (
              <button
                key={username}
                onClick={() => handleLogin(username)}
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 text-left group relative overflow-hidden animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl bg-${profile.color}-500/20 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {profile.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {profile.name}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">{profile.role}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border/50 pt-6">
            <Button
              variant="outline"
              className="w-full group hover:border-primary/50 transition-all duration-300"
              onClick={() => setShowPinModal(true)}
            >
              <Shield className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span className="font-semibold">Acesso Supervisor</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <p>Sistema de Gestão Operacional v4.0</p>
        </div>
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
