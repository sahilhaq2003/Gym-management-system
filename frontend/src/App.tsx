import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Overview } from './pages/dashboard/Overview';
import { Login } from './pages/auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MembersList } from './pages/members/MembersList';
import { AddMember } from './pages/members/AddMember';
import { EditMember } from './pages/members/EditMember';
import { Attendance } from './pages/attendance/Attendance';
import { AttendanceTest } from './pages/attendance/AttendanceTest';
import { AttendanceMarkingPage } from './pages/attendance/AttendanceMarkingPage';
import { Payments } from './pages/payments/Payments';
import { WorkoutPlans } from './pages/dashboard/WorkoutPlans';

import { MemberOverview } from './pages/dashboard/MemberOverview';
import { Home } from './pages/Home';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'member') {
    return <MemberOverview />;
  }

  // Default to Admin Overview for admin, staff, trainer
  return <Overview />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Home />} />

      {/* Dedicated Attendance Page (Public/Kiosk) */}
      <Route
        path="/attendance-marking"
        element={<AttendanceMarkingPage />}
      />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/members" element={<MembersList />} />
        <Route path="/members/add" element={<AddMember />} />
        <Route path="/members/edit/:id" element={<EditMember />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/test" element={<AttendanceTest />} />
        <Route path="/attendance/test" element={<AttendanceTest />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/workout-plans" element={<WorkoutPlans />} />
        <Route path="/settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
