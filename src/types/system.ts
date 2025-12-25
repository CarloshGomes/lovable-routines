export interface ActivityLog {
    id: number;
    type: 'login' | 'report_sent' | 'schedule_edit' | 'profile_edit';
    user: string;
    message: string;
    timestamp: string;
    metadata?: any;
}
