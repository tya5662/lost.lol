import React from 'react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Toaster } from "@/components/ui/toaster";
// import { useToast } from "./hooks/use-toast";
// // import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable
// } from 'react-beautiful-dnd';
// import {
//   User,
//   Link as LinkType,
// } from './types';
// import type { ProfileSettings } from './types';
import {
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
// import {
//   LogIn,
//   Plus,
//   Trash2,
//   Menu
// } from 'lucide-react';
import ProfilePage from './components/pages/profile/ProfilePage';
import { HomePage } from './components/pages/homepage/HomePage';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/pages/dashboard/Dashboard';

import { Analytics } from "@vercel/analytics/react"


const App: React.FC = () => {
  return (
    <>
    <Analytics />
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/:username" element={<ProfilePage />} />
      </Routes>
    </Router>
    </>
  );
};

export default App;

// types.ts

// Additional setup files would be similar to the backend setup