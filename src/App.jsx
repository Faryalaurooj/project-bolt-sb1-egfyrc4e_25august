import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TaskBoards from './pages/TaskBoards';
import Campaigns from './pages/Campaigns';
import ContentCalendar from './pages/ContentCalendar';
import Contacts from './pages/Contacts';
import Surveys from './pages/Surveys';
import Texting from './pages/Texting';
import NotesActions from './pages/NotesActions';
import Automations from './pages/Automations';
import Reporting from './pages/Reporting';
import PageNotFound from './pages/PageNotFound';
import PipelineBoard from './components/pipeline/PipelineBoard';
import IvansUploadsPage from './pages/IvansUploadsPage';

import Attachments from './pages/Attachments';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import GoToAuthCallback from './pages/GoToAuthCallback';

function PrivateRoute({ children }) {
  const { user, loading, authError } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  if (authError) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md">
        <div className="text-red-500 text-center mb-4 text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-red-600 mb-4 text-center">Authentication Error</h2>
        <p className="text-gray-700 mb-4">{authError}</p>
        <p className="text-gray-600 mb-4">There was a problem connecting to the authentication service. This could be due to network issues or a configuration problem.</p>
        <div className="flex justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} /> {/* eslint-disable-line */}
        <Route path="/register" element={<RegisterForm />} />
        {/* Public callback route for GoTo OAuth */}
        <Route path="/goto-auth-callback" element={<GoToAuthCallback />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="taskboards" element={<TaskBoards />} />
          <Route path="pipeline" element={<PipelineBoard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="calendar" element={<ContentCalendar />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="texting" element={<Texting />} />
          <Route path="notes" element={<NotesActions />} />
          <Route path="automations" element={<Automations />} />
          <Route path="reporting" element={<Reporting />} />
         
          <Route path="attachments" element={<Attachments />} />
          <Route path="ivans-uploads" element={<IvansUploadsPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;