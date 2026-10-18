import {
    normalizeDescription,
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    hasDuplicateWords
} from './validators.js';
import { getTransactions, addTransaction, deleteTransaction, getSettings, updateTransaction } from './state.js';
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
    initTabs,
    renderCap,
    renderTrend
} from './ui.js';
import {initData} from './data.js';
import {getLast7Days, getCapStatus} from './stats.js';
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expenseForm');
    const FIELDS = ['description', 'amount', 'category', 'date']; 
    const dateInput = document.getElementById('date');
    const today = () => new Date().toISOString().slice(0, 10);
    const searchInput = document.getElementById('search');
    const caseCheckbox = document.getElementById('search-case');
    const sortSelect = document.getElementById('sort');
    dateInput.value = today(); 
    let editingId = null;
    const focusEditButton = (id) => {
        const btn = [...document.querySelectorAll('.btn-edit')].find(b => b.dataset.id === id);
        if (btn) btn.focus();
    };
    const validateEdit = (v) => {
        const errors = {};
        if (!validateDescription(v.description)) {
            errors.description = 'Enter a description with no leading or trailing spaces.';
        } else if (hasDuplicateWords(v.description)) {
            errors.description = 'Remove the repeated word.';
        }
        if (!validateAmount(v.amount)) errors.amount = 'Amount must be like 12 or 12.50.';
        if (!validateCategory(v.category)) errors.category = 'Choose a category.';
        if (!validateDate(v.date)) errors.date = 'Use the format YYYY-MM-DD.';
        return errors;
    }
    const updateView = () => {
        const all = getTransactions();
        const {regex, error} = compileRegex(searchInput.value, caseCheckbox.checked ? 'i' : '');
        const filtered = regex
           ? all.filter(t => matchesRecord(t, regex, formatMoney))
           : all;
        const visible = sortTransactions(filtered, sortSelect.value);
        renderTransactionTable(visible, (id) => {
            if (editingId === id) editingId = null;
            deleteTransaction(id);
            updateView();
        }, regex, {
            editingId,
            categories: getSettings().categories,
            onEdit: (id) => {
                editingId = id;
                updateView();
                document.getElementById(`edit-description`)?.focus();
            },
            onCancel: () => {
                const id = editingId;
                editingId = null;
                updateView();
                focusEditButton(id);
            },
            onSave: (id, values) => {
                const clean = {
                    description: normalizeDescription(values.description),
                    amount: values.amount.trim(),
                    category: values.category.trim(),
                    date: values.date.trim()
                };
                const errors = validateEdit(clean);
                if (Object.keys(errors).length > 0) return errors;
                updateTransaction(id, {
                    description: clean.description,
                    amount: parseFloat(clean.amount),
                    category: clean.category,
                    date: clean.date
                });
                editingId = null;
                updateView();
                showSearchStatus('Record updated.');
                focusEditButton(id);
                return null;
            }
        });
        renderStats(all);
        const total = all.reduce((sum, t) => sum + Number(t.amount), 0);
        renderConverted(total, getSettings().currencies);
        renderTrend(getLast7Days(all));
        renderCap(getCapStatus(total, getSettings().cap));
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
    initData(updateView);
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