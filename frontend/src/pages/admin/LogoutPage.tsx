import React, { useEffect, useContext } from 'react';
import { Navigate } from 'react-router';
import AuthContext from '@/components/AuthContext';

const LogoutPage: React.FC = () => {
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        logout();
    }, [logout]);

    return <Navigate to="/" replace />;
};

export default LogoutPage;
