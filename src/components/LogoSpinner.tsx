import logoImage from '@/assets/logo.svg';

export const LogoSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative flex flex-col items-center gap-6">
            <div className="relative">
                {/* Logo */}
                <img
                    src={logoImage}
                    alt="Carregando..."
                    className="w-20 h-20 object-contain relative z-10 animate-pulse"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150 animate-pulse" />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full blur-xl animate-spin-slow opacity-60" />
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                    Rondon Controle
                </h2>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                </div>
            </div>
        </div>
    </div>
);
