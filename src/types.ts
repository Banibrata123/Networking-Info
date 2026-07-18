/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StatusHistoryEntry {
  status: string;
  changedBy: string;
  timestamp: string;
}

export interface UserSession {
  username: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Standard';
  password?: string;
}

export interface NetworkIncident {
  id: string;
  date: string;
  downtime: string;
  uptime: string;
  type: 'Switch' | 'NAS' | 'OLT' | 'Zone' | 'Major Issue';
  identifier?: string;
  zoneCode?: string;
  pop?: string;
  problem: string;
  status: 'Open' | 'Closed';
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface FEDocket {
  id: string;
  date: string;
  userId: string;
  zone: string;
  connectedFrom: string;
  docketNo: string;
  request: 'Field Engineer' | 'Sales' | 'LBO' | 'Others';
  mode: 'Whatsapp' | 'PRI Call' | 'Mobile Number' | 'E-mail' | 'Others';
  solvedBy: 'Field Engineer' | 'Tech Support' | 'Others';
  assignedTo?: string;
  reason: string;
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface FeedbackCall {
  id: string;
  date: string;
  phoneNo: string;
  userId: string;
  reason:
    | 'DISRUPTION IN INTERNET SERVICE'
    | 'CONFIGURATION RELATED'
    | 'CONNECTION ISSUE'
    | 'OTHERS ISSUE'
    | 'SPEED ISSUE'
    | 'Request Related'
    | 'GENERAL QUERY'
    | 'VALUE ADDED SERVICE'
    | 'Zone Down'
    | 'ILL Related';
  referFrom: string;
  referTo: string;
  feedbackCallTime?: string;
  remarks?: string;
  status: 'Pending' | 'Solved';
  dependentLog?: string; // visible/required if Reason matches specific values
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface UnlinkRouter {
  id: string;
  date: string;
  userId: string;
  zoneCode: string;
  connectionType: 'IPoE' | 'PPPoE';
  macAddress: string;
  requestBy: 'Field Engineer' | 'Sales' | 'LBO' | 'USER' | 'Others';
  mode: 'Whatsapp' | 'PRI Call' | 'Mobile Number' | 'E-mail' | 'Others';
  issue: string;
  routerType: 'Digisol' | 'OVT' | 'CSY' | 'Others';
  supplementalLog?: string; // If connectionType = IPoE
  requestByContext?: string; // contextual required text input field adjacent to requestBy
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface ComplaintManagement {
  id: string;
  date: string;
  userId: string;
  zone: string;
  reference: 'Mail' | 'Docket' | 'Phone No' | 'Whatsapp' | 'Others';
  reason: string;
  referTo: string;
  resolutionFromOurEnd?: string;
  status: 'Pending' | 'Solved';
  trackingNo?: string; // If Reference = Docket or Others
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface WhatsAppReport {
  id: string;
  date: string;
  nameDay: string;
  nameOptDay?: string;
  nameNight: string;
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface CyberCrimeReport {
  id: string;
  date: string;
  count: number;
  areaDetails: string;
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface MailWhatsAppCountReport {
  id: string;
  date: string;
  totalMail: number;
  sentMail: number;
  whatsAppSent: number;
  whatsAppReceived: number;
  netSent?: number;
  netReceived?: number;
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface TechInformationUpdate {
  id: string;
  date: string;
  heading: string;
  body: string;
  addedBy: string;
  editedBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

export type DashboardView =
  | 'Dashboard'
  | 'NetworkIncident'
  | 'FEDocket'
  | 'FeedbackCall'
  | 'UnlinkRouter'
  | 'ComplaintManagement'
  | 'MultipleReport'
  | 'TechInformationUpdate'
  | 'AdminPortal';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LINK' | 'UNLINK';
  category: string;
  details: string;
  timestamp: string;
}
