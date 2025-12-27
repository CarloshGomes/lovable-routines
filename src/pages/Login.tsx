import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Moon, Sun, ShieldCheck, UserCircle2, ArrowRight, Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';
import logoImage from '@/assets/logo.svg';
import { useLoginController } from '@/hooks/useLoginController';
import { SupervisorLogin } from '@/components/auth/SupervisorLogin';
import { AnimatedBackground } from '@/components/login/AnimatedBackground';
import { ProfileLoginCard } from '@/components/login/ProfileLoginCard';

const Login = () => {
  const { theme, toggleTheme } = useTheme();

  const {
    isLoading,
    isLoggingIn,
    userProfiles,
    showPinModal,
    showOperatorPinModal,
    selectedOperator,
    pin,
    showOperatorPin,
    setShowPinModal,
    setShowOperatorPinModal,
    setSelectedOperator,
    setPin,
    setShowOperatorPin,
    handleOperatorClick,
    handleOperatorPinSubmit,
    verifySupervisor
  } = useLoginController();

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
        <AnimatedBackground />
        <div className="flex flex-col items-center gap-6 z-10 p-10 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xl font-light tracking-widest text-foreground animate-pulse">CARREGANDO SISTEMA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      <AnimatedBackground />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:scale-110 hover:bg-white/10 transition-all duration-300 z-50 group"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-300 group-hover:rotate-90 transition-transform duration-500" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-300 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>

      <div className="w-full max-w-5xl z-10 grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Col: Brand (Visible on large screens, centered on mobile) */}
        <div className="text-center lg:text-left space-y-6 lg:pl-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full scale-150 animate-pulse" />
            <img src={logoImage} alt="Logo" className="w-28 h-28 lg:w-32 lg:h-32 object-contain relative drop-shadow-2xl animate-float" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-primary to-purple-600 bg-300% animate-gradient drop-shadow-sm">
              Rondon
              <br />
              Controle
            </h1>


          </div>
        </div>

        {/* Right Col: Login Card */}
        <div className="relative">
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-card/40 border border-white/10 shadow-2xl shadow-black/20 rounded-[2.5rem] p-6 sm:p-10 overflow-hidden relative">



            {isLoggingIn && (
              <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center rounded-[2.5rem]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-lg font-medium text-foreground animate-pulse">Autenticando...</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta</h2>
              <p className="text-muted-foreground">Selecione seu perfil para iniciar o turno.</p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(userProfiles).map(([username, profile], index) => (
                <ProfileLoginCard
                  key={username}
                  username={username}
                  profile={profile}
                  onClick={handleOperatorClick}
                  disabled={isLoggingIn}
                  index={index}
                />
              ))}
            </div>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Administrativo</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
              onClick={() => setShowPinModal(true)}
              disabled={isLoggingIn}
              className="w-full group relative overflow-hidden rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 transition-all hover:bg-indigo-500/20 hover:border-indigo-500/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground group-hover:text-indigo-300 transition-colors">Painel Supervisor</h3>
                    <p className="text-xs text-muted-foreground">Acesso restrito</p>
                  </div>
                </div>
                <Fingerprint className="w-5 h-5 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Operator PIN Modal */}
      <Modal
        isOpen={showOperatorPinModal}
        onClose={() => {
          setShowOperatorPinModal(false);
          setSelectedOperator(null);
          setPin('');
        }}
        title="Validar Acesso"
        size="sm"
      >
        <div className="space-y-6">
          {selectedOperator && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl border border-primary/10">
                {userProfiles[selectedOperator]?.avatar}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{userProfiles[selectedOperator]?.name}</p>
                <p className="text-sm text-muted-foreground">{userProfiles[selectedOperator]?.role}</p>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Digite seu PIN de 4 dígitos</label>
            <div className="relative group">
              <input
                type={showOperatorPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOperatorPinSubmit()}
                className="w-full px-5 py-4 pr-14 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none text-center text-3xl tracking-[0.5em] font-mono transition-all duration-200"
                placeholder="••••"
                maxLength={10}
                autoFocus
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowOperatorPin(!showOperatorPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 opacity-50 group-hover:opacity-100"
              >
                {showOperatorPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowOperatorPinModal(false)} className="flex-1" disabled={isLoggingIn}>
              Cancelar
            </Button>
            <Button onClick={handleOperatorPinSubmit} className="flex-1 shadow-lg shadow-primary/20" disabled={isLoggingIn}>
              {isLoggingIn ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
              {isLoggingIn ? 'Verificando...' : 'Acessar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Supervisor Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPin('');
        }}
        title=""
        size="sm"
        className="bg-transparent border-0 shadow-none p-0"
      >
        <SupervisorLogin
          onValidate={verifySupervisor}
          onSuccess={() => setShowPinModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Login;