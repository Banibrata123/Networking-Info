/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  DashboardView,
  StatusHistoryEntry
} from './types';
import { loadState, saveState, formatDateTime, getLocalDateTimeString } from './utils';
import {
  googleSignIn,
  logout as sheetsLogout,
  initAuth,
  findOrCreateSpreadsheet,
  fetchSheetData,
  appendRowToSheet,
  updateRowInSheet,
  deleteRowFromSheet
} from './lib/sheetsService';
import {
  INITIAL_NETWORK_INCIDENTS,
  INITIAL_FE_DOCKETS,
  INITIAL_FEEDBACK_CALLS,
  INITIAL_UNLINK_ROUTERS,
  INITIAL_COMPLAINT_MANAGEMENT,
  INITIAL_WHATSAPP_REPORTS,
  INITIAL_CYBER_CRIME_REPORTS,
  INITIAL_MAIL_WHATSAPP_COUNT_REPORTS,
  INITIAL_TECH_UPDATES
} from './mockData';

// Firebase Imports
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  collection, 
  onSnapshot,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';

// Component Imports
import NetworkCanvas from './components/NetworkCanvas';
import DashboardCharts from './components/DashboardCharts';
import NetworkIncidentView from './components/NetworkIncidentView';
import FEDocketView from './components/FEDocketView';
import FeedbackCallView from './components/FeedbackCallView';
import UnlinkRouterView from './components/UnlinkRouterView';
import ComplaintManagementView from './components/ComplaintManagementView';
import MultipleReportView from './components/MultipleReportView';
import TechInformationUpdateView from './components/TechInformationUpdateView';
import PremiumHeroBanner from './components/PremiumHeroBanner';
import AdminPortalView from './components/AdminPortalView';
import ConfirmationModal from './components/ConfirmationModal';

// Icons
import {
  Home,
  Activity,
  User,
  LogOut,
  Key,
  ChevronRight,
  ChevronDown,
  Shield,
  MessageSquare,
  Wrench,
  PhoneCall,
  Unlink,
  FileText,
  Radio,
  FileSpreadsheet,
  X,
  Lock,
  Mail,
  UserCheck,
  Menu,
  Search,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // --- 1. USER SESSION STATE ---
  const [session, setSession] = useState<UserSession | null>(() => loadState<UserSession | null>('active_session', null));
  const [authLoaded, setAuthLoaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadState<'light' | 'dark'>('app_theme', 'light'));
  const [loginEmail, setLoginEmail] = useState('banibratamajumder18@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginError, setLoginError] = useState('');

  // Firebase Sign Up state variables
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Dropdown & User Info modal states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);

  // Viewed states for real-time notification badges
  const [viewedIncidentIds, setViewedIncidentIds] = useState<string[]>(() =>
    loadState<string[]>('viewed_incident_ids', [])
  );
  const [viewedComplaintIds, setViewedComplaintIds] = useState<string[]>(() =>
    loadState<string[]>('viewed_complaint_ids', [])
  );

  // Search system state variables
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-sync state variables
  const [syncCountdown, setSyncCountdown] = useState(240);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // --- 2. DATASETS STATE ---
  const [incidents, setIncidents] = useState<NetworkIncident[]>(() =>
    loadState<NetworkIncident[]>('networking_incidents', INITIAL_NETWORK_INCIDENTS)
  );
  const [dockets, setDockets] = useState<FEDocket[]>(() =>
    loadState<FEDocket[]>('networking_dockets', INITIAL_FE_DOCKETS)
  );
  const [feedbacks, setFeedbacks] = useState<FeedbackCall[]>(() =>
    loadState<FeedbackCall[]>('networking_feedbacks', INITIAL_FEEDBACK_CALLS)
  );
  const [routers, setRouters] = useState<UnlinkRouter[]>(() =>
    loadState<UnlinkRouter[]>('networking_routers', INITIAL_UNLINK_ROUTERS)
  );
  const [complaints, setComplaints] = useState<ComplaintManagement[]>(() =>
    loadState<ComplaintManagement[]>('networking_complaints', INITIAL_COMPLAINT_MANAGEMENT)
  );
  const [waReports, setWaReports] = useState<WhatsAppReport[]>(() =>
    loadState<WhatsAppReport[]>('networking_waReports', INITIAL_WHATSAPP_REPORTS)
  );
  const [cyberReports, setCyberReports] = useState<CyberCrimeReport[]>(() =>
    loadState<CyberCrimeReport[]>('networking_cyberReports', INITIAL_CYBER_CRIME_REPORTS)
  );
  const [mailReports, setMailReports] = useState<MailWhatsAppCountReport[]>(() =>
    loadState<MailWhatsAppCountReport[]>('networking_mailReports', INITIAL_MAIL_WHATSAPP_COUNT_REPORTS)
  );
  const [techUpdates, setTechUpdates] = useState<TechInformationUpdate[]>(() =>
    loadState<TechInformationUpdate[]>('networking_techUpdates', INITIAL_TECH_UPDATES)
  );

  // --- 3. TOAST SYSTEM STATE ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // --- 3.1 REUSABLE CONFIRMATION MODAL STATE ---
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const requestDeleteConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setDeleteConfirmState({
      isOpen: true,
      title,
      message,
      confirmText: 'Permanently Delete',
      onConfirm
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getApiEnablementUrls = (errorStr: string) => {
    const sheetsMatch = errorStr.match(/(https:\/\/console\.[^\s"']+sheets\.googleapis\.com[^\s"']+)/i);
    let sheetsUrl = sheetsMatch ? sheetsMatch[0] : null;
    if (sheetsUrl) {
      sheetsUrl = sheetsUrl.replace(/[.,;)]+$/, '');
    }
    const projectMatch = errorStr.match(/project=(\d+)/i) || errorStr.match(/projects?\/(\d+)/i);
    const projectNumber = projectMatch ? projectMatch[1] : '430062571857';
    if (!sheetsUrl) {
      sheetsUrl = `https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=${projectNumber}`;
    }
    const driveUrl = `https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=${projectNumber}`;
    return { sheetsUrl, driveUrl, projectNumber };
  };

  // --- 3.5 GOOGLE SHEETS SYNC SYSTEM ---
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [syncSpreadsheetId, setSyncSpreadsheetId] = useState<string | null>(() => loadState<string | null>('sheets_spreadsheet_id', null));
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error'>('disconnected');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Subscribe to persistent sheets config in Firestore
  useEffect(() => {
    if (!session) {
      // Clear local states when logged out
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncSpreadsheetId(null);
      setSheetsSyncStatus('disconnected');
      return;
    }

    const unsub = onSnapshot(doc(db, 'global_settings', 'sheets_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.linked) {
          setSyncSpreadsheetId(data.spreadsheetId || null);
          setGoogleToken(data.googleToken || null);
          if (data.googleToken) {
            setSheetsSyncStatus('connected');
          } else {
            setSheetsSyncStatus('disconnected');
          }
        } else {
          setSyncSpreadsheetId(null);
          setGoogleToken(null);
          setSheetsSyncStatus('disconnected');
        }
      } else {
        setSyncSpreadsheetId(null);
        setGoogleToken(null);
        setSheetsSyncStatus('disconnected');
      }
    }, (error) => {
      console.warn('Error reading sheets config from Firestore:', error);
    });

    return () => unsub();
  }, [session]);

  // Trigger Google Sign-In and fetch/save data
  const handleGoogleSheetsLink = async () => {
    try {
      setSyncError(null);
      setSheetsSyncStatus('connecting');
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        showToast('Successfully signed in with Google. Establishing sync...', 'info');
        // Use the existing spreadsheet ID if we already have one from Firestore
        await syncWithGoogleSheets(result.accessToken, syncSpreadsheetId || undefined);
      }
    } catch (err: any) {
      console.error('Google link error details:', err);
      setSheetsSyncStatus('error');
      const errStr = String(err);
      const isAuthDomainError = errStr.includes('auth/unauthorized-domain') || err?.message?.includes('auth/unauthorized-domain') || err?.code?.includes('auth/unauthorized-domain');
      const isOpNotAllowedError = errStr.includes('auth/operation-not-allowed') || err?.message?.includes('auth/operation-not-allowed') || err?.code?.includes('auth/operation-not-allowed');
      if (isAuthDomainError) {
        setSyncError('unauthorized-domain');
      } else if (isOpNotAllowedError) {
        setSyncError('operation-not-allowed');
      } else {
        setSyncError(err?.message || errStr);
      }
      showToast('Google authentication failed.', 'error');
    }
  };

  const handleGoogleSheetsDisconnect = async () => {
    try {
      await sheetsLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncSpreadsheetId(null);
      setSyncError(null);
      setSheetsSyncStatus('disconnected');

      // Update Firestore configuration setting linked to false
      try {
        await setDoc(doc(db, 'global_settings', 'sheets_config'), {
          spreadsheetId: null,
          linked: false,
          googleToken: null,
          googleUserEmail: null,
          linkedBy: null,
          linkedAt: null
        }, { merge: true });
      } catch (fsErr) {
        console.error('Failed to clear sheets config in Firestore:', fsErr);
      }

      showToast('Google Sheets disconnected.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Google Sheets Two-Way Synchronization
  const syncWithGoogleSheets = async (token: string, spreadsheetIdToUse?: string) => {
    setSheetsSyncStatus('syncing');
    try {
      const activeSpreadsheetId = spreadsheetIdToUse || syncSpreadsheetId || await findOrCreateSpreadsheet(token);
      if (!syncSpreadsheetId || syncSpreadsheetId !== activeSpreadsheetId) {
        setSyncSpreadsheetId(activeSpreadsheetId);
        saveState('sheets_spreadsheet_id', activeSpreadsheetId);
      }

      // Save sync settings and credentials securely to Firestore global_settings
      try {
        await setDoc(doc(db, 'global_settings', 'sheets_config'), {
          spreadsheetId: activeSpreadsheetId,
          linked: true,
          googleToken: token,
          googleUserEmail: auth.currentUser?.email || '',
          linkedBy: session?.email || auth.currentUser?.email || 'Admin',
          linkedAt: new Date().toISOString()
        });
      } catch (fsErr) {
        console.error('Failed to save sheets config to Firestore:', fsErr);
      }

      // Fetch all user logs from Firestore
      let firestoreLogs: any[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'user_logs'));
        firestoreLogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.error('Error fetching user logs from Firestore:', err);
      }

      // Fetch all sheet datasets from Google Sheets
      const [
        sheetsIncidents,
        sheetsDockets,
        sheetsFeedbacks,
        sheetsRouters,
        sheetsComplaints,
        sheetsWaReports,
        sheetsCyberReports,
        sheetsMailReports,
        sheetsTechUpdates,
        sheetsUserLogs
      ] = await Promise.all([
        fetchSheetData<NetworkIncident>(activeSpreadsheetId, 'Incidents', token),
        fetchSheetData<FEDocket>(activeSpreadsheetId, 'Dockets', token),
        fetchSheetData<FeedbackCall>(activeSpreadsheetId, 'Feedbacks', token),
        fetchSheetData<UnlinkRouter>(activeSpreadsheetId, 'Routers', token),
        fetchSheetData<ComplaintManagement>(activeSpreadsheetId, 'Complaints', token),
        fetchSheetData<WhatsAppReport>(activeSpreadsheetId, 'WhatsAppReports', token),
        fetchSheetData<CyberCrimeReport>(activeSpreadsheetId, 'CyberReports', token),
        fetchSheetData<MailWhatsAppCountReport>(activeSpreadsheetId, 'MailReports', token),
        fetchSheetData<TechInformationUpdate>(activeSpreadsheetId, 'TechUpdates', token),
        fetchSheetData<any>(activeSpreadsheetId, 'UserLogs', token)
      ]);

      // Merge: unique by ID, union of both local and sheets to ensure nothing is lost!
      const mergeData = <T extends { id: string }>(local: T[], remote: T[]): T[] => {
        const remoteIds = new Set(remote.map(item => item.id));
        const merged = [...remote];
        local.forEach(item => {
          if (!remoteIds.has(item.id)) {
            merged.push(item);
          }
        });
        return merged;
      };

      const mergedIncidents = mergeData(incidents, sheetsIncidents);
      const mergedDockets = mergeData(dockets, sheetsDockets);
      const mergedFeedbacks = mergeData(feedbacks, sheetsFeedbacks);
      const mergedRouters = mergeData(routers, sheetsRouters);
      const mergedComplaints = mergeData(complaints, sheetsComplaints);
      const mergedWaReports = mergeData(waReports, sheetsWaReports);
      const mergedCyberReports = mergeData(cyberReports, sheetsCyberReports);
      const mergedMailReports = mergeData(mailReports, sheetsMailReports);
      const mergedTechUpdates = mergeData(techUpdates, sheetsTechUpdates);

      // Identify and upload any new local rows that don't exist in Google Sheets
      const uploadNewItems = async <T extends { id: string }>(
        localList: T[],
        remoteList: T[],
        sheetName: string
      ) => {
        const remoteIds = new Set(remoteList.map(item => item.id));
        const newLocal = localList.filter(item => !remoteIds.has(item.id));
        for (const item of newLocal) {
          await appendRowToSheet(activeSpreadsheetId, sheetName, item, token);
        }
      };

      // Upload new UserLogs and update existing ones with modified lastLogout time
      const syncUserLogs = async () => {
        const remoteLogMap = new Map((sheetsUserLogs || []).map((log: any) => [log.id, log]));
        for (const log of firestoreLogs) {
          if (!remoteLogMap.has(log.id)) {
            await appendRowToSheet(activeSpreadsheetId, 'UserLogs', log, token);
          } else {
            const remoteLog = remoteLogMap.get(log.id);
            if (remoteLog && remoteLog.lastLogout !== log.lastLogout) {
              await updateRowInSheet(activeSpreadsheetId, 'UserLogs', log.id, { lastLogout: log.lastLogout }, token);
            }
          }
        }
      };

      await Promise.all([
        uploadNewItems(incidents, sheetsIncidents, 'Incidents'),
        uploadNewItems(dockets, sheetsDockets, 'Dockets'),
        uploadNewItems(feedbacks, sheetsFeedbacks, 'Feedbacks'),
        uploadNewItems(routers, sheetsRouters, 'Routers'),
        uploadNewItems(complaints, sheetsComplaints, 'Complaints'),
        uploadNewItems(waReports, sheetsWaReports, 'WhatsAppReports'),
        uploadNewItems(cyberReports, sheetsCyberReports, 'CyberReports'),
        uploadNewItems(mailReports, sheetsMailReports, 'MailReports'),
        uploadNewItems(techUpdates, sheetsTechUpdates, 'TechUpdates'),
        syncUserLogs()
      ]);

      // Write any remote-only incidents back to Firestore so they are persisted and shown
      const remoteIncidentIds = new Set(incidents.map(inc => inc.id));
      const newRemoteIncidents = sheetsIncidents.filter(inc => !remoteIncidentIds.has(inc.id));
      for (const inc of newRemoteIncidents) {
        try {
          await setDoc(doc(db, 'networking_incidents', inc.id), inc);
        } catch (dbErr) {
          console.error(`Error saving fetched remote incident ${inc.id} to Firestore:`, dbErr);
        }
      }

      // Set states
      setIncidents(mergedIncidents);
      setDockets(mergedDockets);
      setFeedbacks(mergedFeedbacks);
      setRouters(mergedRouters);
      setComplaints(mergedComplaints);
      setWaReports(mergedWaReports);
      setCyberReports(mergedCyberReports);
      setMailReports(mergedMailReports);
      setTechUpdates(mergedTechUpdates);

      setSheetsSyncStatus('connected');
      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showToast('All dashboard data synchronized with Google Sheets!', 'success');
    } catch (error: any) {
      console.error('Google Sheets Sync failed:', error);
      setSheetsSyncStatus('error');
      const errStr = String(error);
      setSyncError(error?.message || errStr);
      showToast('Sync with Google Sheets failed.', 'error');
    }
  };

  // On-the-fly append helper for newly added local records
  const syncNewRecordToSheets = async (sheetName: string, item: any) => {
    if (googleToken && syncSpreadsheetId) {
      try {
        await appendRowToSheet(syncSpreadsheetId, sheetName, item, googleToken);
      } catch (err: any) {
        console.error(`On-the-fly append to Google Sheets failed for ${sheetName}:`, err);
        const errStr = String(err);
        if (errStr.includes('401') || errStr.includes('unauthorized') || errStr.includes('Expired') || errStr.includes('expired')) {
          setSheetsSyncStatus('disconnected');
          showToast('Google Sheets authorization expired. Please re-authorize.', 'error');
        }
      }
    }
  };

  // On-the-fly update helper for modified local records
  const syncUpdatedRecordToSheets = async (sheetName: string, itemId: string, updatedFields: any) => {
    if (googleToken && syncSpreadsheetId) {
      try {
        await updateRowInSheet(syncSpreadsheetId, sheetName, itemId, updatedFields, googleToken);
      } catch (err: any) {
        console.error(`On-the-fly update to Google Sheets failed for ${sheetName}:`, err);
        const errStr = String(err);
        if (errStr.includes('401') || errStr.includes('unauthorized') || errStr.includes('Expired') || errStr.includes('expired')) {
          setSheetsSyncStatus('disconnected');
          showToast('Google Sheets authorization expired. Please re-authorize.', 'error');
        }
      }
    }
  };

  // On-the-fly delete helper for deleted local records
  const syncDeletedRecordToSheets = async (sheetName: string, itemId: string) => {
    if (googleToken && syncSpreadsheetId) {
      try {
        await deleteRowFromSheet(syncSpreadsheetId, sheetName, itemId, googleToken);
      } catch (err: any) {
        console.error(`On-the-fly delete from Google Sheets failed for ${sheetName}:`, err);
        const errStr = String(err);
        if (errStr.includes('401') || errStr.includes('unauthorized') || errStr.includes('Expired') || errStr.includes('expired')) {
          setSheetsSyncStatus('disconnected');
          showToast('Google Sheets authorization expired. Please re-authorize.', 'error');
        }
      }
    }
  };

  const recordDailyLogin = async (email: string, username: string) => {
    if (!email) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const cleanedEmail = email.toLowerCase().replace(/[@.]/g, '_');
      const docId = `${cleanedEmail}_${todayStr}`;
      const logDocRef = doc(db, 'user_logs', docId);
      
      const logSnap = await getDoc(logDocRef);
      const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      if (!logSnap.exists()) {
        const newLog = {
          id: docId,
          email: email.toLowerCase(),
          username: username,
          date: todayStr,
          firstLogin: nowTimeStr,
          lastLogout: 'Active / Not Logged Out'
        };
        await setDoc(logDocRef, newLog);
        console.log(`Recorded first login for ${email} today: ${nowTimeStr}`);
        await syncNewRecordToSheets('UserLogs', newLog);
      } else {
        const logData = logSnap.data();
        if (logData && logData.lastLogout !== 'Active / Not Logged Out') {
          await setDoc(logDocRef, {
            lastLogout: 'Active / Not Logged Out'
          }, { merge: true });
          console.log(`User ${email} logged back in today. Resetting lastLogout to Active.`);
          await syncUpdatedRecordToSheets('UserLogs', docId, { lastLogout: 'Active / Not Logged Out' });
        }
      }
    } catch (err) {
      console.error('Error recording daily login log:', err);
    }
  };

  // --- Firebase Auth & Firestore Observers ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let finalEmail = firebaseUser.email || '';
        let finalUsername = '';
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (getErr) {
            handleFirestoreError(getErr, OperationType.GET, `users/${firebaseUser.uid}`);
          }

          const isEmailAdmin = firebaseUser.email?.toLowerCase() === 'banibratamajumder18@gmail.com';

          if (userDoc && userDoc.exists()) {
            const userData = userDoc.data();
            finalUsername = userData.username || firebaseUser.email?.split('@')[0] || 'User';
            setSession({
              username: finalUsername,
              email: firebaseUser.email || '',
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username || firebaseUser.uid}`,
              role: isEmailAdmin ? 'Admin' : (userData.role || 'Standard'),
              password: userData.password || ''
            });
          } else {
            const email = firebaseUser.email || '';
            finalUsername = firebaseUser.displayName || email.split('@')[0] || 'User';
            const userProfile: { uid: string; username: string; email: string; role: 'Admin' | 'Standard' } = {
              uid: firebaseUser.uid,
              username: finalUsername,
              email: email,
              role: isEmailAdmin ? 'Admin' : 'Standard'
            };
            try {
              await setDoc(userDocRef, userProfile);
            } catch (dbErr) {
              handleFirestoreError(dbErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
            setSession({
              username: userProfile.username,
              email: userProfile.email,
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.username}`,
              role: userProfile.role
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          finalUsername = firebaseUser.email?.split('@')[0] || 'User';
          setSession({
            username: finalUsername,
            email: firebaseUser.email || '',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
            role: (firebaseUser.email?.toLowerCase() === 'banibratamajumder18@gmail.com' ? 'Admin' : 'Standard')
          });
        }
        if (finalEmail) {
          recordDailyLogin(finalEmail, finalUsername);
        }
      } else {
        setSession(null);
      }
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !authLoaded || !auth.currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'networking_incidents'), (snapshot) => {
      const list: NetworkIncident[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as NetworkIncident);
      });
      if (list.length === 0) {
        INITIAL_NETWORK_INCIDENTS.forEach(async (inc) => {
          try {
            await setDoc(doc(db, 'networking_incidents', inc.id), inc);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `networking_incidents/${inc.id}`);
          }
        });
        setIncidents(INITIAL_NETWORK_INCIDENTS);
      } else {
        setIncidents(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'networking_incidents');
    });
    return () => unsubscribe();
  }, [session, authLoaded]);

  // --- 4. NAVIGATION VIEW STATE ---
  const [currentView, setCurrentView] = useState<DashboardView>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- 5. SYNCHRONIZE DATASETS TO LOCAL STORAGE ---
  useEffect(() => {
    saveState('active_session', session);
  }, [session]);

  useEffect(() => {
    saveState('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    saveState('networking_incidents', incidents);
  }, [incidents]);

  useEffect(() => {
    saveState('networking_dockets', dockets);
  }, [dockets]);

  useEffect(() => {
    saveState('networking_feedbacks', feedbacks);
  }, [feedbacks]);

  useEffect(() => {
    saveState('networking_routers', routers);
  }, [routers]);

  useEffect(() => {
    saveState('networking_complaints', complaints);
  }, [complaints]);

  useEffect(() => {
    saveState('networking_waReports', waReports);
  }, [waReports]);

  useEffect(() => {
    saveState('networking_cyberReports', cyberReports);
  }, [cyberReports]);

  useEffect(() => {
    saveState('networking_mailReports', mailReports);
  }, [mailReports]);

  useEffect(() => {
    saveState('networking_techUpdates', techUpdates);
  }, [techUpdates]);

  useEffect(() => {
    saveState('viewed_incident_ids', viewedIncidentIds);
  }, [viewedIncidentIds]);

  useEffect(() => {
    saveState('viewed_complaint_ids', viewedComplaintIds);
  }, [viewedComplaintIds]);

  // --- 5.5 AUTOMATIC SYNC MECHANISM (EVERY 240 SECONDS) ---
  const performSync = () => {
    setIsSyncing(true);
    try {
      // Reload datasets from local storage
      const freshIncidents = loadState<NetworkIncident[]>('networking_incidents', INITIAL_NETWORK_INCIDENTS);
      const freshDockets = loadState<FEDocket[]>('networking_dockets', INITIAL_FE_DOCKETS);
      const freshFeedbacks = loadState<FeedbackCall[]>('networking_feedbacks', INITIAL_FEEDBACK_CALLS);
      const freshRouters = loadState<UnlinkRouter[]>('networking_routers', INITIAL_UNLINK_ROUTERS);
      const freshComplaints = loadState<ComplaintManagement[]>('networking_complaints', INITIAL_COMPLAINT_MANAGEMENT);
      const freshWaReports = loadState<WhatsAppReport[]>('networking_waReports', INITIAL_WHATSAPP_REPORTS);
      const freshCyberReports = loadState<CyberCrimeReport[]>('networking_cyberReports', INITIAL_CYBER_CRIME_REPORTS);
      const freshMailReports = loadState<MailWhatsAppCountReport[]>('networking_mailReports', INITIAL_MAIL_WHATSAPP_COUNT_REPORTS);
      const freshTechUpdates = loadState<TechInformationUpdate[]>('networking_techUpdates', INITIAL_TECH_UPDATES);
      const freshViewedIncidentIds = loadState<string[]>('viewed_incident_ids', []);
      const freshViewedComplaintIds = loadState<string[]>('viewed_complaint_ids', []);

      setIncidents(freshIncidents);
      setDockets(freshDockets);
      setFeedbacks(freshFeedbacks);
      setRouters(freshRouters);
      setComplaints(freshComplaints);
      setWaReports(freshWaReports);
      setCyberReports(freshCyberReports);
      setMailReports(freshMailReports);
      setTechUpdates(freshTechUpdates);
      setViewedIncidentIds(freshViewedIncidentIds);
      setViewedComplaintIds(freshViewedComplaintIds);

      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSyncCountdown(240);
      showToast('Dashboard data automatically synced from local storage.', 'success');
    } catch (error) {
      console.error('Error syncing datasets:', error);
      showToast('Failed to auto-sync datasets from local storage.', 'error');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          // Trigger auto refresh
          performSync();
          return 240;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mark incidents as read when NetworkIncident is viewed
  useEffect(() => {
    if (currentView === 'NetworkIncident' && incidents.length > 0) {
      const allIds = incidents.map((inc) => inc.id);
      const newIds = allIds.filter((id) => !viewedIncidentIds.includes(id));
      if (newIds.length > 0) {
        setViewedIncidentIds((prev) => {
          const unique = new Set([...prev, ...newIds]);
          return Array.from(unique);
        });
      }
    }
  }, [currentView, incidents, viewedIncidentIds]);

  // Mark complaints as read when ComplaintManagement is viewed
  useEffect(() => {
    if (currentView === 'ComplaintManagement' && complaints.length > 0) {
      const allIds = complaints.map((comp) => comp.id);
      const newIds = allIds.filter((id) => !viewedComplaintIds.includes(id));
      if (newIds.length > 0) {
        setViewedComplaintIds((prev) => {
          const unique = new Set([...prev, ...newIds]);
          return Array.from(unique);
        });
      }
    }
  }, [currentView, complaints, viewedComplaintIds]);

  // --- 6. AUTHENTICATION LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedEmail = loginEmail.trim().toLowerCase();
    if (!formattedEmail || !loginPassword) {
      setLoginError('Credentials cannot be empty');
      return;
    }

    setIsSyncing(true);
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, formattedEmail, loginPassword);
      } catch (signInErr: any) {
        if (formattedEmail === 'banibratamajumder18@gmail.com') {
          if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-not-found') {
            if (loginPassword === 'password') {
              console.log('Default administrator not found in Auth. Auto-provisioning...');
              try {
                userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, loginPassword);
                const newUid = userCredential.user.uid;
                
                // Save/update the user document in Firestore with the new valid Auth UID
                await setDoc(doc(db, 'users', newUid), {
                  uid: newUid,
                  username: 'Banibrata Majumder',
                  email: 'banibratamajumder18@gmail.com',
                  role: 'Admin',
                  password: 'password'
                }, { merge: true });
              } catch (createErr: any) {
                console.error('Failed to auto-create default administrator:', createErr);
                if (createErr.code === 'auth/email-already-in-use') {
                  const customErr = new Error('The administrator account already exists with a different password. Please enter the correct password you registered with, or click "Forgot Password" to reset it.');
                  (customErr as any).code = 'auth/admin-password-mismatch';
                  throw customErr;
                }
                throw signInErr;
              }
            } else {
              const customErr = new Error('Incorrect password for Administrator account. Please enter the correct password you registered with, or click "Forgot Password" to reset it.');
              (customErr as any).code = 'auth/admin-password-incorrect';
              throw customErr;
            }
          } else {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      } catch (getErr) {
        handleFirestoreError(getErr, OperationType.GET, `users/${userCredential.user.uid}`);
      }
      let username = formattedEmail.split('@')[0];
      let role: 'Admin' | 'Standard' = 'Standard';
      if (formattedEmail === 'banibratamajumder18@gmail.com') {
        role = 'Admin';
        username = 'Banibrata Majumder';
      } else if (userDoc && userDoc.exists()) {
        const uData = userDoc.data();
        username = uData.username || username;
        role = uData.role || 'Standard';
      }
      // Sync login password to Firestore on successful login
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          username,
          email: formattedEmail,
          role,
          password: loginPassword
        }, { merge: true });
      } catch (writeErr) {
        console.error('Error syncing login password to Firestore:', writeErr);
      }

      setSession({
        username,
        email: formattedEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        role,
        password: loginPassword
      });
      setLoginError('');
      showToast(`Successfully authenticated as ${username}!`, 'success');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Failed to authenticate';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'auth/operation-not-allowed-email';
      } else if (err.code === 'auth/admin-password-mismatch' || err.code === 'auth/admin-password-incorrect') {
        errMsg = err.message;
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid credentials. If you haven\'t created an account in this new database yet, please click the "Sign Up" tab above to register your user profile first!';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address';
      }
      setLoginError(errMsg);
      const isCustomAdminError = err.code === 'auth/admin-password-mismatch' || err.code === 'auth/admin-password-incorrect';
      showToast(isCustomAdminError ? errMsg : (err.code === 'auth/invalid-credential' ? 'Authentication failed. Please Sign Up if you are a new user.' : errMsg), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmail = signUpEmail.trim().toLowerCase();
    if (!formattedEmail || !signUpPassword || !signUpUsername) {
      setLoginError('All fields are required');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setLoginError('Passwords do not match');
      return;
    }
    setIsSyncing(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, signUpPassword);
      const uid = userCredential.user.uid;
      const userProfile = {
        uid,
        username: signUpUsername,
        email: formattedEmail,
        role: 'Standard' as const,
        password: signUpPassword
      };
      try {
        await setDoc(doc(db, 'users', uid), userProfile);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.WRITE, `users/${uid}`);
      }
      setSession({
        username: signUpUsername,
        email: formattedEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${signUpUsername}`,
        role: 'Standard',
        password: signUpPassword
      });
      setLoginError('');
      setIsSignUp(false);
      showToast(`Account created successfully for ${signUpUsername}!`, 'success');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Failed to register account';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'auth/operation-not-allowed-email';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This e-mail is already registered in our system. Please go to the "Sign In" tab to log in with your credentials, or use a different email.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password is too weak. It should be at least 6 characters.';
      }
      setLoginError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSyncing(true);
    setLoginError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      showToast('Successfully authenticated with Google!', 'success');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Failed to authenticate with Google';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'auth/operation-not-allowed-google';
      } else if (err.code === 'auth/popup-blocked') {
        errMsg = 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'Sign-in popup was closed before completing.';
      }
      setLoginError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailToReset = isSignUp ? signUpEmail : loginEmail;
    if (!emailToReset) {
      showToast('Please enter your email address first', 'error');
      setLoginError('Please enter your email address in the field above to reset your password');
      return;
    }
    setIsSyncing(true);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      showToast(`Password reset email successfully sent to ${emailToReset}! Please check your inbox and spam folder.`, 'success');
      setLoginError('');
    } catch (err: any) {
      console.error('Password reset email error:', err);
      let errMsg = err.message || 'Failed to send password reset email';
      if (err.code === 'auth/user-not-found') {
        errMsg = 'No user account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'The email address format is invalid.';
      }
      setLoginError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOfflineMode = (customEmail?: string, customUsername?: string) => {
    const email = customEmail || loginEmail || signUpEmail || 'banibratamajumder18@gmail.com';
    const isEmailAdmin = email.toLowerCase() === 'banibratamajumder18@gmail.com';
    const username = customUsername || signUpUsername || email.split('@')[0] || 'User';
    const offlineSession: UserSession = {
      username: `${username} (Offline)`,
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      role: isEmailAdmin ? 'Admin' : 'Standard'
    };
    setSession(offlineSession);
    saveState('active_session', offlineSession);
    showToast('অফলাইন ডেমো মোড চালু হয়েছে! আপনার সব পরিবর্তন ব্রাউজারে সংরক্ষিত থাকবে।', 'success');
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        const email = auth.currentUser.email || '';
        const todayStr = new Date().toISOString().split('T')[0];
        const cleanedEmail = email.toLowerCase().replace(/[@.]/g, '_');
        const docId = `${cleanedEmail}_${todayStr}`;
        const logDocRef = doc(db, 'user_logs', docId);
        const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        try {
          await setDoc(logDocRef, {
            lastLogout: nowTimeStr
          }, { merge: true });
          console.log(`Recorded logout for ${email} today: ${nowTimeStr}`);
          await syncUpdatedRecordToSheets('UserLogs', docId, { lastLogout: nowTimeStr });
        } catch (dbErr) {
          console.error('Failed to write logout time to Firestore:', dbErr);
        }
      }
      await signOut(auth);
      setSession(null);
      setCurrentView('Dashboard');
      setMobileMenuOpen(false);
      showToast('Logged out of active supervisor session.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
      setSession(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      alert('All password fields are mandatory');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsSyncing(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        // Also sync to Firestore
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { password: newPassword }, { merge: true });
        
        // Update local session password state
        if (session) {
          setSession({
            ...session,
            password: newPassword
          });
        }
        
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        showToast('Password updated successfully!', 'success');
      } else {
        showToast('No active authenticated user session found', 'error');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to change password: ' + (err.message || err));
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 6.5 AUDIT LOGGING HELPER ---
  const writeAuditLog = async (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LINK' | 'UNLINK', category: string, details: string) => {
    if (!session) return;
    const logId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const auditRecord = {
      id: logId,
      userId: auth.currentUser?.uid || 'Unknown',
      userEmail: session.email,
      username: session.username,
      action,
      category,
      details,
      timestamp: getLocalDateTimeString()
    };
    try {
      await setDoc(doc(db, 'audit_logs', logId), auditRecord);
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  };

  // --- 7. GENERIC STATE UPDATERS ---
  const handleAddIncident = async (item: Omit<NetworkIncident, 'id' | 'addedBy'>) => {
    const newItem: NetworkIncident = {
      ...item,
      id: `inc-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      statusHistory: [
        {
          status: item.status || 'Open',
          changedBy: session?.username || 'System',
          timestamp: new Date().toISOString()
        }
      ]
    };
    // Always update local state for offline safety
    setIncidents((prev) => [newItem, ...prev]);

    // Write Audit Log
    await writeAuditLog('CREATE', 'Incident', `Created Incident (ID: ${newItem.id}) - Type: ${newItem.type}, Status: ${newItem.status}, Description: ${newItem.problem}`);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'networking_incidents', newItem.id), newItem);
        if (newItem.status === 'Open' && (newItem.type === 'Major Issue' || newItem.type === 'Zone')) {
          showToast('⚠️ HIGH-PRIORITY Network incident successfully registered!', 'error');
        } else {
          showToast('Network incident successfully registered', 'success');
        }
        syncNewRecordToSheets('Incidents', newItem);
      } catch (error) {
        console.error('Firebase save failed, falling back to local state:', error);
        showToast('Saved locally. Firebase sync failed.', 'info');
      }
    } else {
      showToast('Network incident successfully saved locally!', 'success');
    }
  };

  const handleUpdateIncident = async (id: string, item: Partial<NetworkIncident>) => {
    let updatedHistoryForLocal: StatusHistoryEntry[] | undefined;

    // Always update local state for offline safety
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const statusChanged = item.status && item.status !== inc.status;
          const updatedHistory = statusChanged
            ? [
                ...(inc.statusHistory || [
                  {
                    status: inc.status || 'Open',
                    changedBy: inc.addedBy || 'System',
                    timestamp: inc.createdTime || new Date().toISOString()
                  }
                ]),
                {
                  status: item.status!,
                  changedBy: session?.username || 'System',
                  timestamp: new Date().toISOString()
                }
              ]
            : inc.statusHistory;

          updatedHistoryForLocal = updatedHistory;

          return {
            ...inc,
            ...item,
            statusHistory: updatedHistory,
            editedBy: session?.username || 'System',
            updatedTime: new Date().toISOString()
          };
        }
        return inc;
      })
    );

    // Write Audit Log
    await writeAuditLog('UPDATE', 'Incident', `Updated Incident (ID: ${id}) with: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);

    if (auth.currentUser) {
      try {
        const incRef = doc(db, 'networking_incidents', id);
        const docSnap = await getDoc(incRef);
        let updated: any;
        if (docSnap.exists()) {
          const currentData = docSnap.data() as NetworkIncident;
          const statusChanged = item.status && item.status !== currentData.status;
          const updatedHistory = statusChanged
            ? [
                ...(currentData.statusHistory || [
                  {
                    status: currentData.status || 'Open',
                    changedBy: currentData.addedBy || 'System',
                    timestamp: currentData.createdTime || new Date().toISOString()
                  }
                ]),
                {
                  status: item.status!,
                  changedBy: session?.username || 'System',
                  timestamp: new Date().toISOString()
                }
              ]
            : (currentData.statusHistory || updatedHistoryForLocal || []);

          updated = {
            ...currentData,
            ...item,
            statusHistory: updatedHistory,
            editedBy: session?.username || 'System',
            updatedTime: new Date().toISOString()
          };
        } else {
          // Fallback if record doesn't exist in Firestore yet (e.g., initial local mock records)
          const currentLocal = incidents.find((inc) => inc.id === id);
          const statusChanged = item.status && (!currentLocal || item.status !== currentLocal.status);
          const updatedHistory = statusChanged
            ? [
                ...(currentLocal?.statusHistory || [
                  {
                    status: currentLocal?.status || 'Open',
                    changedBy: currentLocal?.addedBy || 'System',
                    timestamp: currentLocal?.createdTime || new Date().toISOString()
                  }
                ]),
                {
                  status: item.status!,
                  changedBy: session?.username || 'System',
                  timestamp: new Date().toISOString()
                }
              ]
            : (currentLocal?.statusHistory || updatedHistoryForLocal || []);

          updated = {
            ...currentLocal,
            ...item,
            id,
            statusHistory: updatedHistory,
            editedBy: session?.username || 'System',
            updatedTime: new Date().toISOString()
          };
        }
        await setDoc(incRef, updated);
        showToast('Network incident record updated successfully', 'success');
        syncUpdatedRecordToSheets('Incidents', id, item);
      } catch (error) {
        console.error('Firebase update failed, falling back to local state:', error);
        showToast('Updated locally. Firebase sync failed.', 'info');
      }
    } else {
      showToast('Incident updated locally!', 'success');
    }
  };

  const handleAddDocket = async (item: Omit<FEDocket, 'id' | 'addedBy'>) => {
    const newItem: FEDocket = {
      ...item,
      id: `fed-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setDockets((prev) => [newItem, ...prev]);
    showToast('Field Engineer docket created successfully', 'success');
    await writeAuditLog('CREATE', 'Docket', `Created FE Docket (ID: ${newItem.id}) - User ID: ${newItem.userId}, Zone: ${newItem.zone}, Reason: ${newItem.reason}`);
    syncNewRecordToSheets('Dockets', newItem);
  };

  const handleUpdateDocket = async (id: string, item: Partial<FEDocket>) => {
    setDockets((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : doc
      )
    );
    showToast('FE docket record updated successfully', 'success');
    await writeAuditLog('UPDATE', 'Docket', `Updated FE Docket (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('Dockets', id, item);
  };

  const handleAddFeedback = async (item: Omit<FeedbackCall, 'id' | 'addedBy'>) => {
    const newItem: FeedbackCall = {
      ...item,
      id: `fbc-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setFeedbacks((prev) => [newItem, ...prev]);
    showToast('Feedback call registered successfully', 'success');
    await writeAuditLog('CREATE', 'Feedback', `Created Feedback Call (ID: ${newItem.id}) - User ID: ${newItem.userId}, Phone: ${newItem.phoneNo}, Reason: ${newItem.reason}`);
    syncNewRecordToSheets('Feedbacks', newItem);
  };

  const handleUpdateFeedback = async (id: string, item: Partial<FeedbackCall>) => {
    setFeedbacks((prev) =>
      prev.map((fbc) =>
        fbc.id === id
          ? {
              ...fbc,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : fbc
      )
    );
    showToast('Feedback call details updated successfully', 'success');
    await writeAuditLog('UPDATE', 'Feedback', `Updated Feedback Call (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('Feedbacks', id, item);
  };

  const handleAddRouter = async (item: Omit<UnlinkRouter, 'id' | 'addedBy'>) => {
    const newItem: UnlinkRouter = {
      ...item,
      id: `unr-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setRouters((prev) => [newItem, ...prev]);
    showToast('MAC unlink request dispatched successfully', 'success');
    await writeAuditLog('LINK', 'Router', `Created Router Unlink (ID: ${newItem.id}) - User ID: ${newItem.userId}, Router MAC: ${newItem.macAddress}, Issue: ${newItem.issue}`);
    syncNewRecordToSheets('Routers', newItem);
  };

  const handleUpdateRouter = async (id: string, item: Partial<UnlinkRouter>) => {
    setRouters((prev) =>
      prev.map((unr) =>
        unr.id === id
          ? {
              ...unr,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : unr
      )
    );
    showToast('Unlink router record updated successfully', 'success');
    await writeAuditLog('UPDATE', 'Router', `Updated Router Unlink (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('Routers', id, item);
  };

  const handleAddComplaint = async (item: Omit<ComplaintManagement, 'id' | 'addedBy'>) => {
    const newItem: ComplaintManagement = {
      ...item,
      id: `cmp-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      statusHistory: [
        {
          status: item.status || 'Pending',
          changedBy: session?.username || 'System',
          timestamp: new Date().toISOString()
        }
      ]
    };
    setComplaints((prev) => [newItem, ...prev]);
    if (newItem.status === 'Pending') {
      showToast('📋 New pending customer complaint registered!', 'info');
    } else {
      showToast('Customer complaint file registered', 'success');
    }
    await writeAuditLog('CREATE', 'Complaint', `Created Complaint (ID: ${newItem.id}) - User ID: ${newItem.userId}, Reason: ${newItem.reason}`);
    syncNewRecordToSheets('Complaints', newItem);
  };

  const handleUpdateComplaint = async (id: string, item: Partial<ComplaintManagement>) => {
    setComplaints((prev) =>
      prev.map((cmp) => {
        if (cmp.id === id) {
          const statusChanged = item.status && item.status !== cmp.status;
          const updatedHistory = statusChanged
            ? [
                ...(cmp.statusHistory || [
                  {
                    status: cmp.status || 'Pending',
                    changedBy: cmp.addedBy || 'System',
                    timestamp: cmp.createdTime || new Date().toISOString()
                  }
                ]),
                {
                  status: item.status!,
                  changedBy: session?.username || 'System',
                  timestamp: new Date().toISOString()
                }
              ]
            : cmp.statusHistory;

          return {
            ...cmp,
            ...item,
            statusHistory: updatedHistory,
            editedBy: session?.username || 'System',
            updatedTime: new Date().toISOString()
          };
        }
        return cmp;
      })
    );
    showToast('Complaint file updated successfully', 'success');
    await writeAuditLog('UPDATE', 'Complaint', `Updated Complaint (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('Complaints', id, item);
  };

  const handleAddWaReport = async (item: Omit<WhatsAppReport, 'id' | 'addedBy'>) => {
    const newItem: WhatsAppReport = {
      ...item,
      id: `war-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setWaReports((prev) => [newItem, ...prev]);
    showToast('WhatsApp duty shift logged successfully', 'success');
    await writeAuditLog('CREATE', 'WhatsAppReport', `Created WhatsApp Shift Report (ID: ${newItem.id}) - Day Opt: ${newItem.nameDay}, Night Opt: ${newItem.nameNight}`);
    syncNewRecordToSheets('WhatsAppReports', newItem);
  };

  const handleUpdateWaReport = async (id: string, item: Partial<WhatsAppReport>) => {
    setWaReports((prev) =>
      prev.map((war) =>
        war.id === id
          ? {
              ...war,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : war
      )
    );
    showToast('Duty shift record updated', 'success');
    await writeAuditLog('UPDATE', 'WhatsAppReport', `Updated WhatsApp Shift Report (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('WhatsAppReports', id, item);
  };

  const handleAddCyberReport = async (item: Omit<CyberCrimeReport, 'id' | 'addedBy'>) => {
    const newItem: CyberCrimeReport = {
      ...item,
      id: `ccr-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setCyberReports((prev) => [newItem, ...prev]);
    showToast('Cyber crime enquiry registered', 'success');
    await writeAuditLog('CREATE', 'CyberCrimeReport', `Created Cyber trace enquiry (ID: ${newItem.id}) - Count: ${newItem.count}, Area: ${newItem.areaDetails}`);
    syncNewRecordToSheets('CyberReports', newItem);
  };

  const handleUpdateCyberReport = async (id: string, item: Partial<CyberCrimeReport>) => {
    setCyberReports((prev) =>
      prev.map((ccr) =>
        ccr.id === id
          ? {
              ...ccr,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : ccr
      )
    );
    showToast('Cyber trace enquiry updated', 'success');
    await writeAuditLog('UPDATE', 'CyberCrimeReport', `Updated Cyber trace enquiry (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('CyberReports', id, item);
  };

  const handleAddMailReport = async (item: Omit<MailWhatsAppCountReport, 'id' | 'addedBy'>) => {
    const newItem: MailWhatsAppCountReport = {
      ...item,
      id: `mwc-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setMailReports((prev) => [newItem, ...prev]);
    showToast('Daily comms statistics logged successfully', 'success');
    await writeAuditLog('CREATE', 'MailWhatsAppCountReport', `Created stats log (ID: ${newItem.id}) - Total Mail: ${newItem.totalMail}, WhatsApp Sent: ${newItem.whatsAppSent}`);
    syncNewRecordToSheets('MailReports', newItem);
  };

  const handleUpdateMailReport = async (id: string, item: Partial<MailWhatsAppCountReport>) => {
    setMailReports((prev) =>
      prev.map((mwc) =>
        mwc.id === id
          ? {
              ...mwc,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : mwc
      )
    );
    showToast('Daily comms report updated', 'success');
    await writeAuditLog('UPDATE', 'MailWhatsAppCountReport', `Updated stats log (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('MailReports', id, item);
  };

  const handleAddTechUpdate = async (item: Omit<TechInformationUpdate, 'id' | 'addedBy'>) => {
    const newItem: TechInformationUpdate = {
      ...item,
      id: `tu-${Date.now()}`,
      addedBy: session?.username || 'System',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
    setTechUpdates((prev) => [newItem, ...prev]);
    showToast('Infrastructure bulletin broadcasted', 'success');
    await writeAuditLog('CREATE', 'TechInformationUpdate', `Broadcasted Tech update (ID: ${newItem.id}) - Heading: ${newItem.heading}, Body: ${newItem.body}`);
    syncNewRecordToSheets('TechUpdates', newItem);
  };

  const handleUpdateTechUpdate = async (id: string, item: Partial<TechInformationUpdate>) => {
    setTechUpdates((prev) =>
      prev.map((tu) =>
        tu.id === id
          ? {
              ...tu,
              ...item,
              editedBy: session?.username || 'System',
              updatedTime: new Date().toISOString()
            }
          : tu
      )
    );
    showToast('Broadcasted bulletin updated successfully', 'success');
    await writeAuditLog('UPDATE', 'TechInformationUpdate', `Updated Tech update (ID: ${id}) with fields: ${Object.entries(item).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    syncUpdatedRecordToSheets('TechUpdates', id, item);
  };

  // --- 7.5 GENERIC STATE DELETERS ---
  const handleDeleteIncident = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Network Incident Record',
      'Are you sure you want to delete this network incident record? This will permanently delete the item from Firestore and remove the entry from Google Sheets.',
      async () => {
        // Always update local state for offline safety
        setIncidents((prev) => prev.filter((item) => item.id !== id));

        await writeAuditLog('DELETE', 'Incident', `Deleted Network Incident Record (ID: ${id})`);

        if (auth.currentUser) {
          try {
            await deleteDoc(doc(db, 'networking_incidents', id));
            showToast('Network incident record deleted successfully', 'success');
          } catch (error) {
            console.error('Firebase delete failed, falling back to local state:', error);
            showToast('Deleted locally. Firebase sync failed.', 'info');
          }
        } else {
          showToast('Incident deleted locally!', 'success');
        }
        await syncDeletedRecordToSheets('Incidents', id);
      }
    );
  };

  const handleDeleteDocket = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Field Engineer Docket',
      'Are you sure you want to delete this Field Engineer docket record? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setDockets((prev) => prev.filter((item) => item.id !== id));
        showToast('Field Engineer docket deleted successfully', 'success');
        await writeAuditLog('DELETE', 'Docket', `Deleted FE Docket Record (ID: ${id})`);
        await syncDeletedRecordToSheets('Dockets', id);
      }
    );
  };

  const handleDeleteFeedback = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Feedback Record',
      'Are you sure you want to delete this customer feedback call record? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
        showToast('Feedback call record deleted successfully', 'success');
        await writeAuditLog('DELETE', 'Feedback', `Deleted Feedback Call Record (ID: ${id})`);
        await syncDeletedRecordToSheets('Feedbacks', id);
      }
    );
  };

  const handleDeleteRouter = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Router Unlink Request',
      'Are you sure you want to delete this MAC unlink request record? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setRouters((prev) => prev.filter((item) => item.id !== id));
        showToast('MAC unlink request deleted successfully', 'success');
        await writeAuditLog('DELETE', 'Router', `Deleted Router Unlink Record (ID: ${id})`);
        await syncDeletedRecordToSheets('Routers', id);
      }
    );
  };

  const handleDeleteComplaint = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Complaint File',
      'Are you sure you want to delete this customer complaint file? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setComplaints((prev) => prev.filter((item) => item.id !== id));
        showToast('Complaint file deleted successfully', 'success');
        await writeAuditLog('DELETE', 'Complaint', `Deleted Complaint Record (ID: ${id})`);
        await syncDeletedRecordToSheets('Complaints', id);
      }
    );
  };

  const handleDeleteWaReport = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete WhatsApp Duty Report',
      'Are you sure you want to delete this WhatsApp duty shift report? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setWaReports((prev) => prev.filter((item) => item.id !== id));
        showToast('WhatsApp duty shift report deleted successfully', 'success');
        await writeAuditLog('DELETE', 'WhatsAppReport', `Deleted WhatsApp Shift Report Record (ID: ${id})`);
        await syncDeletedRecordToSheets('WhatsAppReports', id);
      }
    );
  };

  const handleDeleteCyberReport = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Cyber Trace Enquiry',
      'Are you sure you want to delete this cyber trace enquiry record? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setCyberReports((prev) => prev.filter((item) => item.id !== id));
        showToast('Cyber trace enquiry record deleted successfully', 'success');
        await writeAuditLog('DELETE', 'CyberCrimeReport', `Deleted Cyber trace enquiry Record (ID: ${id})`);
        await syncDeletedRecordToSheets('CyberReports', id);
      }
    );
  };

  const handleDeleteMailReport = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Daily Stats Report',
      'Are you sure you want to delete this daily count stats report? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setMailReports((prev) => prev.filter((item) => item.id !== id));
        showToast('Daily stats report record deleted successfully', 'success');
        await writeAuditLog('DELETE', 'MailWhatsAppCountReport', `Deleted statistics log (ID: ${id})`);
        await syncDeletedRecordToSheets('MailReports', id);
      }
    );
  };

  const handleDeleteTechUpdate = (id: string) => {
    if (session?.role !== 'Admin') {
      showToast('Unauthorized: Only Administrators can delete records.', 'error');
      return;
    }
    requestDeleteConfirm(
      'Delete Broadcasted Bulletin',
      'Are you sure you want to delete this broadcasted tech bulletin? This will permanently remove the record and synchronize the deletion with Google Sheets.',
      async () => {
        setTechUpdates((prev) => prev.filter((item) => item.id !== id));
        showToast('Tech broadcast bulletin deleted successfully', 'success');
        await writeAuditLog('DELETE', 'TechInformationUpdate', `Deleted Tech bulletin Record (ID: ${id})`);
        await syncDeletedRecordToSheets('TechUpdates', id);
      }
    );
  };

  // ----------------------------------------------------
  // LOGIN FORM RENDER (Page 0)
  // ----------------------------------------------------
  if (!session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 font-sans bg-slate-950 overflow-hidden" id="login-view-container">
        {/* Animated Constellation Canvas Background */}
        <NetworkCanvas />

        {/* Minimalist Glassmorphism Login/Signup Card */}
        <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl z-10 text-white animate-slideUp" id="login-card">
          <div className="flex flex-col items-center text-center mb-6" id="login-heading">
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 p-3.5 rounded-xl mb-4 shadow-lg shadow-cyan-500/20" id="login-logo">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Networking Info
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Enterprise Users Dashboard (Firebase Connect)
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setLoginError('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setLoginError('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {loginError && (
            <div className="mb-4 text-left">
              {loginError === 'auth/operation-not-allowed-email' ? (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs space-y-2.5 animate-pulseOnce" id="login-error-alert">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-rose-400 flex items-center gap-1">
                    <span>🔑 Email/Password Provider Error / Disabled</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-rose-300 font-semibold">
                    বাংলা: আপনার ফায়ারবেস কনসোলে (Firebase Console) &quot;Email/Password&quot; সাইন-ইন প্রোভাইডার চালু করা নেই অথবা এপিআই কি রেস্ট্রিকশনের কারণে সেশন ব্লক হচ্ছে।
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    English: The Email/Password sign-in provider is disabled in your Firebase Console, or GCP API Key restrictions are blocking the auth token.
                  </p>
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <p className="font-bold text-indigo-400">সমাধান করার নিয়ম (Resolution Steps):</p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300 font-medium">
                      <li>আপনার <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-indigo-300">Firebase Console</a> ওপেন করুন</li>
                      <li>বামদিকের মেনু থেকে <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong> অপশনে যান</li>
                      <li><strong>Add new provider</strong> বাটনে ক্লিক করে <strong>Email/Password</strong> সিলেক্ট করুন</li>
                      <li>প্রথম সুইচ <strong>&quot;Enable&quot;</strong> টি অন করে <strong>Save</strong> বাটনে ক্লিক করুন</li>
                    </ol>
                  </div>
                  <div className="border-t border-rose-800/50 pt-2.5">
                    <button
                      type="button"
                      onClick={() => handleOfflineMode(isSignUp ? signUpEmail : loginEmail, isSignUp ? signUpUsername : undefined)}
                      className="w-full bg-rose-900/60 hover:bg-rose-800/80 active:bg-rose-950 border border-rose-700 text-rose-100 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>অফলাইন ডেমো মোডে প্রবেশ করুন (Bypass to Offline Mode)</span>
                    </button>
                  </div>
                </div>
              ) : loginError === 'auth/operation-not-allowed-google' ? (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs space-y-2.5" id="login-error-alert">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-rose-400 flex items-center gap-1">
                    <span>🔑 Google Sign-In Provider Disabled</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-rose-300 font-semibold">
                    বাংলা: আপনার ফায়ারবেস কনসোলে &quot;Google&quot; সাইন-ইন প্রোভাইডার চালু করা নেই। গুগল দিয়ে সাইন-ইন করতে এটি অত্যন্ত জরুরি।
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    English: The Google sign-in provider is disabled in your Firebase Console.
                  </p>
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <p className="font-bold text-indigo-400">সমাধান করার নিয়ম (Resolution Steps):</p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300 font-medium">
                      <li>আপনার <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-indigo-300">Firebase Console</a> ওপেন করুন</li>
                      <li>বামদিকের মেনু থেকে <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong> অপশনে যান</li>
                      <li><strong>Add new provider</strong> বাটনে ক্লিক করে <strong>Google</strong> সিলেক্ট করুন</li>
                      <li><strong>&quot;Enable&quot;</strong> টগল করুন, প্রোজেক্টের সাপোর্ট ইমেল সিলেক্ট করে <strong>Save</strong> এ ক্লিক করুন</li>
                    </ol>
                  </div>
                  <div className="border-t border-rose-800/50 pt-2.5">
                    <button
                      type="button"
                      onClick={() => handleOfflineMode()}
                      className="w-full bg-rose-900/60 hover:bg-rose-800/80 active:bg-rose-950 border border-rose-700 text-rose-100 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>অফলাইন ডেমো মোডে প্রবেশ করুন (Bypass to Offline Mode)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/50 border border-rose-900/50 text-rose-300 p-4 rounded-xl text-xs space-y-3" id="login-error-alert">
                  <div className="font-semibold flex items-center gap-1.5 text-rose-400">
                    <span>⚠️</span>
                    <span>{loginError}</span>
                  </div>
                  <div className="border-t border-rose-900/40 pt-2.5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="w-full bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 font-bold text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>✉️</span>
                      <span>রিসেট ইমেল পাঠান (Send Password Reset Email)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOfflineMode(isSignUp ? signUpEmail : loginEmail, isSignUp ? signUpUsername : undefined)}
                      className="w-full bg-rose-900/30 hover:bg-rose-800/40 border border-rose-800/60 text-rose-200 font-bold text-[11px] py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Shield className="w-3 h-3 text-rose-400" />
                      <span>অফলাইন ডেমো মোডে ডাইরেক্ট লগইন (Offline Demo Bypass)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSignUp ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLogin} className="space-y-4" id="login-form">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Official E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="e.g. user@nbn.net"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    id="login-email-input"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-bold"
                    id="login-password-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/10 cursor-pointer transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                id="submit-login-action"
              >
                {isSyncing ? 'Authenticating...' : 'Sign In to User Console'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold">
                  <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSyncing}
                className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                id="google-signin-action"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <g>
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.77-2.4 3.61v3h3.86c2.26-2.08 3.67-5.15 3.67-8.76z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.24 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.29a7.18 7.18 0 0 1 0-4.58V6.58H1.29a11.936 11.936 0 0 0 0 10.84l3.98-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.76 1.29 6.58l3.98 3.13c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </g>
                </svg>
                <span>गूगल অ্যাকাউন্ট দিয়ে লগইন করুন (Google Sign-In)</span>
              </button>



            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4" id="signup-form">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">User Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Banibrata"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    id="signup-username-input"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Official E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="e.g. user@nbn.net"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    id="signup-email-input"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-bold"
                    id="signup-password-input"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-bold"
                    id="signup-confirm-password-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/10 cursor-pointer transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                id="submit-signup-action"
              >
                {isSyncing ? 'Creating Account...' : 'Register User Profile'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold">
                  <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSyncing}
                className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                id="google-signup-action"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <g>
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.77-2.4 3.61v3h3.86c2.26-2.08 3.67-5.15 3.67-8.76z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.24 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.29a7.18 7.18 0 0 1 0-4.58V6.58H1.29a11.936 11.936 0 0 0 0 10.84l3.98-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.76 1.29 6.58l3.98 3.13c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </g>
                </svg>
                <span>गूगल অ্যাকাউন্ট দিয়ে রেজিস্টার করুন (Google Sign-Up)</span>
              </button>



            </form>
          )}

          {/* OFFLINE/DEMO BYPASS OPTION */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-center" id="offline-mode-bypass-section">
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              ফায়ারবেস চালু না থাকলে বা ডেটা সেভ করতে সমস্যা হলে:
            </p>
            <button
              type="button"
              onClick={handleOfflineMode}
              className="w-full bg-indigo-950/40 hover:bg-indigo-900 border border-slate-800 hover:border-indigo-500 text-indigo-200 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-slate-950/40"
              id="bypass-to-offline-mode"
            >
              <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Continue in Offline Mode (অফলাইন মোড)</span>
            </button>
            <p className="text-[9px] text-slate-500 font-semibold leading-normal">
              Offline mode saves all additions, updates, and deletes directly to your browser's local storage (নিরাপদ ও সহজ).
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Authorized Operations Only. Secured by Firebase Cloud Firestore.</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 8. PRE-RENDER ANALYTICAL METRICS FOR WIDGETS ---
  const countOpenIncidents = incidents.filter((i) => i.status === 'Open').length;
  const countPendingFeedbacks = feedbacks.filter((f) => f.status === 'Pending').length;
  const countPendingComplaints = complaints.filter((c) => c.status === 'Pending').length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning ☀️';
    if (hr < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  // Real-time notification systems filters
  const unviewedHighPriorityIncidents = incidents.filter(
    (inc) => !viewedIncidentIds.includes(inc.id) && inc.status === 'Open' && (inc.type === 'Major Issue' || inc.type === 'Zone')
  );
  const unviewedComplaints = complaints.filter(
    (comp) => !viewedComplaintIds.includes(comp.id) && comp.status === 'Pending'
  );

  // Search computation
  const getSearchResults = () => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      view: DashboardView;
      status?: string;
      meta?: string;
    }> = [];

    // 1. Incidents
    incidents.forEach((inc) => {
      if (
        inc.id.toLowerCase().includes(query) ||
        inc.desc.toLowerCase().includes(query) ||
        inc.customerName.toLowerCase().includes(query) ||
        inc.routerIp.toLowerCase().includes(query) ||
        inc.location.toLowerCase().includes(query)
      ) {
        results.push({
          id: inc.id,
          title: inc.desc,
          subtitle: `Incident ID: ${inc.id} • Customer: ${inc.customerName} • IP: ${inc.routerIp}`,
          category: 'Network Incident',
          view: 'NetworkIncident',
          status: inc.status,
          meta: inc.time
        });
      }
    });

    // 2. Complaints
    complaints.forEach((comp) => {
      if (
        comp.id.toLowerCase().includes(query) ||
        comp.customerName.toLowerCase().includes(query) ||
        comp.accountNo.toLowerCase().includes(query) ||
        comp.mobile.toLowerCase().includes(query) ||
        comp.complaintType.toLowerCase().includes(query) ||
        comp.notes.toLowerCase().includes(query)
      ) {
        results.push({
          id: comp.id,
          title: comp.complaintType,
          subtitle: `Acct: ${comp.accountNo} • Customer: ${comp.customerName} • Mobile: ${comp.mobile}`,
          category: 'Complaint Management',
          view: 'ComplaintManagement',
          status: comp.status,
          meta: comp.date
        });
      }
    });

    // 3. Tech Updates
    techUpdates.forEach((upd) => {
      if (
        upd.id.toLowerCase().includes(query) ||
        upd.subject.toLowerCase().includes(query) ||
        upd.details.toLowerCase().includes(query) ||
        upd.platform.toLowerCase().includes(query)
      ) {
        results.push({
          id: upd.id,
          title: upd.subject,
          subtitle: `Platform: ${upd.platform} • Author: ${upd.operatorName}`,
          category: 'Tech Update',
          view: 'TechInformationUpdate',
          meta: upd.time
        });
      }
    });

    // 4. FEDockets
    dockets.forEach((dock) => {
      if (
        dock.docketId.toLowerCase().includes(query) ||
        dock.fieldExecutive.toLowerCase().includes(query) ||
        dock.issueDetails.toLowerCase().includes(query) ||
        dock.contact.toLowerCase().includes(query)
      ) {
        results.push({
          id: dock.docketId,
          title: dock.issueDetails,
          subtitle: `Docket ID: ${dock.docketId} • FE: ${dock.fieldExecutive} • Contact: ${dock.contact}`,
          category: 'FE Docket',
          view: 'FEDocket',
          status: dock.status,
          meta: dock.time
        });
      }
    });

    // 5. Routers
    routers.forEach((r) => {
      if (
        r.id.toLowerCase().includes(query) ||
        r.subId.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query) ||
        r.phone.toLowerCase().includes(query)
      ) {
        results.push({
          id: r.id,
          title: `Unlink Router Request (${r.subId})`,
          subtitle: `Customer: ${r.customerName} • Phone: ${r.phone} • Reason: ${r.reason}`,
          category: 'Unlink Router',
          view: 'UnlinkRouter',
          status: r.status,
          meta: r.time
        });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  return (
    <div className={`min-h-screen flex flex-col relative font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark-theme bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-800'}`} id="authenticated-view-container">
      {/* ---------------------------------------------------- */}
      {/* GLOBAL TOAST ALERTS OVERLAY */}
      {/* ---------------------------------------------------- */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold font-sans animate-fadeIn`}
          style={{
            backgroundColor: toast.type === 'success' ? '#f0fdf4' : toast.type === 'error' ? '#fdf2f2' : '#f0f9ff',
            borderColor: toast.type === 'success' ? '#bcf0da' : toast.type === 'error' ? '#f8b4b4' : '#b3e0ff',
            color: toast.type === 'success' ? '#03543f' : toast.type === 'error' ? '#9b1c1c' : '#00539c'
          }}
          id="toast-notification"
        >
          <Activity className="w-4 h-4 text-current" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* GLOBAL NAVIGATION SCHEMA & TOP BAR */}
      {/* ---------------------------------------------------- */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md transition-all duration-300" id="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between h-16">
          {/* Brand Logo with click to Home */}
          <div
            onClick={() => { setCurrentView('Dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer group"
            id="header-brand"
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/10">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Networking Info
              </h1>
              <span className="text-[9px] text-indigo-400 block uppercase font-bold tracking-wider animate-pulse">
                Tech Support
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-bold" id="desktop-nav">
            {/* Dedicated Home explicitly positioned */}
            <button
              onClick={() => setCurrentView('Dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'Dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              id="topbar-home-btn"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentView('NetworkIncident')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'NetworkIncident' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Incident</span>
              {unviewedHighPriorityIncidents.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black items-center justify-center animate-pulse border border-slate-900 shadow-xs">
                  {unviewedHighPriorityIncidents.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('FEDocket')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'FEDocket' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>FE Docket</span>
            </button>

            <button
              onClick={() => setCurrentView('FeedbackCall')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'FeedbackCall' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => setCurrentView('UnlinkRouter')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'UnlinkRouter' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Unlink className="w-4 h-4" />
              <span>Unlink Router</span>
            </button>

            <button
              onClick={() => setCurrentView('ComplaintManagement')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'ComplaintManagement' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Complaint</span>
              {unviewedComplaints.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 rounded-full bg-violet-600 text-white text-[9px] font-black items-center justify-center animate-pulse border border-slate-900 shadow-xs">
                  {unviewedComplaints.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('MultipleReport')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'MultipleReport' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setCurrentView('TechInformationUpdate')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                currentView === 'TechInformationUpdate' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tech Update</span>
            </button>

            {session?.role === 'Admin' && (
              <button
                onClick={() => setCurrentView('AdminPortal')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  currentView === 'AdminPortal' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                id="topbar-admin-portal-btn"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* User Controls Aligned Right */}
          <div className="flex items-center gap-2 md:gap-3" id="header-user-controls">
            {/* Local Refresh Mechanism */}
            <button
              onClick={performSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 p-2 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-150 cursor-pointer border border-slate-800 bg-slate-900/40 hover:border-slate-700 shadow-xs focus:outline-hidden disabled:opacity-50"
              title={`Datasets refreshed locally at ${lastSyncedTime}. Next auto-refresh in ${syncCountdown}s.`}
              id="header-sync-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="text-[10px] font-mono hidden sm:inline-block font-bold">
                {isSyncing ? 'Refreshing...' : `Refresh: ${syncCountdown}s`}
              </span>
            </button>

            {/* Elegant Search Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchModal(true);
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center border border-slate-800 bg-slate-900/40 hover:border-slate-700 shadow-xs focus:outline-hidden"
              title="Search System-Wide (Incidents, Complaints, etc.)"
              id="header-search-trigger-btn"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Clickable User Profile Dropdown Trigger */}
            <div className="relative" id="profile-dropdown-container">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-indigo-500/50 focus:outline-hidden"
                id="profile-block-btn"
                title="User Menu"
              >
                <img
                  src={session.avatar}
                  alt="Profile"
                  className="w-8 h-8 bg-indigo-100 rounded-full border-2 border-slate-700 hover:border-indigo-400 transition-colors"
                  referrerPolicy="no-referrer"
                />
              </button>

              {userDropdownOpen && (
                <>
                  {/* Backdrop to close the dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  {/* Dropdown Menu Box */}
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 py-1.5 animate-fadeIn"
                    id="profile-dropdown-menu"
                  >
                    {/* Header: User Info Summary */}
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed In As</p>
                      <p className="text-xs font-black text-white truncate mt-0.5">{session.username}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{session.email}</p>
                      <span className="inline-block text-[9px] font-bold bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                        {session.role || 'Standard User'}
                      </span>
                    </div>

                    {/* Action Links */}
                    <div className="p-1 space-y-0.5">
                      {/* Option 1: User Info */}
                      <button
                        onClick={() => {
                          setShowUserInfoModal(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                        id="dropdown-user-info-btn"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>User Info</span>
                      </button>

                      {/* Option 2: Change Password */}
                      <button
                        onClick={() => {
                          setOldPassword(session?.password || '');
                          setShowPasswordModal(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                        id="dropdown-change-password-btn"
                      >
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>Change Password</span>
                      </button>

                      {/* Option: Theme Toggle */}
                      <button
                        onClick={() => {
                          const nextTheme = theme === 'dark' ? 'light' : 'dark';
                          setTheme(nextTheme);
                          showToast(`Switched dashboard theme to ${nextTheme} mode.`, 'info');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                        id="dropdown-theme-toggle-btn"
                      >
                        <div className="flex items-center gap-2">
                          {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-indigo-400" />
                          )}
                          <span>Theme</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${theme === 'dark' ? 'bg-amber-950/80 text-amber-400 border border-amber-900/40' : 'bg-indigo-950/80 text-indigo-300 border border-indigo-900/40'}`}>
                          {theme === 'dark' ? 'DARK' : 'LIGHT'}
                        </span>
                      </button>

                      <div className="h-px bg-slate-800 my-1" />

                      {/* Option 3: Logout */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer text-left"
                        id="dropdown-logout-btn"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white xl:hidden cursor-pointer"
              id="mobile-hamburger"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-2 text-xs font-bold animate-fadeIn" id="mobile-dropdown-nav">
            <button
              onClick={() => { setCurrentView('Dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'Dashboard' ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Home className="w-4 h-4" />
              <span>Home Dashboard</span>
            </button>
            <button
              onClick={() => { setCurrentView('NetworkIncident'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg ${currentView === 'NetworkIncident' ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                <span>Network Incident</span>
              </div>
              {unviewedHighPriorityIncidents.length > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-black h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                  {unviewedHighPriorityIncidents.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setCurrentView('FEDocket'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'FEDocket' ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Wrench className="w-4 h-4" />
              <span>FE Support Docket</span>
            </button>
            <button
              onClick={() => { setCurrentView('FeedbackCall'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'FeedbackCall' ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Feedback Calls</span>
            </button>
            <button
              onClick={() => { setCurrentView('UnlinkRouter'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'UnlinkRouter' ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Unlink className="w-4 h-4" />
              <span>Unlink Routers</span>
            </button>
            <button
              onClick={() => { setCurrentView('ComplaintManagement'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg ${currentView === 'ComplaintManagement' ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Complaint Management</span>
              </div>
              {unviewedComplaints.length > 0 && (
                <span className="bg-violet-600 text-white text-[9px] font-black h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                  {unviewedComplaints.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setCurrentView('MultipleReport'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'MultipleReport' ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Multi Section Reports</span>
            </button>
            <button
              onClick={() => { setCurrentView('TechInformationUpdate'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'TechInformationUpdate' ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tech Updates</span>
            </button>
            {session?.role === 'Admin' && (
              <button
                onClick={() => { setCurrentView('AdminPortal'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg ${currentView === 'AdminPortal' ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-300 hover:bg-slate-800'}`}
                id="mobile-admin-portal-btn"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN VIEWPORT LAYOUT */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6" id="dashboard-viewport">
        {/* ---------------------------------------------------- */}
        {/* VIEW 1: INDEX PAGE (Dashboard) */}
        {/* ---------------------------------------------------- */}
        {currentView === 'Dashboard' && (
          <div className="space-y-6 animate-fadeIn" id="dashboard-index-view">
            {/* Minimalist Hero Banner */}
            <PremiumHeroBanner setCurrentView={setCurrentView} />

            {/* Metric Summary Widgets: High-level metric blocks representing all 7 dynamic pages */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" id="index-summary-widgets">
              {/* Metric 1 */}
              <div
                onClick={() => setCurrentView('NetworkIncident')}
                className="relative bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {unviewedHighPriorityIncidents.length > 0 && (
                  <span className="absolute top-3 right-3 flex items-center gap-1.5" title="New Unresolved High-Priority Incident">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span className="text-[9px] bg-rose-50 text-rose-600 font-black px-2 py-0.5 rounded-full border border-rose-100/80 uppercase tracking-wider animate-pulse">
                      {unviewedHighPriorityIncidents.length} NEW
                    </span>
                  </span>
                )}
                <div className="text-rose-500 bg-rose-50 p-2 rounded-xl self-start">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">{incidents.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Incidents</span>
                  {countOpenIncidents > 0 && (
                    <span className="text-[9px] text-rose-600 font-semibold mt-0.5 block">🔴 {countOpenIncidents} Open</span>
                  )}
                </div>
              </div>

              {/* Metric 2 */}
              <div
                onClick={() => setCurrentView('FEDocket')}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="text-sky-500 bg-sky-50 p-2 rounded-xl self-start">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">{dockets.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">FE Dockets</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Assigned to field</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div
                onClick={() => setCurrentView('FeedbackCall')}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="text-emerald-500 bg-emerald-50 p-2 rounded-xl self-start">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">{feedbacks.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Feedbacks</span>
                  {countPendingFeedbacks > 0 && (
                    <span className="text-[9px] text-rose-600 font-semibold mt-0.5 block">🕒 {countPendingFeedbacks} Pending</span>
                  )}
                </div>
              </div>

              {/* Metric 4 */}
              <div
                onClick={() => setCurrentView('UnlinkRouter')}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="text-amber-500 bg-amber-50 p-2 rounded-xl self-start">
                  <Unlink className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">{routers.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">MAC Unlinks</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Router resets</span>
                </div>
              </div>

              {/* Metric 5 */}
              <div
                onClick={() => setCurrentView('ComplaintManagement')}
                className="relative bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {unviewedComplaints.length > 0 && (
                  <span className="absolute top-3 right-3 flex items-center gap-1.5" title="New Pending Customer Complaint">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                    </span>
                    <span className="text-[9px] bg-violet-50 text-violet-600 font-black px-2 py-0.5 rounded-full border border-violet-100/80 uppercase tracking-wider animate-pulse">
                      {unviewedComplaints.length} NEW
                    </span>
                  </span>
                )}
                <div className="text-violet-500 bg-violet-50 p-2 rounded-xl self-start">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">{complaints.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Complaints</span>
                  {countPendingComplaints > 0 && (
                    <span className="text-[9px] text-rose-600 font-semibold mt-0.5 block">🕒 {countPendingComplaints} Pending</span>
                  )}
                </div>
              </div>

              {/* Metric 6 */}
              <div
                onClick={() => setCurrentView('MultipleReport')}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="text-teal-500 bg-teal-50 p-2 rounded-xl self-start">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">
                    {waReports.length + cyberReports.length + mailReports.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Reports</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">3 Report types</span>
                </div>
              </div>

              {/* Metric 7 */}
              <div
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="text-indigo-500 bg-indigo-50 p-2 rounded-xl self-start">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black block text-slate-800">{techUpdates.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Tech Updates</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Active bulletins</span>
                </div>
              </div>
            </div>

            {/* Analytical Data Charts using custom high fidelity SVG charts */}
            <DashboardCharts
              incidents={incidents}
              dockets={dockets}
              feedbacks={feedbacks}
              routers={routers}
              complaints={complaints}
              waReports={waReports}
              cyberReports={cyberReports}
              mailReports={mailReports}
            />

            {/* Bento-Grid layout for bulletins and sheets sync */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="dashboard-bento-grid-container">
              {/* Left Column: Standalone bulletins feed */}
              <div className={`${session?.role === 'Admin' ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200`} id="index-updates-activity-feed">
                <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                      📢 Standalone technical update bulletins feed
                    </h3>
                    <p className="text-xs text-slate-500">Scheduled maintenance announcements, upstream outages, and zone standard updates</p>
                  </div>
                  <button
                    onClick={() => setCurrentView('TechInformationUpdate')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Manage Bulletins</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feed items */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1" id="activity-feed-items">
                  {techUpdates.length > 0 ? (
                    techUpdates.slice(0, 5).map((bulletin) => (
                      <div
                        key={bulletin.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <span className="font-bold text-slate-800 text-sm leading-tight">
                            {bulletin.heading}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] font-mono font-bold whitespace-nowrap">
                            <span className="text-slate-400">{formatDateTime(bulletin.date)}</span>
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">By {bulletin.addedBy}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {bulletin.body}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic">
                      No active infrastructure updates broadcasted
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Google Sheets Synchronization & Export Hub - Admin Only */}
              {session?.role === 'Admin' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between" id="google-sheets-integration-card">
                  <div>
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                        📊 Google Sheets Integration
                      </h3>
                      <p className="text-xs text-slate-500">Dual-direction remote cloud database mirroring</p>
                    </div>

                    <div className="space-y-4">
                      {/* Connection status display */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${
                            sheetsSyncStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' :
                            sheetsSyncStatus === 'syncing' ? 'bg-blue-50 text-blue-600' :
                            sheetsSyncStatus === 'connecting' ? 'bg-amber-50 text-amber-600' :
                            sheetsSyncStatus === 'error' ? 'bg-rose-50 text-rose-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-700 block uppercase tracking-tight">Sync Status</span>
                            <span className="text-[10px] text-slate-400 font-bold block leading-none mt-0.5">
                              {sheetsSyncStatus === 'connected' ? 'Connected & Ready' :
                               sheetsSyncStatus === 'syncing' ? 'Synchronizing files...' :
                               sheetsSyncStatus === 'connecting' ? 'Authorizing connection...' :
                               sheetsSyncStatus === 'error' ? 'Connection failed' :
                               'Disconnected'}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          sheetsSyncStatus === 'connected' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' :
                          sheetsSyncStatus === 'syncing' ? 'bg-blue-50 text-blue-600 border border-blue-200/50 animate-pulse' :
                          sheetsSyncStatus === 'connecting' ? 'bg-amber-50 text-amber-600 border border-amber-200/50 animate-pulse' :
                          sheetsSyncStatus === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200/50' :
                          'bg-slate-100 text-slate-500 border border-slate-200/50'
                        }`}>
                          {sheetsSyncStatus}
                        </span>
                      </div>

                      {/* Spreadsheet metadata */}
                      {syncSpreadsheetId && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Spreadsheet:</span>
                            <a
                              href={`https://docs.google.com/spreadsheets/d/${syncSpreadsheetId}/edit`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                            >
                              <span>Open Sheet ↗</span>
                            </a>
                          </div>
                          <p className="text-[10px] font-mono font-semibold bg-white p-1.5 rounded-lg border border-slate-200/60 overflow-x-auto text-slate-500">
                            ID: {syncSpreadsheetId.slice(0, 12)}...{syncSpreadsheetId.slice(-8)}
                          </p>
                          {lastSyncedTime && (
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1">
                              <span>LAST EXPORT/SYNC:</span>
                              <span className="text-slate-600">{lastSyncedTime}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sync error display */}
                      {syncError === 'unauthorized-domain' && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 mt-2" id="unauthorized-domain-error-info">
                          <p className="font-bold uppercase tracking-wider text-[10px] text-rose-700 flex items-center gap-1">
                            <span>🔒 Unauthorized Preview Domain</span>
                          </p>
                          <p className="text-[11px] leading-relaxed text-rose-800 font-semibold">
                            Firebase blocked sign-in because this Cloud Run preview domain is not listed in your Firebase project's Authorized Domains.
                          </p>
                          <div className="bg-white p-2.5 rounded-lg border border-rose-200/60 font-mono text-[10px] text-rose-900 break-all select-all flex justify-between items-center gap-2">
                            <span className="font-bold">{window.location.hostname}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.hostname);
                                showToast('Domain copied to clipboard!', 'success');
                              }}
                              className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-sans text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="text-[11px] text-rose-700/90 leading-relaxed font-semibold">
                            To fix this:
                            <ol className="list-decimal pl-4 mt-1 space-y-1">
                              <li>Open your <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-rose-950">Firebase Console</a></li>
                              <li>Go to <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong></li>
                              <li>Click <strong>Add domain</strong> and paste the domain copied above</li>
                            </ol>
                          </div>
                        </div>
                      )}
                      {syncError === 'operation-not-allowed' && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 mt-2" id="operation-not-allowed-error-info">
                          <p className="font-bold uppercase tracking-wider text-[10px] text-rose-700 flex items-center gap-1">
                            <span>🔑 Google Sign-In Provider Disabled</span>
                          </p>
                          <p className="text-[11px] leading-relaxed text-rose-800 font-semibold">
                            Google Sign-In authentication is not enabled as an active sign-in provider in your Firebase project.
                          </p>
                          <div className="text-[11px] text-rose-700/90 leading-relaxed font-semibold">
                            To enable it:
                            <ol className="list-decimal pl-4 mt-1 space-y-1">
                              <li>Open your <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-rose-950">Firebase Console</a></li>
                              <li>Go to <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong></li>
                              <li>Click <strong>Add new provider</strong> and select <strong>Google</strong></li>
                              <li>Toggle <strong>Enable</strong>, select your support email, and click <strong>Save</strong></li>
                            </ol>
                          </div>
                        </div>
                      )}
                      {(() => {
                        const isApiDisabledError = syncError && (
                          syncError.includes('sheets.googleapis.com') ||
                          syncError.includes('SERVICE_DISABLED') ||
                          syncError.includes('PERMISSION_DENIED') ||
                          syncError.includes('disabled') ||
                          syncError.includes('403') ||
                          syncError.includes('unauthenticated') ||
                          syncError.includes('has not been used')
                        );

                        if (isApiDisabledError) {
                          const { sheetsUrl, driveUrl, projectNumber } = getApiEnablementUrls(syncError || '');
                          return (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 mt-2" id="sheets-api-disabled-error-info">
                              <p className="font-bold uppercase tracking-wider text-[10px] text-amber-700 flex items-center gap-1">
                                <span>⚠️ Google Sheets API Disabled</span>
                              </p>
                              <p className="text-[11px] leading-relaxed text-amber-800 font-semibold">
                                The <strong>Google Sheets API</strong> is not enabled in your Google Cloud Project (Project No: <code>{projectNumber}</code>).
                              </p>
                              
                              <div className="flex flex-col gap-2 pt-1">
                                <a 
                                  href={sheetsUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="w-full text-center py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <span>🔑 Enable Google Sheets API ↗</span>
                                </a>
                                <a 
                                  href={driveUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="w-full text-center py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-amber-200"
                                >
                                  <span>📂 Enable Google Drive API ↗</span>
                                </a>
                              </div>

                              <div className="text-[11px] text-amber-700/90 leading-relaxed font-semibold bg-white/40 p-2.5 rounded-lg border border-amber-200/50">
                                <p className="font-bold text-amber-800 mb-1">Easy Setup Steps:</p>
                                <ol className="list-decimal pl-4 space-y-1">
                                  <li>Click the buttons above to open each API page in your Google Cloud console.</li>
                                  <li>Click the blue <strong>"Enable"</strong> button on both pages.</li>
                                  <li>Wait about <strong>1 minute</strong> for the enablement to propagate.</li>
                                  <li>Click the <strong>"Export & Sync Data Now"</strong> button below to retry!</li>
                                </ol>
                              </div>
                            </div>
                          );
                        }

                        if (syncError && syncError !== 'unauthorized-domain' && syncError !== 'operation-not-allowed') {
                          return (
                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed mt-2" id="sync-general-error-info">
                              <p className="font-bold text-rose-700">Sync Error:</p>
                              <p className="font-mono text-[10px] mt-1 break-all font-semibold">{syncError}</p>
                            </div>
                          );
                        }

                        return null;
                      })()}

                      {/* Main action triggers */}
                      <div className="space-y-2 pt-2">
                        {sheetsSyncStatus === 'disconnected' ? (
                          <button
                            onClick={handleGoogleSheetsLink}
                            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                            id="link-google-sheets-btn"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>{syncSpreadsheetId ? 'Re-authorize Google Sheets' : 'Link Google Sheets'}</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => syncWithGoogleSheets(googleToken || '')}
                              disabled={sheetsSyncStatus === 'syncing' || sheetsSyncStatus === 'connecting'}
                              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                              id="export-sync-sheets-btn"
                            >
                              <RefreshCw className={`w-4 h-4 ${sheetsSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                              <span>{sheetsSyncStatus === 'syncing' ? 'Syncing...' : 'Export & Sync Data Now'}</span>
                            </button>
                            <button
                              onClick={handleGoogleSheetsDisconnect}
                              className="w-full py-2 px-4 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-[11px] font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
                              id="disconnect-google-sheets-btn"
                            >
                              <span>Disconnect Google Account</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subtext info */}
                  <div className="text-[10px] text-slate-400 leading-relaxed font-semibold pt-4 lg:pt-0">
                    ⚠️ <strong>Dual Sync Rule</strong>: All local dockets, feedback calls, routers, incidents, complaints, and reports are written back from Google Sheets to show instantly in the web dashboard logs.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: NETWORK INCIDENT */}
        {/* ---------------------------------------------------- */}
        {currentView === 'NetworkIncident' && (
          <NetworkIncidentView
            incidents={incidents}
            onAdd={handleAddIncident}
            onUpdate={handleUpdateIncident}
            onDelete={handleDeleteIncident}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: FE DOCKET */}
        {/* ---------------------------------------------------- */}
        {currentView === 'FEDocket' && (
          <FEDocketView
            dockets={dockets}
            onAdd={handleAddDocket}
            onUpdate={handleUpdateDocket}
            onDelete={handleDeleteDocket}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: FEEDBACK CALL */}
        {/* ---------------------------------------------------- */}
        {currentView === 'FeedbackCall' && (
          <FeedbackCallView
            feedbacks={feedbacks}
            onAdd={handleAddFeedback}
            onUpdate={handleUpdateFeedback}
            onDelete={handleDeleteFeedback}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 5: UNLINK ROUTER */}
        {/* ---------------------------------------------------- */}
        {currentView === 'UnlinkRouter' && (
          <UnlinkRouterView
            routers={routers}
            onAdd={handleAddRouter}
            onUpdate={handleUpdateRouter}
            onDelete={handleDeleteRouter}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 6: COMPLAINT MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {currentView === 'ComplaintManagement' && (
          <ComplaintManagementView
            complaints={complaints}
            onAdd={handleAddComplaint}
            onUpdate={handleUpdateComplaint}
            onDelete={handleDeleteComplaint}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 7: MULTIPLE REPORT */}
        {/* ---------------------------------------------------- */}
        {currentView === 'MultipleReport' && (
          <MultipleReportView
            waReports={waReports}
            cyberReports={cyberReports}
            mailReports={mailReports}
            onAddWa={handleAddWaReport}
            onUpdateWa={handleUpdateWaReport}
            onDeleteWa={handleDeleteWaReport}
            onAddCyber={handleAddCyberReport}
            onUpdateCyber={handleUpdateCyberReport}
            onDeleteCyber={handleDeleteCyberReport}
            onAddMail={handleAddMailReport}
            onUpdateMail={handleUpdateMailReport}
            onDeleteMail={handleDeleteMailReport}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 8: TECH INFO UPDATE */}
        {/* ---------------------------------------------------- */}
        {currentView === 'TechInformationUpdate' && (
          <TechInformationUpdateView
            updates={techUpdates}
            onAdd={handleAddTechUpdate}
            onUpdate={handleUpdateTechUpdate}
            onDelete={handleDeleteTechUpdate}
            currentUser={session}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 9: ADMIN PORTAL */}
        {/* ---------------------------------------------------- */}
        {currentView === 'AdminPortal' && session?.role === 'Admin' && (
          <AdminPortalView
            currentUser={session}
            showToast={showToast}
            onTriggerMyPasswordChange={() => {
              setOldPassword(session?.password || '');
              setShowPasswordModal(true);
            }}
            googleToken={googleToken}
            syncSpreadsheetId={syncSpreadsheetId}
            incidents={incidents}
            dockets={dockets}
            feedbacks={feedbacks}
            routers={routers}
            complaints={complaints}
            waReports={waReports}
            cyberReports={cyberReports}
            mailReports={mailReports}
            techUpdates={techUpdates}
            onWriteAuditLog={writeAuditLog}
          />
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ---------------------------------------------------- */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-100 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            id="password-modal"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">🔐 Update Supervisor Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4 text-xs font-medium">
              <div className="flex flex-col">
                <label className="text-slate-500 mb-1">Old Password <span className="text-rose-500">*</span></label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 mb-1">New Password <span className="text-rose-500">*</span></label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 mb-1">Confirm New Password <span className="text-rose-500">*</span></label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* USER INFO MODAL */}
      {/* ---------------------------------------------------- */}
      {showUserInfoModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowUserInfoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-100 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            id="user-info-modal"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Supervisor Profile Info</span>
              </h3>
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile details */}
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={session.avatar}
                  alt="Profile"
                  className="w-20 h-20 bg-indigo-50 rounded-full border-2 border-indigo-100 p-1 mx-auto"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Session Active" />
              </div>

              <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">{session.username}</h4>
              <p className="text-xs font-semibold text-slate-400 mt-1">{session.email}</p>

              <div className="mt-6 border-t border-slate-100 pt-5 space-y-3.5 text-left text-xs">
                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Access Role</span>
                  <span className="text-slate-700 font-extrabold bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full text-[10px]">
                    {session.role || 'Standard User'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Session Status</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                    ONLINE / ACTIVE
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">System Domain</span>
                  <span className="text-slate-700 font-mono text-[11px] font-bold">nbn.operations</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUserInfoModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Dismiss Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* GLOBAL SEARCH SYSTEM MODAL */}
      {/* ---------------------------------------------------- */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 z-50 animate-fadeIn pt-10 md:pt-20"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[80vh] animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            id="global-search-modal"
          >
            {/* Search Input Area */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name, incident ID, complaint type, router IP..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="overflow-y-auto p-2 flex-1 divide-y divide-slate-100/60 max-h-[50vh]">
              {searchQuery.trim().length < 2 ? (
                <div className="py-12 text-center px-4">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System-Wide Search</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Type at least 2 characters to search across Incidents, Customer Complaints, Tech Updates, FEDockets, and Unlinked Routers.
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Matches Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    No records matched "<strong className="text-slate-600 font-bold">{searchQuery}</strong>"
                  </p>
                </div>
              ) : (
                <div className="p-1 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Matched {searchResults.length} Records
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={`${result.category}-${result.id}`}
                      onClick={() => {
                        setCurrentView(result.view);
                        setShowSearchModal(false);
                        showToast(`Jumped to ${result.category}: ${result.id}`, 'info');
                      }}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 border border-transparent transition-all text-left group cursor-pointer"
                    >
                      <div className="mt-0.5 shrink-0">
                        {result.view === 'NetworkIncident' && (
                          <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg inline-block">
                            <Radio className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {result.view === 'ComplaintManagement' && (
                          <span className="p-1.5 bg-violet-50 text-violet-600 rounded-lg inline-block">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {result.view === 'TechInformationUpdate' && (
                          <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg inline-block">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {result.view === 'FEDocket' && (
                          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg inline-block">
                            <Wrench className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {result.view === 'UnlinkRouter' && (
                          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg inline-block">
                            <Unlink className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-between">
                          <span className="text-xs font-extrabold text-slate-700 group-hover:text-indigo-950 truncate">
                            {result.title}
                          </span>
                          {result.status && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                              result.status === 'Open' || result.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : result.status === 'Resolved' || result.status === 'Closed' || result.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {result.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          {result.subtitle}
                        </p>
                        {result.meta && (
                          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">
                            Created: {result.meta}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Quick navigation enabled</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Destructive Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.title}
        message={deleteConfirmState.message}
        confirmText={deleteConfirmState.confirmText}
        onConfirm={deleteConfirmState.onConfirm}
        onClose={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Page Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-10 mt-auto" id="operational-control-footer">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs text-slate-400">
            
            {/* Column 1: Core Portal Brand */}
            <div className="space-y-3" id="footer-branding">
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Network Control Center
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Integrated real-time system monitoring, FE docketing, router configuration records, and compliance logging utilities.
              </p>
              <div className="flex flex-col gap-2" id="footer-status-badges">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>NOC CORE LINKED</span>
                </div>
                {syncSpreadsheetId ? (
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-teal-400 bg-teal-950/40 border border-teal-500/20 px-2.5 py-1 rounded-full w-fit" id="google-sheets-linked-badge">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                    <span>📊 GOOGLE SHEET ACTIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 bg-rose-950/50 border border-rose-500/40 px-2.5 py-1 rounded-full w-fit animate-pulse" id="google-sheets-unlinked-badge">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    <span>⚠️ GOOGLE SHEET UNLINKED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: User Identity */}
            <div className="space-y-2.5" id="footer-operator">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Supervisor Workspace
              </h4>
              <div className="space-y-1 text-[11px]">
                <p className="text-slate-200 font-bold truncate">
                  {session.email}
                </p>
                <p className="font-mono text-slate-400">
                  ID: {session.username}
                </p>
                <p className="font-mono text-indigo-400">
                  Role: Supervisor ({session.role})
                </p>
              </div>
            </div>

            {/* Column 3: Platform Telemetry */}
            <div className="space-y-2.5" id="footer-telemetry">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                System Standards
              </h4>
              <div className="space-y-1 text-[11px] font-mono text-slate-400">
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Protocol: HTTPS/WSS</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>State: Fully Synchronized</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>UTC Clock: 2026-07-12</span>
                </p>
              </div>
            </div>

            {/* Column 4: Help Desk Support */}
            <div className="space-y-2.5" id="footer-support">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Help Desk Escalations
              </h4>
              <div className="space-y-1 text-[11px]">
                <p className="text-slate-400 font-semibold">
                  NOC Support Desk: <span className="font-mono text-slate-200">1800-NOC-CORE</span>
                </p>
                <p className="text-slate-400 font-semibold">
                  Emergency escalation email:
                </p>
                <p className="text-indigo-400 font-mono text-[10px] hover:underline cursor-pointer hover:text-indigo-300">
                  noc-escalations@internal.net
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Legal info */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <span>
              © 2026 NetOps Info Core Management Systems. Protected by TLS 1.3 Encryption.
            </span>
            <div className="flex items-center gap-4">
              <span className="hover:text-indigo-400 cursor-pointer">Security Protocol</span>
              <span>•</span>
              <span className="hover:text-indigo-400 cursor-pointer">Operational SLA</span>
              <span>•</span>
              <span className="hover:text-indigo-400 cursor-pointer">Immutable Audit Trails</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
