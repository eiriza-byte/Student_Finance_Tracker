const toKey=(d) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};
export const getLast7Days = (transactions, today = new Date()) => {
    const days = [];
    for (let i = 6; i>= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push({ date: toKey(d), total: 0 });
    }
    transactions.forEach(t => {
        const day = days.find(d => d.date === t.date);
        if (day) day.total += Number(t.amount);
    });
    return days;
};
export const getCapStatus = (total, cap) => {
    if (cap === null || cap === undefined) {
        return { state: 'none', amount: 0, percent: 0};
    }
    const diff = Math.round((cap - total) * 100) / 100;
    const percent = Math.min(100, Math.round((total/cap) * 100));
    return diff>=0
      ? {state: 'under', amount: diff, percent}
      : {state: 'over', amount: -diff, percent};
};