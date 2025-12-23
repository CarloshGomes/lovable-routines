import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import { Trophy, Star, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';

interface CelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
}

export const CelebrationModal = ({ open, onOpenChange, userName }: CelebrationModalProps) => {
  useEffect(() => {
    if (open) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF4500', '#00BFFF', '#32CD32']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF4500', '#00BFFF', '#32CD32']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Big explosion at start
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-yellow-500 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="p-4 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-xl shadow-yellow-500/20"
          >
            <Trophy className="w-16 h-16 text-white drop-shadow-md" />
          </motion.div>

          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 animate-gradient">
                Parabéns, {userName.split(' ')[0]}!
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg"
            >
              Parabéns pela conclusão das demandas! Seu empenho, dedicação e organização foram fundamentais para o bom andamento das atividades.
              <br />
              <span className="text-sm opacity-80 font-medium mt-2 block">Continue com esse excelente desempenho!</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Meta Diária Concluída</span>
            <Star className="w-4 h-4 fill-current" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full pt-4"
          >
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 text-lg py-6"
            >
              Fechar
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
