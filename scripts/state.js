
import {loadTransactions, saveTransactions, loadSettings, saveSettings} from './storage.js';
const savedTransactions = loadTransactions();
let transactions = Array.isArray(savedTransactions) ? savedTransactions : [];
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
let savedSettings = loadSettings();
const isObject = savedSettings && typeof savedSettings === 'object' && !Array.isArray(savedSettings);
let settings = { ...DEFAULT_SETTINGS, ...(isObject ? savedSettings : {}) };
if (!Array.isArray(settings.currencies) || settings.currencies.length < 2) settings.currencies = DEFAULT_SETTINGS.currencies;
if (!Array.isArray(settings.categories) || settings.categories.length === 0) settings.categories = DEFAULT_SETTINGS.categories;
export const getSettings = () => settings;
export const updateSettings = (changes) => {
    settings = { ...settings, ...changes };
    saveSettings(settings);
    return settings;
};
export const replaceTransactions = (list) => {
    transactions = list.map(({ id,description, amount, category, date, createdAt, updatedAt}) => 
      ({ id, description, amount, category, date, createdAt, updatedAt}));
    saveTransactions(transactions);
    return transactions;
};
export const updateTransaction = (id, changes) => {
    transactions = transactions.map(t =>
        t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString()}:t
    );
    saveTransactions(transactions);
    return transactions;
}
        
