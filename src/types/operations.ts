export interface ScheduleBlock {
    id: string;
    time: number;
    label: string;
    tasks: string[];
    priority?: 'high' | 'medium' | 'low';
    category?: 'sistema' | 'monitoramento' | 'organização' | 'comunicação';
    type?: 'break';
}

export interface TrackingData {
    tasks: number[];
    report: string;
    reportSent: boolean;
    timestamp: string;
    delayReason?: string;
    isImpossible?: boolean;
    escalated?: boolean;
    attachments?: string[];
}

export type ScheduleSnapshots = Record<string, Record<string, ScheduleBlock[]>>;
