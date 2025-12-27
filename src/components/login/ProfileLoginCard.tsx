import { UserProfile } from '@/types/auth'; // Adjust import if needed, assuming types exist
import { Lock, ArrowRight } from 'lucide-react';

interface ProfileLoginCardProps {
    username: string;
    profile: UserProfile;
    onClick: (username: string) => void;
    disabled?: boolean;
    index: number;
}

export const ProfileLoginCard = ({ username, profile, onClick, disabled, index }: ProfileLoginCardProps) => {
    return (
        <button
            onClick={() => onClick(username)}
            disabled={disabled}
            className="group relative w-full overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 text-left transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
        >
            {/* Dynamic Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl sm:text-4xl border border-white/10 shadow-lg shadow-black/5">
                            {profile.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                    </div>

                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                            {profile.name}
                        </h3>
                        <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                            {profile.role}
                        </p>

                        {profile.pin && (
                            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                <Lock className="w-3 h-3 text-primary" />
                                <span className="text-xs font-medium text-primary">PIN Protegido</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
                    <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </button>
    );
};
