import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Moon, Sun, ShieldCheck, UserCircle2, ArrowRight, Lock, Fingerprint, Sparkles, Activity, Eye, EyeOff } from 'lucide-react';
import logoImage from '@/assets/logo.svg';
import { useLoginController } from '@/hooks/useLoginController';

const Login = () => {
  const { theme, toggleTheme } = useTheme();

  const {
    isLoading,
    userProfiles,
    showPinModal,
    showOperatorPinModal,
    selectedOperator,
    pin,
    showOperatorPin,
    showSupervisorPin,
    setShowPinModal,
    setShowOperatorPinModal,
    setSelectedOperator,
    setPin,
    setShowOperatorPin,
    setShowSupervisorPin,
    handleOperatorClick,
    handleOperatorPinSubmit,
    handleSupervisorAccess
  } = useLoginController();

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-background">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl hover:scale-105 hover:border-primary/30 transition-all duration-300 z-50 group"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>

      <div className="w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-14">
          {/* Logo */}
          <div className="relative inline-flex justify-center mb-8">
            <div className="relative">
              <img
                src={logoImage}
                alt="Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative z-10 drop-shadow-2xl"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150 animate-pulse" />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full blur-xl animate-spin-slow opacity-60" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Rondon Controle
                </span>
                <Sparkles className="absolute -top-2 -right-6 w-5 h-5 text-primary animate-pulse" />
              </span>
            </h1>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sistema de Gestão Operacional</span>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
              Gestão operacional inteligente para sua equipe
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card/60 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl shadow-black/5 p-6 sm:p-8 lg:p-10">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <UserCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Selecione seu perfil
                </h2>
                <p className="text-sm text-muted-foreground">Escolha o operador para acessar</p>
              </div>
            </div>
          </div>

          {/* Operator Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {Object.entries(userProfiles).map(([username, profile], index) => (
              <button
                key={username}
                onClick={() => handleOperatorClick(username)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 p-5 sm:p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl sm:text-4xl border border-primary/10 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                        {profile.avatar}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {profile.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{profile.role}</p>
                      {profile.pin && (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                          <Lock className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">PIN</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="p-2 rounded-xl bg-muted group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-medium text-muted-foreground bg-card">
                Acesso administrativo
              </span>
            </div>
          </div>

          {/* Supervisor Button */}
          <button
            onClick={() => setShowPinModal(true)}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 hover:-translate-y-0.5"
          >
            {/* Animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                {/* Icon container */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-300">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  {/* Glow */}
                  <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Text */}
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-indigo-400 transition-colors duration-300">
                    Painel Supervisor
                  </h3>
                  <p className="text-sm text-muted-foreground">Acesso com PIN de segurança</p>
                </div>
              </div>

              {/* Fingerprint icon */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
                <Fingerprint className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground/60">
          <p>Rondon Controle v4.0</p>
        </div>
      </div>

      {/* Modal PIN Operador */}
      <Modal
        isOpen={showOperatorPinModal}
        onClose={() => {
          setShowOperatorPinModal(false);
          setSelectedOperator(null);
          setPin('');
        }}
        title="Acesso Operador"
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
            <label className="block text-sm font-medium text-foreground">Digite seu PIN</label>
            <div className="relative">
              <input
                type={showOperatorPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOperatorPinSubmit()}
                className="w-full px-5 py-4 pr-14 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-center text-2xl tracking-[0.5em] font-mono transition-all duration-200"
                placeholder="••••"
                maxLength={10}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowOperatorPin(!showOperatorPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {showOperatorPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowOperatorPinModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleOperatorPinSubmit} className="flex-1">
              <Lock className="w-4 h-4" />
              Entrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal PIN Supervisor */}
      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPin('');
        }}
        title="Acesso Supervisor"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Insira o PIN de supervisor para continuar</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">PIN de Acesso</label>
            <div className="relative">
              <input
                type={showSupervisorPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSupervisorAccess()}
                className="w-full px-5 py-4 pr-14 rounded-xl bg-muted/50 border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-center text-2xl tracking-[0.5em] font-mono transition-all duration-200"
                placeholder="••••"
                maxLength={10}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSupervisorPin(!showSupervisorPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {showSupervisorPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowPinModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSupervisorAccess} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">
              <Fingerprint className="w-4 h-4" />
              Acessar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;