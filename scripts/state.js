
import {loadTransactions, saveTransactions, loadSettings, saveSettings} from './storage.js';
let transactions = loadTransactions() || [];
const nextId = () => {
    const max = transactions.reduce((highest, t) => {
        const num = parseInt(String(t.id).replace(/\D/g, ''), 10) || 0;
        return Math.max(highest, num);
    }, 0);
    return `rec_${String(max + 1).padStart(4, '0')}`;
};
export const getTransactions = () => transactions;
export const addTransaction = (data) => {
    const now = new Date().toISOString();
    transactions.push({
        id: nextId(),
        ...data,
        createdAt: now,
        updatedAt: now
    });
    saveTransactions(transactions);
    return transactions;
}
export const deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
    return transactions;
};
const DEFAULT_SETTINGS = {
    baseCurrency: 'USD',
    currencies: [
        { code: 'EUR', rate: 0.92},
        { code: 'GBP', rate: 0.79}
    ],
    categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
    cap: null
};
let settings = { ...DEFAULT_SETTINGS, ...(loadSettings() || {})};
export const getSettings = () => settings;
export const updateSettings = (changes) => {
    settings = { ...settings, ...changes };
    saveSettings(settings);
    return settings;
};
        
