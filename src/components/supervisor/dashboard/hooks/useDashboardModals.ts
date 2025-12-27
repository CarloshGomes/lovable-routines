import { useState } from 'react';

export const useDashboardModals = () => {
    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [tasksModalOpen, setTasksModalOpen] = useState(false);
    const [reportsModalOpen, setReportsModalOpen] = useState(false);
    const [justificationsModalOpen, setJustificationsModalOpen] = useState(false);
    const [operatorsModalOpen, setOperatorsModalOpen] = useState(false);

    return {
        completionModalOpen,
        setCompletionModalOpen,
        tasksModalOpen,
        setTasksModalOpen,
        reportsModalOpen,
        setReportsModalOpen,
        justificationsModalOpen,
        setJustificationsModalOpen,
        operatorsModalOpen,
        setOperatorsModalOpen,
    };
};
