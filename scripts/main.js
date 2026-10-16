import {
    normalizeDescription,
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    hasDuplicateWords
} from './validators.js';
import { getTransactions, addTransaction, deleteTransaction, getSettings } from './state.js';
import { initSettings} from './settings.js';
import {compileRegex, matchesRecord, sortTransactions} from './search.js';
import {
    renderTransactionTable,
    renderStats,
    renderConverted,
    showFormMessage,
    showSearchStatus,
    formatMoney,
    setFieldError,
    initTabs
} from './ui.js';
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expenseForm');
    const FIELDS = ['description', 'amount', 'category', 'date']; 
    const dateInput = document.getElementById('date');
    const today = () => new Date().toISOString().slice(0, 10);
    const searchInput = document.getElementById('search');
    const caseCheckbox = document.getElementById('search-case');
    const sortSelect = document.getElementById('sort');
    dateInput.value = today(); 
    const updateView = () => {
        const all = getTransactions();
        const {regex, error} = compileRegex(searchInput.value, caseCheckbox.checked ? 'i' : '');
        const filtered = regex
           ? all.filter(t => matchesRecord(t, regex, formatMoney))
           : all;
        const visible = sortTransactions(filtered, sortSelect.value);
        renderTransactionTable(visible, (id) => {
            deleteTransaction(id);
            updateView();
        }, regex);
        renderStats(all);
        const total = all.reduce((sum, t) => sum + Number(t.amount), 0);
        renderConverted(total, getSettings().currencies);
        if (error) {
            showSearchStatus(`Invalid pattern: ${error}`, true);
        } else if (regex) {
            showSearchStatus(`${visible.length} of ${all.length} records match.`);
        } else {
            showSearchStatus('');
        }
    };
    searchInput.addEventListener('input', updateView);
    caseCheckbox.addEventListener('change', updateView);
    sortSelect.addEventListener('change', updateView);
    initSettings(updateView);
    initTabs(); 
    updateView();
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        FIELDS.forEach(f => setFieldError(f, ''));
        showFormMessage('');
        const data = new FormData(form);
        const description = normalizeDescription(data.get('description') || ''); 
        const amount = (data.get('amount') || '').trim();
        const category = (data.get('category') || '').trim();
        const date = (data.get('date') || '').trim();
        const errors = {};
        if (!validateDescription(description)) {
            errors.description = 'Enter a description with no leading or trailing spaces.';
        } else if (hasDuplicateWords(description)) {
            errors.description = 'Remove the repeated word (for example "coffee coffee").';
        }
        if (!validateAmount(amount)) {
            errors.amount = 'Use a number like 12 or 12.50 (up to 2 decimals, no leading zeros).';
        }
        if (!validateCategory(category)) {
            errors.category = 'Choose a category.';
        }
        if (!validateDate(date)) {
            errors.date = 'Use the format YYYY-MM-DD.';
        }
        const badFields = FIELDS.filter(f => errors[f]);
        if (badFields.length > 0) {
            badFields.forEach(f => setFieldError(f, errors[f]));
            const noun = badFields.length === 1 ? 'field' : 'fields';
            showFormMessage(`Fix ${badFields.length} ${noun} and save again.`, true);
            document.getElementById(badFields[0]).focus();
            return;
        }
        addTransaction({
            description: description,
            amount: parseFloat(amount),
            category: category,
            date: date        
        });
        form.reset();
        dateInput.value = today();
        updateView();
        showFormMessage('Expense saved.', false);
    });
});