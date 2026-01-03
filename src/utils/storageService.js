// Local Storage Service
// Uses localStorage for simple key-value storage and IndexedDB for structured data

const DB_NAME = 'nodeFitDB';
const DB_VERSION = 1;
const STORES = {
    USER_PROFILE: 'userProfiles',
    REPORTS: 'healthReports',
};

// ========== localStorage helpers (simple key-value) ==========

export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(`nodefit_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('LocalStorage save failed:', error);
        return false;
    }
}

export function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(`nodefit_${key}`);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('LocalStorage read failed:', error);
        return null;
    }
}

export function removeFromLocalStorage(key) {
    localStorage.removeItem(`nodefit_${key}`);
}

// ========== IndexedDB for structured data ==========

let db = null;

async function openDB() {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // User profiles store
            if (!database.objectStoreNames.contains(STORES.USER_PROFILE)) {
                const profileStore = database.createObjectStore(STORES.USER_PROFILE, { keyPath: 'id', autoIncrement: true });
                profileStore.createIndex('name', 'name', { unique: false });
                profileStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Health reports store
            if (!database.objectStoreNames.contains(STORES.REPORTS)) {
                const reportStore = database.createObjectStore(STORES.REPORTS, { keyPath: 'id', autoIncrement: true });
                reportStore.createIndex('userId', 'userId', { unique: false });
                reportStore.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };
    });
}

// ========== User Profile Operations ==========

export async function saveUserProfile(userData) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.USER_PROFILE], 'readwrite');
        const store = transaction.objectStore(STORES.USER_PROFILE);

        const profile = {
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const request = store.add(profile);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function updateUserProfile(id, userData) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.USER_PROFILE], 'readwrite');
        const store = transaction.objectStore(STORES.USER_PROFILE);

        const profile = {
            ...userData,
            id,
            updatedAt: new Date().toISOString(),
        };

        const request = store.put(profile);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getUserProfile(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.USER_PROFILE], 'readonly');
        const store = transaction.objectStore(STORES.USER_PROFILE);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllUserProfiles() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.USER_PROFILE], 'readonly');
        const store = transaction.objectStore(STORES.USER_PROFILE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getLatestUserProfile() {
    const profiles = await getAllUserProfiles();
    if (profiles.length === 0) return null;
    return profiles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
}

// ========== Health Report Operations ==========

export async function saveHealthReport(userId, reportData, userData) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.REPORTS], 'readwrite');
        const store = transaction.objectStore(STORES.REPORTS);

        const report = {
            userId,
            userData,
            report: reportData,
            createdAt: new Date().toISOString(),
        };

        const request = store.add(report);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getReportHistory(userId) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.REPORTS], 'readonly');
        const store = transaction.objectStore(STORES.REPORTS);
        const index = store.index('userId');
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllReports() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.REPORTS], 'readonly');
        const store = transaction.objectStore(STORES.REPORTS);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ========== Quick Save/Load for current session ==========

export function saveCurrentFormData(formData) {
    saveToLocalStorage('currentForm', formData);
}

export function loadCurrentFormData() {
    return getFromLocalStorage('currentForm');
}

export function clearCurrentFormData() {
    removeFromLocalStorage('currentForm');
}
