
const STORAGE_KEY = "tracker_transactions";
export const loadTransactions = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
    }
};
export const saveTransactions = (transactions) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
        console.error("Error writing to localStorage:", error);
    }
};
const SETTINGS_KEY = "tracker_settings";
export const loadSettings = () => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error reading settings:", error);
        return null;
    }
};
export const saveSettings = (settings) => {
    try{
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error writing settings:", error);
    }
};

        
