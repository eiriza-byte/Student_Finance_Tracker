export const escapeHtml = (str) => {
    return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
};
export const compileRegex = (input, flags = 'i') => {
    if (!input) return { regex: null, error: null };
    try {
        return { regex: new RegExp(input, flags), error: null};
    } catch (e) {
        return { regex: null, error: e.message};
    }
};
export const highlight = (text, regex) => {
    const str = String(text);
    if (!regex) return escapeHtml(str);
    const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
    const globalRegex = new RegExp(regex.source, flags);
    let result = '';
    let lastIndex = 0;
    for (const match of str.matchAll(globalRegex)) {
        if (match[0] === '') continue;
        result += escapeHtml(str.slice(lastIndex, match.index));
        result += `<mark>${escapeHtml(match[0])}</mark>`;
        lastIndex = match.index + match[0].length;
    }
    return result + escapeHtml(str.slice(lastIndex));
};
export const matchesRecord = (t, regex, formatAmount) => {
    const fields = [t.description, t.category, t.date, formatAmount(t.amount)];
    return fields.some(field => regex.test(field));
};
const sorters = {
    'date-desc' : (a, b) => b.date.localeCompare(a.date),
    'date-desc' : (a, b) => a.date.localeCompare(b.date),
    'desc-asc' : (a, b) => a.description.localeCompare(b.description, undefined, { sensitivity: 'base '}),
    'desc-desc' : (a, b) => b.description.localeCompare(a.description, undefined, { sensitivity: 'base'}),
    'amount-asc' : (a, b) => Number(a.amount) - Number(b.amount),
    'amount-desc' : (a, b) => Number(b.amount) - Number(a.amount)
};
export const sortTransactions = (list, key) => {
    return [...list].sort(sorters[key] || sorters['date-desc']);
}