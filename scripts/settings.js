import { getSettings, updateSettings } from './state.js';
import { validateAmount, validateRate, validateCategory } from './validators.js';
import { renderCategoryOptions, setFieldError } from './ui.js';
export const initSettings = (onChange) => {
    const settingsForm = document.getElementById('settingsForm');
    const categoryForm = document.getElementById('categoryForm');
    const categoryList = document.getElementById('category-list');
    const message = document.getElementById('settings-message');
    const say = (text, isError = false) => {
        message.textContent = text;
        message.className = `message ${text ? (isError ? 'error' : 'success') : ''}`;
    };
    const fillForm = () => {
        const s = getSettings();
        document.getElementById('currency-1').value = s.currencies[0].code;
        document.getElementById('rate-1').value = s.currencies[0].rate;
        document.getElementById('currency-2').value = s.currencies[1].code;
        document.getElementById('rate-2').value = s.currencies[1].rate;
        document.getElementById('cap').value = s.cap ?? '';
    };
    const removeCategory = (name) => {
        const { categories } = getSettings();
        if (categories.length <= 1) {
            say('Keep at least one category.', true);
            return;
        }
        updateSettings({ categories: categories.filter(c => c !== name) });
        renderCategories();
        say(`Removed category ${name}.`);
        onChange();
    };
    const renderCategories = () => {
        const { categories } = getSettings();
        categoryList.innerHTML = '';
        categories.forEach(name => {
            const li = document.createElement('li');
            const label = document.createElement('span');
            label.textContent = name;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-delete';
            button.textContent = 'Remove';
            button.setAttribute('aria-label', `Remove category ${name}`);
            button.addEventListener('click', () => removeCategory(name));
            li.append(label, button);
            categoryList.appendChild(li);
        });
        renderCategoryOptions(categories);
    };
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        ['currency-2', 'rate-1', 'rate-2', 'cap'].forEach(id => setFieldError(id, ''));
        say('');
        const code1 = document.getElementById('currency-1').value;
        const code2 = document.getElementById('currency-2').value;
        const rate1 = document.getElementById('rate-1').value.trim();
        const rate2 = document.getElementById('rate-2').value.trim();
        const cap = document.getElementById('cap').value.trim();
        const errors = {};
        if (code1 === code2) {
            errors['currency-2'] = 'Pick two different currencies.';
        }
        if (!validateRate(rate1)) {
            errors['rate-1'] = 'Use a number above 0, up to 6 decimals (for example 0.92).';
        }
        if (!validateRate(rate2)) {
            errors['rate-2'] = 'Use a number above 0, up to 6 decimals (for example 0.79).';
        }
        if (cap !== '' && !(validateAmount(cap) && Number(cap) > 0)) {
            errors.cap = 'Use a number above 0 like 300 or 300.50, or leave it empty for no cap.';
        }
        const badIds = Object.keys(errors);
        if (badIds.length > 0) {
            badIds.forEach(id => setFieldError(id, errors[id]));
            say(`Fix ${badIds.length} ${badIds.length === 1 ? 'field' : 'fields'} and save again.`, true);
            document.getElementById(badIds[0]).focus();
            return;
        }
        updateSettings({
            currencies: [
                { code: code1, rate: parseFloat(rate1) },
                { code: code2, rate: parseFloat(rate2) }
            ],
            cap: cap === '' ? null : parseFloat(cap)
        });
        say('Settings saved.');
        onChange();
    });
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('new-category');
        const name = input.value.trim().replace(/\s{2,}/g, ' ');
        const { categories } = getSettings();
        setFieldError('new-category', '');
        say('');
        if (!validateCategory(name)) {
            setFieldError('new-category', 'Use letters, spaces and hyphens only (for example "Fast-food").');
            input.focus();
            return;
        }
        if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {                                                                                                                                                                                                                                                                                                            
            setFieldError('new-category', 'That category already exists.');                                                                                                                                                                                                                                                                                                                     
            input.focus();
            return;
        }
        updateSettings({ categories: [...categories, name] });
        input.value = '';
        renderCategories();
        say(`Added category ${name}.`);
        onChange();
    });
    fillForm();
    renderCategories();
};
                                                                                                                                                                                                                                        
                                                                                                                                                                                                                   
                                                                                
                                                    
                        
