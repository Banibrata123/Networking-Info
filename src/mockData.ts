/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  NetworkIncident,
  FEDocket,
  FeedbackCall,
  UnlinkRouter,
  ComplaintManagement,
  WhatsAppReport,
  CyberCrimeReport,
  MailWhatsAppCountReport,
  TechInformationUpdate
} from './types';

export const INITIAL_NETWORK_INCIDENTS: NetworkIncident[] = [
  {
    id: 'inc-1',
    date: '2026-07-09T10:15',
    downtime: '10:15 AM',
    uptime: '11:45 AM',
    type: 'Zone',
    identifier: '',
    zoneCode: 'J01KB2655',
    pop: 'Lokenath POP-A',
    problem: 'Fiber cut by road construction team near square',
    status: 'Closed',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'inc-2',
    date: '2026-07-09T12:00',
    downtime: '12:00 PM',
    uptime: '12:40 PM',
    type: 'Switch',
    identifier: '172.16.52.15ROBSWSAATMILE',
    problem: 'Switch port flapping due to high temperatures',
    status: 'Closed',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'inc-3',
    date: '2026-07-09T15:30',
    downtime: '03:30 PM',
    uptime: 'Pending',
    type: 'OLT',
    identifier: '10.27.137.254ROBOLTKRUSHNACHANDRAPANIGRAHI-J01BB1377',
    problem: 'Main power failure at OLT site, backup battery low',
    status: 'Open',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'inc-4',
    date: '2026-07-09T16:10',
    downtime: '04:10 PM',
    uptime: 'Pending',
    type: 'Major Issue',
    problem: 'Upstream gateway latency spike affecting overall speed in South Zone',
    status: 'Open',
    addedBy: 'banibratamajumder18@gmail.com'
  },
  {
    id: 'inc-5',
    date: '2026-07-09T08:00',
    downtime: '08:00 AM',
    uptime: '09:30 AM',
    type: 'NAS',
    identifier: 'NAS HERIA-172.31.12.241',
    problem: 'Radius authentication timeout issue',
    status: 'Closed',
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_FE_DOCKETS: FEDocket[] = [
  {
    id: 'fed-1',
    date: '2026-07-09T09:00',
    userId: 'biswajitr_nbn',
    zone: 'J01KB803 - MONORANJAN CABLE-R. KAMALAKAR RAO-J01KB803',
    connectedFrom: 'KHARDAH',
    docketNo: 'TKT427330',
    request: 'Field Engineer',
    mode: 'Whatsapp',
    solvedBy: 'Field Engineer',
    assignedTo: 'Siddharth Roy',
    reason: 'ONU patch cord broken. Replaced and power optimized to -18dBm.',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'fed-2',
    date: '2026-07-09T11:15',
    userId: 'subhransu_nbn',
    zone: 'J01KB2655 - LOKENATH CABLE TV NETWORK-J01KB2655',
    connectedFrom: 'LOKENATH POP',
    docketNo: 'TKT427510',
    request: 'LBO',
    mode: 'PRI Call',
    solvedBy: 'Tech Support',
    assignedTo: 'Aditya Sen',
    reason: 'VLAN mapping mismatch resolved from server dashboard.',
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_FEEDBACK_CALLS: FeedbackCall[] = [
  {
    id: 'fbc-1',
    date: '2026-07-09T10:30',
    phoneNo: '7501516900',
    userId: 'biswajitr_nbn',
    reason: 'DISRUPTION IN INTERNET SERVICE',
    referFrom: 'Tech Support Team A',
    referTo: 'Zone NOC Engineer',
    feedbackCallTime: '10:45 AM',
    remarks: 'Customer reported complete red light on router. Fiber patch cord was loose.',
    status: 'Solved',
    dependentLog: 'SIGNAL LOSS - Red light on ONU. Fiber re-spliced at pole tap.',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'fbc-2',
    date: '2026-07-09T14:00',
    phoneNo: '9830211244',
    userId: 'rahul_nbn',
    reason: 'SPEED ISSUE',
    referFrom: 'Direct CRM Escalation',
    referTo: 'Broadband Support Level 2',
    feedbackCallTime: '02:15 PM',
    remarks: 'Customer getting 40Mbps instead of 100Mbps plan. Speed checked and configured MTU.',
    status: 'Solved',
    addedBy: 'banibratamajumder18@gmail.com'
  },
  {
    id: 'fbc-3',
    date: '2026-07-09T16:30',
    phoneNo: '8100234125',
    userId: 'biswajitr_nbn',
    reason: 'CONFIGURATION RELATED',
    referFrom: 'WhatsApp Support',
    referTo: 'Core Admin',
    feedbackCallTime: '04:45 PM',
    remarks: 'Port forwarding request for home server setup',
    status: 'Pending',
    dependentLog: 'IP Static requested. Routing table updates in progress.',
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_UNLINK_ROUTERS: UnlinkRouter[] = [
  {
    id: 'unr-1',
    date: '2026-07-09T11:00',
    userId: 'biswajitr_nbn',
    zoneCode: 'J01KB4831',
    connectionType: 'IPoE',
    macAddress: '08:63:32:63:8a:4c',
    requestBy: 'Field Engineer',
    mode: 'Whatsapp',
    issue: '10.28.34.30 Pre Auth IP',
    routerType: 'Digisol',
    supplementalLog: 'IP allocation failure. Pre-auth VLAN state reset.',
    requestByContext: 'FE - Santosh G',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'unr-2',
    date: '2026-07-09T15:00',
    userId: 'biswajitr_nbn',
    zoneCode: 'J01KB1202',
    connectionType: 'PPPoE',
    macAddress: 'fc:ec:da:02:bb:11',
    requestBy: 'USER',
    mode: 'Mobile Number',
    issue: 'Mac Bound to old router, unable to dial new router PPPoE',
    routerType: 'OVT',
    requestByContext: 'User called helpline direct',
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_COMPLAINT_MANAGEMENT: ComplaintManagement[] = [
  {
    id: 'cmp-1',
    date: '2026-07-09T09:30',
    userId: 'biswajitr_nbn',
    zone: 'J01KB2526 - ASMI CABLE & BROADBAND SERVICE-J01KB2526',
    reference: 'Docket',
    reason: 'Frequent disconnections every 10 minutes',
    referTo: 'Sub-regional Partner Head',
    resolutionFromOurEnd: 'Changed drop cable route to avoid high-voltage lines induction.',
    status: 'Solved',
    trackingNo: 'TKT559123',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'cmp-2',
    date: '2026-07-09T14:50',
    userId: 'biswajitr_nbn',
    zone: 'J01KB1055 - NEW ALIPORE NETWORKS-J01KB1055',
    reference: 'Phone No',
    reason: 'Requesting optical power attenuation check',
    referTo: 'Field Team B',
    status: 'Pending',
    addedBy: 'banibratamajumder18@gmail.com'
  }
];

export const INITIAL_WHATSAPP_REPORTS: WhatsAppReport[] = [
  {
    id: 'war-1',
    date: '2026-07-08T20:00',
    nameDay: 'Biswajit Ray (Day Shift)',
    nameOptDay: 'Prakash Das (Backup)',
    nameNight: 'Sumit Sharma (Night Shift)',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'war-2',
    date: '2026-07-09T20:00',
    nameDay: 'Pratap Bose (Day Shift)',
    nameNight: 'Animesh Roy (Night Shift)',
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_CYBER_CRIME_REPORTS: CyberCrimeReport[] = [
  {
    id: 'ccr-1',
    date: '2026-07-08T18:00',
    count: 2,
    areaDetails: 'Kolkata Sector V IP block trace requested by Local Cyber Cell',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'ccr-2',
    date: '2026-07-09T11:30',
    count: 1,
    areaDetails: 'Salt Lake North Police Station query regarding MAC 08:63:32:63:8a:4c session log',
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_MAIL_WHATSAPP_COUNT_REPORTS: MailWhatsAppCountReport[] = [
  {
    id: 'mwc-1',
    date: '2026-07-08T23:59',
    totalMail: 124,
    sentMail: 98,
    whatsAppSent: 450,
    whatsAppReceived: 390,
    netSent: 50, // Net calculation placeholder
    netReceived: 40,
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'mwc-2',
    date: '2026-07-09T23:59',
    totalMail: 156,
    sentMail: 112,
    whatsAppSent: 520,
    whatsAppReceived: 480,
    netSent: 70, // tomorrow - today
    netReceived: 90,
    addedBy: 'biswajitr_nbn'
  }
];

export const INITIAL_TECH_UPDATES: TechInformationUpdate[] = [
  {
    id: 'tu-1',
    date: '2026-07-09T08:00',
    heading: 'Upstream Route Optimization Complete',
    body: 'Our core team successfully optimized our international gateway routing tables this morning. Latency to Southeast Asian servers is now reduced by an average of 18ms. Please verify with any enterprise customers experiencing high trace routes.',
    addedBy: 'Super Admin'
  },
  {
    id: 'tu-2',
    date: '2026-07-08T17:30',
    heading: 'New Zone Codes Standard Protocol',
    body: 'All future zone entries must strictly follow the format J01KBXXXX. Ensure standard formatting to prevent automated provisioning pipeline failures. Report any legacy zone codes immediately to tech-support@nbn.net.',
    addedBy: 'biswajitr_nbn'
  },
  {
    id: 'tu-3',
    date: '2026-07-07T10:00',
    heading: 'System Maintenance Window July 12th',
    body: 'There will be a planned OLT firmware update on Sunday, July 12th between 02:00 AM and 04:00 AM. Expected downtime is under 10 minutes per POP. Notify all local operators (LBOs) beforehand.',
    addedBy: 'NOC Manager'
  }
];
