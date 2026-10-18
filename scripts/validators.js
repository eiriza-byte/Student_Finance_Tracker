export const normalizeDescription = (s) => String(s).trim().replace(/\s{2,}/g, ' ');
export const validateDescription = (desc) => /^\S(?:.*\S)?$/.test(desc);
export const validateAmount = (amount) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(amount);
export const validateDate = (d) => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d);
export const validateCategory = (c) => /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(c);
export const hasDuplicateWords = (text) => /\b(\w+)\s+\1\b/i.test(text);
export const validateRate = (rate) => /^(0|[1-9]\d*)(\.\d{1,6})?$/.test(rate) && Number(rate) > 0;
export const validateImport = (data) => {
    if (!Array.isArray(data)) {
        return { ok: false, error: 'The file must contain a list of records.'};
    }
    if (data.length === 0) {
        return { ok: false, error: 'The file has no records.' };
    }
    const ids = new Set();
    const isRealDate = (d) => new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
    const isTime = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
    for (let i = 0; i < data.length; i++) {
        const r = data[i];
        const where = `Record ${i + 1}:`;
        if (typeof r !== 'object' || r === null) return { ok: false, error: `${where} not an object.`};
        if (typeof r.id !== `string` || r.id === '') return { ok: false, error: `${where} missing id.`};
        if (ids.has(r.id)) return { ok: false, error: `${where} duplicate id "${r.id}".`};
        ids.add(r.id);
        if (typeof r.description !== 'string' || !validateDescription(r.description)) {
            return { ok: false, error: `${where} invalid description.`};
        }
        if (typeof r.amount !== 'number' || !validateAmount(String(r.amount))) {
            return { ok: false, error: `${where} amount must be a number with up to 2 decimals.`};
        }
        if (typeof r.category !== 'string' || !validateCategory(r.category)) {
            return { ok: false, error: `${where} invalid category.`};
        }
        if (typeof r.date !== 'string' || !validateDate(r.date) || !isRealDate(r.date)) {
            return { ok: false, error: `${where} invalid date (use a real YYYY-MM-DD date).`};
        }
        if (!isTime(r.createdAt) || !isTime(r.updatedAt)) {
            return { ok: false, error: `${where} createdAt and updatedAt must be timestamps.`};
        }
    }
    return { ok: true};
};