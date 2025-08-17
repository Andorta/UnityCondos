import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../custom_hooks/authContext';
import { Login } from '../pages/auth/login';
import NotFound from '../pages/general/notFound';
import Layout from '../layout/layout';
import { Payment } from '../pages/payments/payment';
import { Voting } from '../pages/votings/voting';
import { Announcement } from '../pages/announcements/announcement';
import { Task } from '../pages/tasks/task';
import { Register } from '../pages/auth/register';
import { ControlPanel } from '../pages/admin/controlPannel';
import Dashboard from '../pages/dashboard/dashboard';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to={location.state?.from || "/dashboard"} replace />;
    }

    return children;
};

function Root() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/payments" element={<Payment />} />
                    <Route path="/votings" element={<Voting />} />
                    <Route path="/announcements" element={<Announcement />} />
                    <Route path="/tasks" element={<Task />} />
                    <Route path="/control-panel" element={<ControlPanel />} />
                </Route>
                
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default Root;
