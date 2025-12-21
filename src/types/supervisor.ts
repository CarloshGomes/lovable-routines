export interface UserProfile {
    name: string;
    role: string;
    avatar: string; // The emoji char
    color: string; // 'violet' | 'pink' | etc
}

export interface ScheduleBlock {
    id: string;
    time: number;
    label: string;
    priority?: 'high' | 'medium' | 'low';
    tasks: string[];
}

export interface BlockTracking {
    tasks: number[]; // indices of completed tasks
    report?: string;
    reportSent?: boolean;
}

export interface UserTracking {
    [blockId: string]: BlockTracking;
}

export interface TrackingData {
    [username: string]: {
        [dateKey: string]: BlockTracking; // dateKey format: 'YYYY-MM-DD-blockId' but here it's nested differently? 
        // In OperatorGrid refactoring I saw: Object.entries(userTracking).forEach(([key, value]) => ... if (key.startsWith(today))
        // So UserTracking in Dashboard seems to be flat keys 'YYYY-MM-DD-blockId'.
    };
}

// Actually, let's refine TrackingData based on usage in OperatorGrid
// The raw tracking data seems to be: Record<username, Record<compositeKey, BlockTracking>>
