import { useState, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    type: 'info' | 'warning' | 'error' | 'success';
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('supervisor_notifications');
        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse notifications', e);
            }
        }
    }, []);

    const saveNotifications = (notes: Notification[]) => {
        setNotifications(notes);
        localStorage.setItem('supervisor_notifications', JSON.stringify(notes));
    };

    const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
        const newNote: Notification = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            title,
            message,
            timestamp: Date.now(),
            read: false,
            type
        };
        saveNotifications([newNote, ...notifications]);
        return newNote;
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(updated);
    };

    const clearAll = () => {
        saveNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll };
};
