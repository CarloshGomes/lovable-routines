import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SupervisorLoginProps {
    onValidate: (pin: string) => Promise<boolean>;
    onSuccess: () => void;
}

export function SupervisorLogin({ onValidate, onSuccess }: SupervisorLoginProps) {
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (attempts >= 3) {
            setError('Muitas tentativas. Aguarde 30 segundos.');
            return;
        }

        if (pin.length < 4) {
            setError('PIN muito curto');
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            const isValid = await onValidate(pin);

            if (!isValid) {
                setAttempts(prev => prev + 1);
                setError('PIN incorreto');
                setPin('');
            } else {
                onSuccess();
            }
        } catch (err) {
            setError('Erro ao validar PIN');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto p-6 bg-card rounded-xl border border-border shadow-sm"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Acesso Supervisor</h1>
                <p className="text-muted-foreground mt-2">
                    Digite seu PIN de segurança
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <Input
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value.replace(/\D/g, ''));
                            setError('');
                        }}
                        placeholder="••••••"
                        className="text-center text-2xl tracking-[0.5em] pr-12 h-14"
                        autoFocus
                        disabled={isValidating}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPin(!showPin)}
                        disabled={isValidating}
                    >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg overflow-hidden"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={pin.length < 4 || attempts >= 3 || isValidating}
                >
                    {isValidating ? 'Verificando...' : 'Entrar'}
                </Button>
            </form>

            {/* PIN Pad for mobile - Optional enhancements could go here */}
        </motion.div>
    );
}
