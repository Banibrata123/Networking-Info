import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider setup with Sheets & Drive.file scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Listen for Auth changes and restore credentials safely in-memory
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in on load, we need to sign in again to get the accessToken
        // because Firebase onAuthStateChanged doesn't persist the raw OAuth accessToken in the user object.
        // We will require the user to explicitly log in to retrieve a fresh token.
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Sheets OAuth access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getAccessToken = () => cachedAccessToken;

// Sheet definitions & header mappings
export const SHEET_HEADERS: Record<string, string[]> = {
  "Incidents": ["id", "date", "downtime", "uptime", "type", "identifier", "zoneCode", "pop", "problem", "status", "addedBy"],
  "Dockets": ["id", "date", "userId", "zone", "connectedFrom", "docketNo", "request", "mode", "solvedBy", "assignedTo", "reason", "addedBy"],
  "Feedbacks": ["id", "date", "phoneNo", "userId", "reason", "referFrom", "referTo", "feedbackCallTime", "remarks", "status", "dependentLog", "addedBy"],
  "Routers": ["id", "date", "userId", "zoneCode", "connectionType", "macAddress", "requestBy", "mode", "issue", "routerType", "supplementalLog", "requestByContext", "addedBy"],
  "Complaints": ["id", "date", "userId", "zone", "reference", "reason", "referTo", "resolutionFromOurEnd", "status", "trackingNo", "addedBy"],
  "WhatsAppReports": ["id", "date", "nameDay", "nameOptDay", "nameNight", "addedBy"],
  "CyberReports": ["id", "date", "count", "areaDetails", "addedBy"],
  "MailReports": ["id", "date", "totalMail", "sentMail", "whatsAppSent", "whatsAppReceived", "netSent", "netReceived", "addedBy"],
  "TechUpdates": ["id", "date", "heading", "body", "addedBy"],
  "UserLogs": ["id", "email", "username", "date", "firstLogin", "lastLogout"]
};

const SPREADSHEET_NAME = "Network Control Center Dashboard Data";

/**
 * Searches for a spreadsheet named "Network Control Center Dashboard Data".
 * If not found, creates one with the required tabs.
 */
export const findOrCreateSpreadsheet = async (token: string): Promise<string> => {
  // 1. Search for existing file with a clean, fully encoded query
  const query = `name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  
  try {
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    } else {
      const errText = await searchRes.text();
      console.warn('Google Drive search failed, falling back to direct creation. Details:', errText);
    }
  } catch (driveErr) {
    console.warn('Google Drive search failed due to exception, falling back to direct creation:', driveErr);
  }

  // 2. Create a new Spreadsheet with all required tabs/sheets
  const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME
      },
      sheets: Object.keys(SHEET_HEADERS).map(title => ({
        properties: { title }
      }))
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Failed to create synchronized Google Spreadsheet:', errText);
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;

  // Initialize all sheet headers
  for (const sheetName of Object.keys(SHEET_HEADERS)) {
    try {
      await writeHeaders(spreadsheetId, sheetName, SHEET_HEADERS[sheetName], token);
    } catch (headerErr) {
      console.error(`Failed to write headers for sheet ${sheetName}:`, headerErr);
    }
  }

  return spreadsheetId;
};

/**
 * Writes the headers at the top (row 1) of the sheet.
 */
const writeHeaders = async (spreadsheetId: string, sheetName: string, headers: string[], token: string) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:1?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range: `${sheetName}!A1:1`,
      majorDimension: "ROWS",
      values: [headers]
    })
  });
};

/**
 * Ensures a sheet tab exists in an existing spreadsheet and has the correct headers.
 */
export const ensureSheetExistsAndHasHeaders = async (spreadsheetId: string, sheetName: string, headers: string[], token: string) => {
  // Check if sheet exists
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(title)`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!metaRes.ok) return;
  const metaData = await metaRes.json();
  const existingSheets = metaData.sheets?.map((s: any) => s.properties.title) || [];

  if (!existingSheets.includes(sheetName)) {
    // Add missing sheet
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: { title: sheetName }
            }
          }
        ]
      })
    });
    // Write headers
    await writeHeaders(spreadsheetId, sheetName, headers, token);
  }
};

/**
 * Appends a row of data to the Google Sheet.
 */
export const appendRowToSheet = async (
  spreadsheetId: string,
  sheetName: string,
  rowData: any,
  token: string
) => {
  await ensureSheetExistsAndHasHeaders(spreadsheetId, sheetName, SHEET_HEADERS[sheetName], token);
  
  const headers = SHEET_HEADERS[sheetName];
  const rowValues = headers.map(header => {
    const val = rowData[header];
    return val === undefined || val === null ? "" : val;
  });

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(appendUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range: `${sheetName}!A1`,
      majorDimension: "ROWS",
      values: [rowValues]
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to save record to Google Sheets (${sheetName}).`);
  }
};

/**
 * Fetches all records from a given sheet and transforms them into JSON objects.
 */
export const fetchSheetData = async <T>(
  spreadsheetId: string,
  sheetName: string,
  token: string
): Promise<T[]> => {
  await ensureSheetExistsAndHasHeaders(spreadsheetId, sheetName, SHEET_HEADERS[sheetName], token);

  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch records from Google Sheet: ${sheetName}`);
  }

  const data = await res.json();
  const values: string[][] = data.values;
  if (!values || values.length <= 1) {
    return [];
  }

  const headers = values[0];
  const rows = values.slice(1);

  return rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val === undefined || val === null) {
        val = "";
      }
      
      // Typecasting for specific numerical reports to maintain pristine schema consistency
      if (
        header === "count" ||
        header === "totalMail" ||
        header === "sentMail" ||
        header === "whatsAppSent" ||
        header === "whatsAppReceived" ||
        header === "netSent" ||
        header === "netReceived"
      ) {
        obj[header] = Number(val) || 0;
      } else {
        obj[header] = val;
      }
    });
    return obj as T;
  });
};

/**
 * Updates an existing row of data in Google Sheets by matching the item's unique "id".
 */
export const updateRowInSheet = async (
  spreadsheetId: string,
  sheetName: string,
  itemId: string,
  updatedData: any,
  token: string
) => {
  try {
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?valueRenderOption=FORMATTED_VALUE`;
    const res = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const data = await res.json();
    const values: string[][] = data.values;
    if (!values || values.length <= 1) return;

    const headers = values[0];
    const idIndex = headers.indexOf("id");
    if (idIndex === -1) return;

    // Find 1-indexed row number
    const rowIndex = values.findIndex((row, idx) => idx > 0 && row[idIndex] === itemId);
    if (rowIndex === -1) return; // Not found in Sheets

    const existingRow = values[rowIndex];
    
    // Convert existing row to object to merge easily
    const existingObj: any = {};
    headers.forEach((header, idx) => {
      existingObj[header] = existingRow[idx] !== undefined ? existingRow[idx] : "";
    });

    // Merge old values with updated values
    const mergedObj = { ...existingObj, ...updatedData };

    // Format back to array
    const newRowValues = headers.map(header => {
      const val = mergedObj[header];
      return val === undefined || val === null ? "" : val;
    });

    const rowNum = rowIndex + 1;
    // Get column letter for range (A to Z)
    const lastColLetter = String.fromCharCode(65 + Math.min(headers.length - 1, 25));
    const updateRange = `${sheetName}!A${rowNum}:${lastColLetter}${rowNum}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`;

    await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        range: updateRange,
        majorDimension: "ROWS",
        values: [newRowValues]
      })
    });
  } catch (error) {
    console.error(`Error updating row in Google Sheets (${sheetName}):`, error);
  }
};

/**
 * Deletes a row of data from Google Sheets by matching the item's unique "id".
 */
export const deleteRowFromSheet = async (
  spreadsheetId: string,
  sheetName: string,
  itemId: string,
  token: string
) => {
  try {
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?valueRenderOption=FORMATTED_VALUE`;
    const res = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const data = await res.json();
    const values: string[][] = data.values;
    if (!values || values.length <= 1) return;

    const headers = values[0];
    const idIndex = headers.indexOf("id");
    if (idIndex === -1) return;

    // Find row index (0-indexed in values, where index 0 is headers)
    const rowIndex = values.findIndex((row, idx) => idx > 0 && row[idIndex] === itemId);
    if (rowIndex === -1) return; // Not found in Sheets

    // Get the sheetId from spreadsheet metadata to target deleteDimension
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(title,sheetId)`;
    const metaRes = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!metaRes.ok) return;
    const metaData = await metaRes.json();
    const sheetObj = metaData.sheets?.find((s: any) => s.properties.title === sheetName);
    if (!sheetObj) return;
    const sheetId = sheetObj.properties.sheetId;

    const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    await fetch(deleteUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }
        ]
      })
    });
    console.log(`Successfully deleted row ${itemId} from Google Sheet (${sheetName})`);
  } catch (error) {
    console.error(`Error deleting row from Google Sheets (${sheetName}):`, error);
  }
};


