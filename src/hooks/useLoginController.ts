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

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Reset states when modals close
    useEffect(() => {
        if (!showPinModal && !showOperatorPinModal) {
            setPin('');
            setShowOperatorPin(false);
            setShowSupervisorPin(false);
        }
    }, [showPinModal, showOperatorPinModal]);

    // Redirect if already logged in (only if not verifying credentials)
    useEffect(() => {
        if (!isLoading && !isLoggingIn) {
            if (isSupervisor) {
                navigate('/supervisor');
            } else if (currentUser) {
                navigate('/operator');
            }
        }
    }, [isLoading, currentUser, isSupervisor, navigate, isLoggingIn]);

    const handleOperatorClick = async (username: string) => {
        const profile = userProfiles[username];
        if (profile.pin) {
            setSelectedOperator(username);
            setShowOperatorPinModal(true);
        } else {
            setIsLoggingIn(true);
            // Simulate network/processing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            login(username);
            addToast(`Bem-vindo, ${profile.name}!`, 'success');
            navigate('/operator');
            setIsLoggingIn(false);
        }
    };

    const handleOperatorPinSubmit = async () => {
        if (selectedOperator && validateOperatorPin(selectedOperator, pin)) {
            setIsLoggingIn(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            login(selectedOperator);
            addToast(`Bem-vindo, ${userProfiles[selectedOperator].name}!`, 'success');
            setShowOperatorPinModal(false);
            navigate('/operator');
            setIsLoggingIn(false);
        } else {
            addToast('PIN incorreto', 'error');
            setPin('');
        }
    };

    const handleSupervisorAccess = async () => {
        if (pin === supervisorPin) {
            setIsLoggingIn(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            loginSupervisor();
            setShowPinModal(false);
            addToast('Acesso supervisor concedido', 'success');
            navigate('/supervisor');
            setIsLoggingIn(false);
        } else {
            addToast('PIN incorreto', 'error');
            setPin('');
        }
    };

    return {
        // State
        isLoading,
        isLoggingIn,
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
        handleSupervisorAccess,
        verifySupervisor: async (inputPin: string) => {
            await new Promise(resolve => setTimeout(resolve, 800));
            if (inputPin === supervisorPin) {
                loginSupervisor();
                addToast('Acesso supervisor concedido', 'success');
                return true;
            }
            return false;
        }
    };
};
