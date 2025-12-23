import { useState, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    type: 'info' | 'warning' | 'error' | 'success';
    metadata?: any;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const stored = localStorage.getItem('supervisor_notifications');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse notifications', e);
                return [];
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('supervisor_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (title: string, message: string, type: Notification['type'] = 'info', metadata?: any) => {
        const newNote: Notification = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            title,
            message,
            timestamp: Date.now(),
            read: false,
            type,
            metadata
        };
        setNotifications(prev => [newNote, ...prev]);
        return newNote;
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll };
};
