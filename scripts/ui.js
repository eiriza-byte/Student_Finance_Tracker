import { escapeHtml, highlight} from './search.js';
const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});
export const formatMoney = (amount) => money.format(Number(amount));
export const renderTransactionTable = (transactions, onDelete, regex = null) => {
    const body = document.getElementById("expenseList");
    if (!body) return;
    body.innerHTML = "";
    if (transactions.length === 0) {
        const message = regex 
           ? "No records match this pattern."
           : "No expenses yet. Add your first one from the Add tab.";
        body.innerHTML = `
          <tr class="empty">
             <td colspan="5">${message}</td>
          </tr>`;
        return;
    }
    transactions.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Date">${highlight(t.date, regex)}</td>
            <td data-label="Description">${highlight(t.description, regex)}</td>
            <td data-label="Category"><span class="chip">${highlight(t.category, regex)}</span></td>
            <td data-label="Amount" class="num">${highlight(formatMoney(t.amount), regex)}</td>
            <td class="actions">
                <button type="button" class="btn-delete" aria-label="Delete ${escapeHtml(t.description)}"> 
                   <i class="fa-regular fa-trash-can" aria-hidden="true"></i> Delete
                </button>
            </td>`;
        tr.querySelector(".btn-delete").addEventListener("click", () => {
            if(confirm(`Delete "${t.description}"?`)) {
                onDelete(t.id);
            }
        });
        body.appendChild(tr);
    });
};
export const renderStats = (transactions) => {
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const byCategory = {};
    transactions.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });
    const top = Object.entries(byCategory).sort((a,b) => b[1] -a[1])[0];
    document.getElementById("total-spent").textContent = money.format(total);
    document.getElementById("stat-count").textContent = transactions.length;
    document.getElementById("stat-top").textContent = top ? top[0] : "None yet";
};
export const showFormMessage = (message, isError = true) => {
    const el = document.getElementById("form-message"); 
    if (!el) return;
    el.textContent = message;
    el.className = `message ${message ? (isError ? "error" : "success") : ""}`;
};
export const showSearchStatus = (message, isError = false) => {
    const el = document.getElementById("search-status");
    if (!el) return;
    el.textContent = message;
    el.className = `message ${message ? (isError ? "error" : "success") : ""}`;
};
export const setFieldError = (id, message) => {
    const input = document.getElementById(id);
    const err = document.getElementById(`${id}-err`);
    if (err) err.textContent = message;
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
};
export const showTab = (name) => {
    document.querySelectorAll(".tab-content").forEach(section => {
        section.classList.toggle("active", section.id === name);
    });
    document.querySelectorAll(".nav-link").forEach(link => {
        const isActive = link.dataset.tab === name;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};
export const initTabs = () => {
    const isTab = (name) => document.getElementById(name)?.classList.contains("tab-content");
    const initial = location.hash.slice(1);
    showTab(isTab(initial) ? initial : "dashboard");
    window.addEventListener("hashchange", () => {
      const name = location.hash.slice(1);
      if (isTab(name)) showTab(name);
    });
};
export const renderCategoryOptions = (categories) => {
    const select = document.getElementById("category");
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="" disabled selected>Choose a category</option>';
    categories.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
    if (categories.includes(current)) select.value = current;
};
export const renderConverted = (total, currencies) => {
    const container = document.getElementById("converted-totals");
    if (!container) return;
    container.innerHTML = "";
    currencies.forEach(({ code, rate}) => {
        let text;
        try{
            text = new Intl.NumberFormat('en-US', { style: 'currency', currency: code})
                  .format(total * Number(rate));
        } catch {
            text = `${(total * Number(rate)).toFixed(2)} ${code}`;
        }
        const card = document.createElement("div");
        card.className = "stat";
        const label = document.createElement("p");
        label.className = "stat-label";
        label.textContent = `Total in ${code}`;
        const value = document.createElement("p");
        value.className = "stat-value";
        value.textContent = text;
        card.append(label, value);
        container.appendChild(card);
    });
};
                                                                                                                                                
                                
                            
