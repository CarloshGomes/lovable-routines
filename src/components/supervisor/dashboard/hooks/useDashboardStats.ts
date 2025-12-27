import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';

export const useDashboardStats = () => {
    const { userProfiles, schedules, trackingData, activeUsers } = useApp();

    const today = new Date().toISOString().split('T')[0];

    const stats = useMemo(() => {
        // 1. Filter tracking data for today
        const todayTrackingData: Record<string, Record<string, any>> = {};
        Object.entries(trackingData).forEach(([username, userTracking]) => {
            todayTrackingData[username] = {};
            Object.entries(userTracking).forEach(([key, value]) => {
                if (key.startsWith(today)) {
                    const blockId = key.substring(11);
                    todayTrackingData[username][blockId] = value;
                }
            });
        });

        // 2. Calculate Totals
        let totalTasks = 0;
        let completedTasks = 0;
        let totalReports = 0;

        Object.keys(schedules).forEach((username) => {
            const schedule = schedules[username];
            const tracking = todayTrackingData[username] || {};

            schedule.forEach((block) => {
                totalTasks += block.tasks.length;
                const blockTracking = tracking[block.id];
                if (blockTracking) {
                    completedTasks += blockTracking.tasks.length;
                    if (blockTracking.reportSent) totalReports++;
                }
            });
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const totalUsers = Object.keys(userProfiles).length;

        // 3. Detect Late Operators
        const currentHour = new Date().getHours();
        const lateOperatorsData: { username: string; lateBlocks: typeof schedules[string] }[] = [];

        Object.entries(schedules).forEach(([username, schedule]) => {
            const tracking = todayTrackingData[username] || {};
            const lateBlocks = schedule.filter((block) => {
                // If block time is strictly less than current hour (meaning the hour has fully passed)
                // AND tasks are incomplete
                if (block.time < currentHour) {
                    const blockTracking = tracking[block.id];
                    return !blockTracking || blockTracking.tasks.length < block.tasks.length;
                }
                return false;
            });

            if (lateBlocks.length > 0) {
                lateOperatorsData.push({ username, lateBlocks });
            }
        });

        const lateOperators = lateOperatorsData.map(d => [d.username, schedules[d.username]] as [string, typeof schedules[string]]);

        return {
            todayTrackingData,
            totalTasks,
            completedTasks,
            totalReports,
            completionRate,
            totalUsers,
            lateOperatorsData,
            lateOperators
        };
    }, [userProfiles, schedules, trackingData, today]);

    return {
        ...stats,
        userProfiles,
        schedules,
        trackingData,
        activeUsers
    };
};
