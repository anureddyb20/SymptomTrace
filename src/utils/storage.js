// Local storage keys
const KEYS = {
  SYMPTOMS: 'symptom_trace_symptoms',
  CYCLE: 'symptom_trace_cycle',
};

// Initial state helpers
const getLocalStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

/**
 * Get all logged symptoms
 */
export const getSymptoms = () => getLocalStorageItem(KEYS.SYMPTOMS, []);

/**
 * Save a new symptom log entry
 */
export const saveSymptomEntry = (entry) => {
  const current = getSymptoms();
  const newEntry = {
    id: `sym_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...current];
  setLocalStorageItem(KEYS.SYMPTOMS, updated);
  return updated;
};

/**
 * Get all logged cycle events
 */
export const getCycleData = () => getLocalStorageItem(KEYS.CYCLE, []);

/**
 * Save or update cycle events
 */
export const saveCycleData = (cycleLogs) => {
  setLocalStorageItem(KEYS.CYCLE, cycleLogs);
  return cycleLogs;
};

/**
 * Wipe all data from the browser
 */
export const clearAllLocalData = () => {
  localStorage.removeItem(KEYS.SYMPTOMS);
  localStorage.removeItem(KEYS.CYCLE);
};

/**
 * Exports all local data to a JSON string
 */
export const exportDataJSON = () => {
  const data = {
    [KEYS.SYMPTOMS]: getSymptoms(),
    [KEYS.CYCLE]: getCycleData(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
};

/**
 * Imports and validates data from a JSON object
 */
export const importDataJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    let importedSymptoms = [];
    let importedCycle = [];

    if (parsed[KEYS.SYMPTOMS] && Array.isArray(parsed[KEYS.SYMPTOMS])) {
      importedSymptoms = parsed[KEYS.SYMPTOMS];
    }
    if (parsed[KEYS.CYCLE] && Array.isArray(parsed[KEYS.CYCLE])) {
      importedCycle = parsed[KEYS.CYCLE];
    }

    if (importedSymptoms.length === 0 && importedCycle.length === 0) {
      throw new Error('Invalid file structure or empty data');
    }

    setLocalStorageItem(KEYS.SYMPTOMS, importedSymptoms);
    setLocalStorageItem(KEYS.CYCLE, importedCycle);
    return { success: true, symptomCount: importedSymptoms.length, cycleCount: importedCycle.length };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
};
