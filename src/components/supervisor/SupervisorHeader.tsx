import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Activity, Sun, Moon, LogOut } from 'lucide-react';
import { InteractiveLogo } from '../InteractiveLogo';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SupervisorHeaderProps {
    activeTab?: string;
    onNavigate?: (tab: string) => void;
}

export const SupervisorHeader = ({ activeTab = 'dashboard', onNavigate }: SupervisorHeaderProps) => {
    const navigate = useNavigate();
    const { logout } = useApp();
    const { theme, toggleTheme } = useTheme();

    const getBreadcrumbLabel = (tab: string) => {
        switch (tab) {
            case 'dashboard': return 'Visão Geral';
            case 'analytics': return 'Relatórios';
            case 'team': return 'Equipe';
            case 'routines': return 'Rotinas';
            case 'settings': return 'Ajustes';
            default: return 'Visão Geral';
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-2xl border-b border-border/50 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        {/* Left - Logo & Title */}
                        <div className="flex items-center gap-4">
                            <InteractiveLogo size="md" />

                            <div className="h-8 w-px bg-border/50" />

                            <div className="flex items-center gap-3">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                                        Painel Supervisor
                                    </h1>
                                    <Breadcrumb className="hidden sm:block">
                                        <BreadcrumbList>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                                                    Home
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>Supervisor</BreadcrumbPage>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage className="font-semibold text-primary">
                                                    {getBreadcrumbLabel(activeTab)}
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                            </div>
                        </div>

                        {/* Right - Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="hover:bg-primary/10"
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="shadow-lg shadow-danger/20"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sair</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
