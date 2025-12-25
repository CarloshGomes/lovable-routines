export interface ScheduleBlock {
    id: string;
    time: number;
    label: string;
    tasks: string[];
    priority?: 'high' | 'medium';
    category?: 'sistema' | 'monitoramento' | 'organização' | 'comunicação';
    type?: 'break';
}

export interface TrackingData {
    tasks: number[];
    report: string;
    reportSent: boolean;
    timestamp: string;
}

export type ScheduleSnapshots = Record<string, Record<string, ScheduleBlock[]>>;
