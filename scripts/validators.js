export const normalizeDescription = (s) => String(s).trim().replace(/\s{2,}/g, ' ');
export const validateDescription = (desc) => /^\S(?:.*\S)?$/.test(desc);
export const validateAmount = (amount) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(amount);
export const validateDate = (d) => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d);
export const validateCategory = (c) => /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(c);
export const hasDuplicateWords = (text) => /\b(\w+)\s+\1\b/i.test(text);
export const validateRate = (rate) => /^(0|[1-9]\d*)(\.\d{1,6})?$/.test(rate) && Number(rate) > 0;