import { Bell, BellOff, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/Button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
    notificationsEnabled: boolean;
    onToggleNotifications: () => void;
}

export const NotificationCenter = ({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    notificationsEnabled,
    onToggleNotifications
}: NotificationCenterProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="relative" size="icon">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", !notificationsEnabled && "text-muted-foreground opacity-50")}
                            onClick={onToggleNotifications}
                            title={notificationsEnabled ? "Silenciar notificações popup" : "Ativar notificações popup"}
                        >
                            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={onMarkAllAsRead}
                                title="Marcar todas como lidas"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={onClearAll}
                                title="Limpar todas"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notification.read && "bg-primary/5"
                                    )}
                                    onClick={() => onMarkAsRead(notification.id)}
                                >
                                    <div className={cn(
                                        "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                                        !notification.read ? "bg-primary" : "bg-transparent",
                                        notification.type === 'error' && "bg-destructive",
                                        notification.type === 'warning' && "bg-warning",
                                        notification.type === 'success' && "bg-success"
                                    )} />
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !notification.read && "font-semibold")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70">
                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
