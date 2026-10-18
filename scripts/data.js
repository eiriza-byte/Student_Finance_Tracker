import { getTransactions, replaceTransactions} from './state.js';
import { validateImport} from './validators.js';
export const initData = (onChange) => {
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-file');
    const message = document.getElementById('data-message');
    const say = (text, isError = false) => {
        message.textContent = text;
        message.className = `message ${text ? (isError ? 'error' : 'success') : ''}`;
    };
    exportBtn.addEventListener('click', () => {
        const records = getTransactions();
        const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance-tracker-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        say(`Exported ${records.length} records.`);
    });
    importInput.addEventListener('change', async () => {
        const file = importInput.files[0];
        if (!file) return;
        say('');
        try {
            let data;
            try {
                data = JSON.parse(await file.text());
            } catch (e) {
                say(`Import failed. Could not read "${file.name}" as JSON (${e.message}).`, true);
                return;
            } 
            const result = validateImport(data);
            if (!result.ok) {
                say(`Import failed. ${result.error}`, true);
                return;
            }
            const current = getTransactions().length;
            if (!confirm(`Replace your ${current} records with the ${data.length} in this file?`)) {
                say('Import cancelled.');
                return;
            }
            replaceTransactions(data);
            say(`Imported ${data.length} records.`);
            onChange();
        } finally {
            importInput.value = '';
        }
    });
};