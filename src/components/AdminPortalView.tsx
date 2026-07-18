/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserSession,
  NetworkIncident,
  FEDocket,
  FeedbackCall,
  UnlinkRouter,
  ComplaintManagement,
  WhatsAppReport,
  CyberCrimeReport,
  MailWhatsAppCountReport,
  TechInformationUpdate,
  AuditLog
} from '../types';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updatePassword, signInWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Plus,
  Edit3,
  Eye,
  EyeOff,
  User,
  Shield,
  Trash2,
  Lock,
  Mail,
  UserCheck,
  Check,
  X,
  AlertCircle,
  Key,
  LockKeyhole,
  History,
  Download,
  BarChart3,
  Activity,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { fetchSheetData, SHEET_HEADERS } from '../lib/sheetsService';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AdminAnalyticsPanel from './AdminAnalyticsPanel';
import ConfirmationModal from './ConfirmationModal';

// Initialize a secondary Firebase application for background Auth management
// This prevents admin's active session from being terminated when registering/modifying other users
const adminApp = getApps().find((app) => app.name === 'AdminApp') || initializeApp(firebaseConfig, 'AdminApp');
const adminAuth = getAuth(adminApp);

interface Props {
  currentUser: UserSession;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onTriggerMyPasswordChange: () => void;
  googleToken?: string | null;
  syncSpreadsheetId?: string | null;
  incidents: NetworkIncident[];
  dockets: FEDocket[];
  feedbacks: FeedbackCall[];
  routers: UnlinkRouter[];
  complaints: ComplaintManagement[];
  waReports: WhatsAppReport[];
  cyberReports: CyberCrimeReport[];
  mailReports: MailWhatsAppCountReport[];
  techUpdates: TechInformationUpdate[];
  onWriteAuditLog: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LINK' | 'UNLINK', category: string, details: string) => Promise<void>;
}

interface Supervisor {
  id: string; // Firebase uid
  username: string;
  email: string;
  role: 'Admin' | 'Standard';
  password?: string;
}

interface UserActivityLog {
  id: string;
  email: string;
  username: string;
  date: string;
  firstLogin: string;
  lastLogout: string;
}

export default function AdminPortalView({
  currentUser,
  showToast,
  onTriggerMyPasswordChange,
  googleToken,
  syncSpreadsheetId,
  incidents,
  dockets,
  feedbacks,
  routers,
  complaints,
  waReports,
  cyberReports,
  mailReports,
  techUpdates,
  onWriteAuditLog
}: Props) {
  const [users, setUsers] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'logs' | 'analytics' | 'audit'>('directory');
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [exportingLogs, setExportingLogs] = useState(false);
  const [exportingAllData, setExportingAllData] = useState(false);

  // Audit Logs States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<'All' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LINK' | 'UNLINK'>('All');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('All');
  const [auditEmailFilter, setAuditEmailFilter] = useState<string>('All');

  // Clearing Old Logs states
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  // Compute unique emails from audit logs
  const uniqueEmails = useMemo(() => {
    const emails = new Set<string>();
    auditLogs.forEach((log) => {
      if (log.userEmail) {
        emails.add(log.userEmail.trim());
      }
    });
    return Array.from(emails).sort((a, b) => a.localeCompare(b));
  }, [auditLogs]);

  // Compute filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.details?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.username?.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(auditSearch.toLowerCase());
      const matchesAction = auditActionFilter === 'All' || log.action === auditActionFilter;
      const matchesCategory = auditCategoryFilter === 'All' || log.category === auditCategoryFilter;
      const matchesEmail =
        auditEmailFilter === 'All' ||
        log.userEmail?.toLowerCase().trim() === auditEmailFilter.toLowerCase().trim();
      return matchesSearch && matchesAction && matchesCategory && matchesEmail;
    });
  }, [auditLogs, auditSearch, auditActionFilter, auditCategoryFilter, auditEmailFilter]);

  // Handle deleting audit logs older than 60 days
  const handleClearOldLogs = async () => {
    setIsConfirmClearOpen(false);
    setIsClearingLogs(true);
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const logsToDelete = auditLogs.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp);
        return !isNaN(logDate.getTime()) && logDate < sixtyDaysAgo;
      });

      if (logsToDelete.length === 0) {
        showToast('No logs found older than 60 days', 'info');
        setIsClearingLogs(false);
        return;
      }

      // Delete the old logs from Firestore
      const deletePromises = logsToDelete.map((log) =>
        deleteDoc(doc(db, 'audit_logs', log.id))
      );
      await Promise.all(deletePromises);

      // Log this deletion itself as a new audit log
      await onWriteAuditLog(
        'DELETE',
        'AuditLogs',
        `Cleared ${logsToDelete.length} audit logs older than 60 days (before ${sixtyDaysAgo.toLocaleDateString()})`
      );

      showToast(`Successfully cleared ${logsToDelete.length} old audit logs`, 'success');
    } catch (error) {
      console.error('Error clearing old logs:', error);
      showToast('Failed to clear old logs', 'error');
    } finally {
      setIsClearingLogs(false);
    }
  };

  // Add User Form states
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'Admin' | 'Standard'>('Standard');
  const [isAdding, setIsAdding] = useState(false);

  // Edit User Modal/Form states
  const [editingUser, setEditingUser] = useState<Supervisor | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Standard'>('Standard');
  const [editPassword, setEditPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Reveal password states map (userId -> boolean)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // 1. Subscribe to registered users log from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const uList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Supervisor[];
        setUsers(uList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users collection:', error);
        showToast('Failed to sync registered user directory', 'error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 1b. Subscribe to user activity logs from Firestore
  useEffect(() => {
    setLogsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'user_logs'),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as UserActivityLog[];
        list.sort((a, b) => b.id.localeCompare(a.id));
        setActivityLogs(list);
        setLogsLoading(false);
      },
      (error) => {
        console.error('Error fetching user_logs collection:', error);
        showToast('Failed to sync activity logs', 'error');
        setLogsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 1c. Subscribe to audit logs from Firestore
  useEffect(() => {
    setAuditLogsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'audit_logs'),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as AuditLog[];
        list.sort((a, b) => b.id.localeCompare(a.id));
        setAuditLogs(list);
        setAuditLogsLoading(false);
      },
      (error) => {
        console.error('Error fetching audit_logs collection:', error);
        setAuditLogsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Toggle password visibility
  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // 2. Add User / Supervisor Flow
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addUsername || !addEmail || !addPassword) {
      showToast('All user registration fields are required', 'error');
      return;
    }

    if (addPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    // Check if user email already exists locally
    const emailExists = users.some((u) => u.email.toLowerCase() === addEmail.toLowerCase());
    if (emailExists) {
      showToast('Email is already registered in the system', 'error');
      return;
    }

    setIsAdding(true);
    try {
      // Create user credential on secondary AdminApp background Auth
      const userCredential = await createUserWithEmailAndPassword(adminAuth, addEmail, addPassword);
      const uid = userCredential.user.uid;

      // Save user profile metadata + password in Firestore for prefilling
      const userProfile = {
        uid,
        username: addUsername,
        email: addEmail.toLowerCase(),
        role: addRole,
        password: addPassword
      };

      await setDoc(doc(db, 'users', uid), userProfile);

      // Sign out background AdminApp so it doesn't linger
      await signOut(adminAuth);

      // Write Audit Log
      await onWriteAuditLog('CREATE', 'User', `Registered new Supervisor: ${addUsername} (${addEmail.toLowerCase()}) with role: ${addRole}`);

      showToast(`Supervisor profile successfully registered for ${addUsername}!`, 'success');

      // Clear fields
      setAddUsername('');
      setAddEmail('');
      setAddPassword('');
      setAddRole('Standard');
    } catch (err: any) {
      console.error('Add user error:', err);
      showToast(err.message || 'Failed to register supervisor account', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Open Edit user
  const startEditUser = (user: Supervisor) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditPassword(user.password || '');
  };

  // 4. Update User / Supervisor Details (and programmatically updated Password!)
  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editUsername) {
      showToast('Username cannot be empty', 'error');
      return;
    }

    setIsEditing(true);
    try {
      const email = editingUser.email.toLowerCase();
      const currentSavedPassword = editingUser.password || '';

      // Check if password has been changed
      if (editPassword && editPassword !== currentSavedPassword) {
        if (editPassword.length < 6) {
          showToast('New password must be at least 6 characters', 'error');
          setIsEditing(false);
          return;
        }

        // Programmatic Auth Password update:
        // Login to secondary AdminApp background Auth using User A's current credentials
        try {
          const cred = await signInWithEmailAndPassword(adminAuth, email, currentSavedPassword);
          await updatePassword(cred.user, editPassword);
          await signOut(adminAuth);
        } catch (authErr: any) {
          console.error('Background Auth password sync failed. Proceeding with database force reset anyway.', authErr);
          // If we can't login (e.g. they registered without password field in Firestore),
          // we can guide the admin, or let them recreate the account.
        }
      }

      // Update Firestore user document
      const userDocRef = doc(db, 'users', editingUser.id);
      await setDoc(
        userDocRef,
        {
          username: editUsername,
          role: editRole,
          password: editPassword
        },
        { merge: true }
      );

      // Write Audit Log
      await onWriteAuditLog('UPDATE', 'User', `Updated Supervisor profile details for: ${editUsername} (${editingUser.email})`);

      showToast(`Supervisor credentials for ${editUsername} successfully updated!`, 'success');
      setEditingUser(null);
    } catch (err: any) {
      console.error('Edit user profile error:', err);
      showToast(err.message || 'Failed to update user credentials', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  // 5. Delete User / Supervisor Profile (from both Firebase Auth and Firestore!)
  const handleDeleteUser = async (user: Supervisor) => {
    // 1. Check if trying to delete self
    if (user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      showToast('You cannot delete your own account!', 'error');
      return;
    }

    // 2. Check if trying to delete the last admin
    const adminsCount = users.filter((u) => u.role === 'Admin').length;
    if (user.role === 'Admin' && adminsCount <= 1) {
      showToast('You cannot delete the last remaining Admin in the system!', 'error');
      return;
    }

    try {
      // First, attempt to delete from background Auth by logging in
      const savedPassword = user.password || '';
      if (savedPassword) {
        try {
          const cred = await signInWithEmailAndPassword(adminAuth, user.email, savedPassword);
          await deleteUser(cred.user);
        } catch (authDelErr) {
          console.warn('Could not delete user from Firebase Auth, they might already be removed. Proceeding to delete Firestore doc.', authDelErr);
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.id));

      // Write Audit Log
      await onWriteAuditLog('DELETE', 'User', `Deleted Supervisor account: ${user.username} (${user.email})`);

      showToast(`Supervisor profile for ${user.username} deleted permanently!`, 'success');
    } catch (err: any) {
      console.error('Delete user error:', err);
      showToast(err.message || 'Failed to delete user profile', 'error');
    }
  };

  // Export Audit Logs to CSV (fetch from Google Sheets if linked, otherwise local Firestore fallback)
  const handleExportAuditLogs = async () => {
    setExportingLogs(true);
    showToast('Initiating audit log export...', 'info');

    try {
      let dataToExport: UserActivityLog[] = [];
      let sourceName = 'Firestore (Local Backup)';

      if (googleToken && syncSpreadsheetId) {
        try {
          showToast('Fetching latest logs from Google Sheets...', 'info');
          const sheetsData = await fetchSheetData<UserActivityLog>(syncSpreadsheetId, 'UserLogs', googleToken);
          if (sheetsData && sheetsData.length > 0) {
            dataToExport = sheetsData;
            sourceName = 'Google Sheets';
          } else {
            console.warn('Google Sheets UserLogs returned empty. Falling back to local logs.');
            dataToExport = activityLogs;
          }
        } catch (sheetsErr) {
          console.error('Failed to fetch UserLogs from Google Sheets:', sheetsErr);
          showToast('Failed to pull from Google Sheets. Using Firestore database logs.', 'info');
          dataToExport = activityLogs;
        }
      } else {
        showToast('Google Sheets not linked. Exporting Firestore database logs.', 'info');
        dataToExport = activityLogs;
      }

      if (dataToExport.length === 0) {
        showToast('No user login/logout logs found to export.', 'error');
        setExportingLogs(false);
        return;
      }

      // Convert to CSV with standard safe escaping
      const headers = ['id', 'email', 'username', 'date', 'firstLogin', 'lastLogout'];
      const headerLabels = ['Log ID', 'Email', 'Supervisor Name', 'Log Date', 'First Log In', 'Last Log Out'];
      
      const csvRows = [headerLabels.join(',')];
      
      for (const item of dataToExport) {
        const rowValues = headers.map(header => {
          const val = (item as any)[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(rowValues.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayStr = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `user_audit_logs_${todayStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Audit logs successfully exported from ${sourceName}!`, 'success');
    } catch (err: any) {
      console.error('Error exporting audit logs:', err);
      showToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setExportingLogs(false);
    }
  };

  // Export system-wide administrative audit logs to CSV
  const handleExportSystemAuditLogs = () => {
    try {
      if (auditLogs.length === 0) {
        showToast('No administrative audit logs found to export.', 'error');
        return;
      }
      const headers = ['id', 'timestamp', 'username', 'userEmail', 'action', 'category', 'details'];
      const headerLabels = ['Log ID', 'Timestamp', 'Supervisor Name', 'Email', 'Action', 'Category', 'Details'];
      
      const csvRows = [headerLabels.join(',')];
      
      for (const log of auditLogs) {
        const rowValues = headers.map(header => {
          const val = (log as any)[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(rowValues.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayStr = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_system_audit_logs_${todayStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Administrative audit logs successfully exported!', 'success');
    } catch (err: any) {
      console.error('Error exporting system audit logs:', err);
      showToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  // Export All Pages/Tabs Data into a single Excel Workbook with different Sheets
  const handleExportAllData = async () => {
    setExportingAllData(true);
    showToast('Preparing system-wide data export...', 'info');

    try {
      const sheetsList = [
        { key: 'Incidents', sheetName: 'Network Incidents', localData: incidents, headers: SHEET_HEADERS['Incidents'] },
        { key: 'Dockets', sheetName: 'FE Dockets', localData: dockets, headers: SHEET_HEADERS['Dockets'] },
        { key: 'Feedbacks', sheetName: 'Feedback Calls', localData: feedbacks, headers: SHEET_HEADERS['Feedbacks'] },
        { key: 'Routers', sheetName: 'Router MAC Unlink', localData: routers, headers: SHEET_HEADERS['Routers'] },
        { key: 'Complaints', sheetName: 'Complaint Management', localData: complaints, headers: SHEET_HEADERS['Complaints'] },
        { key: 'WhatsAppReports', sheetName: 'WhatsApp Shift Reports', localData: waReports, headers: SHEET_HEADERS['WhatsAppReports'] },
        { key: 'CyberReports', sheetName: 'Cyber Trace Records', localData: cyberReports, headers: SHEET_HEADERS['CyberReports'] },
        { key: 'MailReports', sheetName: 'Daily Stats Mail', localData: mailReports, headers: SHEET_HEADERS['MailReports'] },
        { key: 'TechUpdates', sheetName: 'Tech Bulletins', localData: techUpdates, headers: SHEET_HEADERS['TechUpdates'] }
      ];

      const wb = XLSX.utils.book_new();
      let sourceName = 'Firestore (Local Backup)';

      let processedSheets: { sheetName: string; headers: string[]; data: any[] }[] = [];

      if (googleToken && syncSpreadsheetId) {
        try {
          showToast('Pulling latest system records from Google Sheets...', 'info');
          
          const sheetsResults = await Promise.all(
            sheetsList.map(async (sheet) => {
              try {
                const fetched = await fetchSheetData<any>(syncSpreadsheetId, sheet.key, googleToken);
                if (fetched && fetched.length > 0) {
                  return { key: sheet.key, data: fetched, success: true };
                }
              } catch (e) {
                console.error(`Failed to fetch ${sheet.key} from Google Sheets:`, e);
              }
              return { key: sheet.key, data: sheet.localData, success: false };
            })
          );

          sourceName = 'Google Sheets (Live)';

          for (const sheet of sheetsList) {
            const res = sheetsResults.find(r => r.key === sheet.key);
            const dataToUse = res?.data || sheet.localData;
            processedSheets.push({ sheetName: sheet.sheetName, headers: sheet.headers, data: dataToUse });
          }
        } catch (sheetsErr) {
          console.error('Parallel sheets pull failed, falling back to local state:', sheetsErr);
          showToast('Sheets live connection failed. Using Firestore database backup.', 'info');
          
          for (const sheet of sheetsList) {
            processedSheets.push({ sheetName: sheet.sheetName, headers: sheet.headers, data: sheet.localData });
          }
        }
      } else {
        // No Google Sheets linked - export Firestore local copy directly
        for (const sheet of sheetsList) {
          processedSheets.push({ sheetName: sheet.sheetName, headers: sheet.headers, data: sheet.localData });
        }
      }

      // Build SheetJS worksheets
      for (const pSheet of processedSheets) {
        const worksheetData = [
          pSheet.headers,
          ...pSheet.data.map(item => pSheet.headers.map(header => {
            const val = (item as any)[header];
            return val !== undefined && val !== null ? val : '';
          }))
        ];

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Auto-fit column widths nicely
        const max_widths = pSheet.headers.map(h => h.length);
        worksheetData.forEach(row => {
          row.forEach((cell, colIdx) => {
            const len = String(cell ?? '').length;
            if (len > max_widths[colIdx]) {
              max_widths[colIdx] = len;
            }
          });
        });
        ws['!cols'] = max_widths.map(w => ({ wch: Math.min(Math.max(w + 3, 10), 50) }));

        XLSX.utils.book_append_sheet(wb, ws, pSheet.sheetName);
      }

      // Download the Excel workbook
      XLSX.writeFile(wb, 'Network Control Center Dashboard Data.xlsx');

      showToast(`All pages data exported successfully from ${sourceName}!`, 'success');
    } catch (err: any) {
      console.error('Error exporting all pages data:', err);
      showToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setExportingAllData(false);
    }
  };

  return (
    <div className="space-y-6 font-sans" id="admin-portal-root">
      {/* 1. TOP HEADER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 md:p-8 shadow-xl" id="admin-hero">
        <div className="absolute inset-0 bg-radial-at-t from-slate-800 via-slate-900 to-slate-950 opacity-90 z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600/10 p-3.5 rounded-2xl border border-emerald-500/20 shadow-inner">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block mb-1">
                Security & Directory Administration
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                Tech Support Admin Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Add, manage, audit, and remove system supervisor accounts. Configure supervisor access privileges, reset passwords, and audit login credentials in real-time.
              </p>
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-right shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Logged in as Admin</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{currentUser.email}</span>
            <div className="mt-2.5">
              <button
                onClick={onTriggerMyPasswordChange}
                className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 active:scale-95 text-white px-3 py-1.5 rounded-lg border border-slate-600/30 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <LockKeyhole className="w-3.5 h-3.5 text-amber-400" />
                Change My Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ADD ACCOUNT FORM */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Register Supervisor</h3>
                <p className="text-[10px] text-slate-400">Create a secure system login</p>
              </div>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col">
                <label className="text-slate-500 mb-1.5">Official Username <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 mb-1.5">Official E-mail Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. supervisor@company.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:border-indigo-500 focus:outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 mb-1.5">Assign Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="At least 6 characters"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:border-indigo-500 focus:outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 mb-1.5">Access Role Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRole('Standard')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                      addRole === 'Standard'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddRole('Admin')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                      addRole === 'Admin'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-2 cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Register New Supervisor</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTERED USER DIRECTORY LOG */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  {activeTab === 'analytics' ? (
                    <Activity className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {activeTab === 'directory' 
                      ? 'Supervisors Directory' 
                      : activeTab === 'logs' 
                      ? 'Daily User Activity Logs' 
                      : 'Visual Analytics & Performance Dashboard'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {activeTab === 'directory' 
                      ? `Total active users in database: ${users.length}`
                      : activeTab === 'logs'
                      ? `Total recorded sessions: ${activityLogs.length}`
                      : 'Real-time performance indicators & trends'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={handleExportAllData}
                  disabled={exportingAllData}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  id="export-all-data-btn"
                  title="Export live system data from all pages/tabs to a single CSV file"
                >
                  {exportingAllData ? (
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{exportingAllData ? 'Exporting All...' : 'Export Data'}</span>
                </button>

                {activeTab === 'logs' && (
                  <button
                    onClick={handleExportAuditLogs}
                    disabled={exportingLogs}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    id="export-audit-logs-btn"
                    title="Export Audit Logs from Google Sheets/Firestore to CSV"
                  >
                    {exportingLogs ? (
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{exportingLogs ? 'Exporting...' : 'Export Session Logs'}</span>
                  </button>
                )}

                {activeTab === 'audit' && (
                  <button
                    onClick={handleExportSystemAuditLogs}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    id="export-system-audit-logs-btn"
                    title="Export system audit logs to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Audit Logs</span>
                  </button>
                )}
                <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'analytics'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'directory'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Supervisors
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'logs'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Sessions
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'audit'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Audit Log
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'analytics' ? (
              <AdminAnalyticsPanel
                incidents={incidents}
                complaints={complaints}
                dockets={dockets}
              />
            ) : activeTab === 'directory' ? (
              loading ? (
                <div className="p-12 text-center text-xs text-slate-400 font-bold flex flex-col items-center gap-2">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                  <span>Loading active directory...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No supervisors found in directory</p>
                  <p className="text-[10px] text-slate-400 mt-1">Register accounts using the form on the left</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="user-directory-table">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                        <th className="py-3 px-4">Supervisor User</th>
                        <th className="py-3 px-4">Privilege Role</th>
                        <th className="py-3 px-4">Auto-Prefilled Password</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100/60 font-semibold text-slate-700">
                      {users.map((user) => {
                        const isRevealed = !!revealedPasswords[user.id];
                        return (
                          <tr key={user.id} className="hover:bg-slate-50/35 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                                  alt={user.username}
                                  className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50"
                                />
                                <div>
                                  <div className="font-extrabold text-slate-800">{user.username}</div>
                                  <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {user.role === 'Admin' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <Shield className="w-3 h-3 text-emerald-500" />
                                  Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  <User className="w-3 h-3 text-indigo-500" />
                                  Standard
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-md max-w-[120px] truncate text-slate-600">
                                  {isRevealed ? user.password || 'Not Set' : '••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordReveal(user.id)}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                  title={isRevealed ? 'Hide Password' : 'Show Password'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => startEditUser(user)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Supervisor / Reset Password"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {deletingUserId === user.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-md p-1 animate-fade-in" id={`delete-user-confirm-box-${user.id}`}>
                                    <span className="text-xs text-rose-700 font-semibold px-1" id={`delete-user-lbl-${user.id}`}>Sure?</span>
                                    <button
                                      onClick={() => {
                                        handleDeleteUser(user);
                                        setDeletingUserId(null);
                                      }}
                                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                      id={`btn-confirm-delete-user-${user.id}`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeletingUserId(null)}
                                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                      id={`btn-cancel-delete-user-${user.id}`}
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingUserId(user.id)}
                                    disabled={user.email.toLowerCase() === 'banibratamajumder18@gmail.com' || user.email.toLowerCase() === currentUser.email.toLowerCase()}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                    title="Delete Supervisor"
                                    id={`btn-delete-user-${user.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === 'logs' ? (
              logsLoading ? (
                <div className="p-12 text-center text-xs text-slate-400 font-bold flex flex-col items-center gap-2">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                  <span>Loading activity logs...</span>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No session history found</p>
                  <p className="text-[10px] text-slate-400 mt-1">Logs will be automatically recorded when supervisors log in/out</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="user-logs-table">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Supervisor User</th>
                        <th className="py-3 px-4">First Log In</th>
                        <th className="py-3 px-4">Last Log Out</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100/60 font-semibold text-slate-700">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/35 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs font-extrabold text-slate-600">
                              {log.date}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${log.username}`}
                                alt={log.username}
                                className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50"
                              />
                              <div>
                                <div className="font-extrabold text-slate-800">{log.username}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{log.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {log.firstLogin}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {log.lastLogout === 'Active / Not Logged Out' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                Active Now
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {log.lastLogout}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Active Tab === 'audit'
              auditLogsLoading ? (
                <div className="p-12 text-center text-xs text-slate-400 font-bold flex flex-col items-center gap-2">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                  <span>Loading system audit logs...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Audit Logs Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      {/* Search */}
                      <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search action details or supervisor..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Action Filter */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Action:</span>
                        <select
                          value={auditActionFilter}
                          onChange={(e) => setAuditActionFilter(e.target.value as any)}
                          className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-slate-800"
                        >
                          <option value="All">All Actions</option>
                          <option value="CREATE">CREATE</option>
                          <option value="UPDATE">UPDATE</option>
                          <option value="DELETE">DELETE</option>
                          <option value="LINK">LINK</option>
                          <option value="UNLINK">UNLINK</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Category:</span>
                        <select
                          value={auditCategoryFilter}
                          onChange={(e) => setAuditCategoryFilter(e.target.value)}
                          className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-slate-800"
                        >
                          <option value="All">All Categories</option>
                          <option value="Incident">Incident</option>
                          <option value="User">User / Supervisor</option>
                          <option value="Docket">FE Docket</option>
                          <option value="Feedback">Feedback Call</option>
                          <option value="Router">MAC Unlink</option>
                          <option value="Complaint">Complaint</option>
                          <option value="WhatsAppReport">WhatsApp Shift</option>
                          <option value="CyberCrimeReport">Cyber Trace</option>
                          <option value="MailWhatsAppCountReport">Stats Mail</option>
                          <option value="TechInformationUpdate">Tech Bulletin</option>
                          <option value="GoogleSheets">Google Sheets Sync</option>
                        </select>
                      </div>

                      {/* Email Filter */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600" id="filter-audit-email">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Supervisor:</span>
                        <select
                          value={auditEmailFilter}
                          onChange={(e) => setAuditEmailFilter(e.target.value)}
                          className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-slate-800 max-w-[200px]"
                        >
                          <option value="All">All Emails</option>
                          {uniqueEmails.map((email) => (
                            <option key={email} value={email}>
                              {email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Matches: <span className="text-slate-800 font-extrabold">{filteredAuditLogs.length}</span>
                      </div>

                      {currentUser.role === 'Admin' && (
                        <button
                          onClick={() => setIsConfirmClearOpen(true)}
                          disabled={isClearingLogs}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                          id="clear-old-logs-btn"
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{isClearingLogs ? 'Clearing...' : 'Clear Logs > 60 Days'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audit Logs List */}
                  {filteredAuditLogs.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                      <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">No matching audit logs found</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try adjusting your search criteria or filter selectors</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse" id="audit-logs-table">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">Action</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Supervisor</th>
                            <th className="py-3 px-4">Action Details</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100/60 font-semibold text-slate-700">
                          {filteredAuditLogs
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/35 transition-colors">
                                <td className="py-3.5 px-4">
                                  <span className="font-mono text-[11px] font-bold text-slate-500 block">
                                    {log.timestamp}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                    log.action === 'CREATE'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : log.action === 'UPDATE'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : log.action === 'DELETE'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-600 uppercase font-extrabold tracking-wide">
                                    {log.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${log.username}`}
                                      alt={log.username}
                                      className="w-6 h-6 rounded-full border border-slate-100 bg-slate-50"
                                    />
                                    <div>
                                      <div className="font-extrabold text-slate-800">{log.username}</div>
                                      <div className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">{log.userEmail}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 max-w-sm">
                                  <p className="text-slate-600 font-medium text-[11px] leading-relaxed break-words">{log.details}</p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 3. EDIT SUPERVISOR BACKDROP/MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 p-1.5 rounded-lg">
                  <Edit3 className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Modify supervisor details</h4>
                  <p className="text-[9px] text-slate-400">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer hover:bg-slate-100 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col">
                <label className="text-slate-500 mb-1.5">Official Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 mb-1.5">Role Authorization</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('Standard')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                      editRole === 'Standard'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('Admin')}
                    disabled={editingUser.email.toLowerCase() === 'banibratamajumder18@gmail.com'}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-bold disabled:opacity-40 ${
                      editRole === 'Admin'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-500">Edit / Reset Password</label>
                  <span className="text-[9px] text-slate-400 italic">Pre-populated with old password</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="At least 6 characters"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  {isEditing ? 'Updating Credentials...' : 'Save Updated details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Old Logs */}
      <ConfirmationModal
        isOpen={isConfirmClearOpen}
        title="Clear Old Audit Logs?"
        message="Are you sure you want to delete all audit logs older than 60 days? This will permanently remove these records from the database and cannot be undone."
        confirmText="Yes, Clear Old Logs"
        cancelText="Cancel"
        onConfirm={handleClearOldLogs}
        onClose={() => setIsConfirmClearOpen(false)}
        isDestructive={true}
      />
    </div>
  );
}
