import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export const useLoginController = () => {
    const navigate = useNavigate();
    const { userProfiles, supervisorPin, login, loginSupervisor, validateOperatorPin, isLoading, currentUser, isSupervisor } = useAuth();
    const { addToast } = useToast();

    const [showPinModal, setShowPinModal] = useState(false);
    const [showOperatorPinModal, setShowOperatorPinModal] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const [pin, setPin] = useState('');
    const [showOperatorPin, setShowOperatorPin] = useState(false);
    const [showSupervisorPin, setShowSupervisorPin] = useState(false);

    // Reset states when modals close
    useEffect(() => {
        if (!showPinModal && !showOperatorPinModal) {
            setPin('');
            setShowOperatorPin(false);
            setShowSupervisorPin(false);
        }
    }, [showPinModal, showOperatorPinModal]);

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading) {
            if (isSupervisor) {
                navigate('/supervisor');
            } else if (currentUser) {
                navigate('/operator');
            }
        }
    }, [isLoading, currentUser, isSupervisor, navigate]);

    const handleOperatorClick = (username: string) => {
        const profile = userProfiles[username];
        if (profile.pin) {
            setSelectedOperator(username);
            setShowOperatorPinModal(true);
        } else {
            login(username);
            addToast(`Bem-vindo, ${profile.name}!`, 'success');
            navigate('/operator');
        }
    };

    const handleOperatorPinSubmit = () => {
        if (selectedOperator && validateOperatorPin(selectedOperator, pin)) {
            login(selectedOperator);
            addToast(`Bem-vindo, ${userProfiles[selectedOperator].name}!`, 'success');
            setShowOperatorPinModal(false);
            navigate('/operator');
        } else {
            addToast('PIN incorreto', 'error');
            setPin('');
        }
    };

    const handleSupervisorAccess = () => {
        if (pin === supervisorPin) { // Note: using direct comparison as in original logic (Login.tsx L74), but AppContext has loginSupervisor(pin) which might be safer?
            // Wait, AppContext.tsx L57: loginSupervisor(pin) actually uses the argument? 
            // Let's check AppContext text again.
            // AppContext L346: loginSupervisor = async () => {...} It DOES NOT take an arg in implementation shown in file read step 425.
            // BUT Login.tsx L74 used: if (pin === supervisorPin) { loginSupervisor(); ... }
            // So keeping logic as is: check variable then call function.
            loginSupervisor();
            setShowPinModal(false);
            addToast('Acesso supervisor concedido', 'success');
            navigate('/supervisor');
        } else {
            addToast('PIN incorreto', 'error');
            setPin('');
        }
    };

    return {
        // State
        isLoading,
        userProfiles,
        showPinModal,
        showOperatorPinModal,
        selectedOperator,
        pin,
        showOperatorPin,
        showSupervisorPin,

        // Setters
        setShowPinModal,
        setShowOperatorPinModal,
        setSelectedOperator,
        setPin,
        setShowOperatorPin,
        setShowSupervisorPin,

        // Handlers
        handleOperatorClick,
        handleOperatorPinSubmit,
        handleSupervisorAccess
    };
};
