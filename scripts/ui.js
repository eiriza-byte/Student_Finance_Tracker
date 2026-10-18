import { escapeHtml, highlight} from './search.js';
const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});
export const formatMoney = (amount) => money.format(Number(amount));
export const renderTransactionTable = (transactions, onDelete, regex = null, edit = null) => {
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
        if (edit && edit.editingId === t.id) {
            body.appendChild(renderEditRow(t, edit));
            return;
        }
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Date">${highlight(t.date, regex)}</td>
            <td data-label="Description">${highlight(t.description, regex)}</td>
            <td data-label="Category"><span class="chip">${highlight(t.category, regex)}</span></td>
            <td data-label="Amount" class="num">${highlight(formatMoney(t.amount), regex)}</td>
            <td class="actions">
                <button type="button" class="btn-edit" data-id="${escapeHtml(t.id)}" aria-label="Edit ${escapeHtml(t.description)}"> 
                   <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
                </button>
                <button type="button" class="btn-delete" aria-label="Delete ${escapeHtml(t.description)}">
                   <i class="fa-regular fa-trash-can" aria-hidden="true"></i> Delete
                </button>
            </td>`;
        tr.querySelector(".btn-delete").addEventListener("click", () => {
            if(confirm(`Delete "${t.description}"?`)) {
                onDelete(t.id);
            }
        });
        tr.querySelector(".btn-edit").addEventListener("click", () => {
            if (edit) edit.onEdit(t.id);
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
const renderEditRow = (t, edit) => {
    const tr = document.createElement("tr");
    tr.className = "editing";
    const options = edit.categories.includes(t.category)
       ? edit.categories
       : [...edit.categories, t.category];
    tr.innerHTML = `
       <td data-label="Date">
          <label class="sr-only" for="edit-date">Date</label>
          <input type="date" id="edit-date" value="${escapeHtml(t.date)}">
        </td>
        <td data-label="Description">
           <label class="sr-only" for="edit-description">Description</label>
           <input type="text" id="edit-description" autocomplete="off" value="${escapeHtml(t.description)}">
        </td>
        <td data-label="Category">
           <label class="sr-only" for="edit-category">Category</label>
           <select id="edit-category">
              ${options.map(c => `<option${c === t.category ? " selected" : ""}>${escapeHtml(c)}</option>`).join("")}
            </select>
        </td>
        <td data-label="Amount" class="num">
           <label class="sr-only" for="edit-amount">Amount</label>
           <input type="text" id="edit-amount" inputmode="decimal" value="${escapeHtml(t.amount)}">
        </td>
        <td class="actions">
           <button type="button" class="btn-save">Save</button>
           <button type="button" class="btn-cancel">Cancel</button>
           <p class="edit-error" role="alert"></p>
        </td>`;
    const field = (name) => tr.querySelector(`#edit-${name}`);
    const errorBox = tr.querySelector(".edit-error");
    const save = () => {
        ["description", "amount", "category", "date"].forEach(n => field(n).setAttribute("aria-invalid", "false"));
        errorBox.textContent = "";
        const errors = edit.onSave(t.id, {
            description: field("description").value,
            amount: field("amount").value,
            category: field("category").value,
            date: field("date").value
        });
        if (errors) {
            const names = Object.keys(errors);
            names.forEach(n => field(n).setAttribute("aria-invalid", "true"));
            errorBox.textContent = Object.values(errors).join(" ");
            field(names[0]).focus();
        }
    };
    tr.querySelector(".btn-save").addEventListener("click", save);
    tr.querySelector(".btn-cancel").addEventListener("click", () => edit.onCancel());
    tr.addEventListener("keydown", (e) => {
        if (e.key === "Escape") edit.onCancel();
        if (e.key === "Enter" && e.target.tagName === "INPUT") {
            e.preventDefault();
            save();
        }
    });
    return tr;

    
};
let lastCapMessage = '';
export const renderCap = ({state, amount, percent}) => {
    const box = document.getElementById("cap-box");
    const text = document.getElementById("cap-text");
    const fill = document.getElementById("cap-fill");
    const polite = document.getElementById("cap-live-polite");
    const assertive = document.getElementById("cap-live-assertive");
    if (!box) return;
    let message;
    if (state === 'over') messsage = `Over your cap by ${formatMoney(amount)}.`;
    else if (state === 'under') message = `${formatMoney(amount)} left under your cap.`;
    else message = "No cap set. Add one in Settings.";
    text.textContent = message;
    box.dataset.state = state;
    fill.style.width = `${percent}%`;
    if (message !== lastCapMessage) {
        lastCapMessage = message;
        polite.textContent = '';
        assertive.textCintent = '';
        if (state === 'over') assertive.textContent = message;
        else if (state === 'under') polite.textContent = message;
    }
};
export const renderTrend = (days) => {
    const list = document.getElementById("trend");
    if (!list) return;
    const max = Math.max(...days.map(d => d.total), 0);
    list.innerHTML = "";
    days.forEach(day => {
        const li = document.createElement("li");
        const percent = max > 0 ? Math.round((day.total / max) * 100) : 0;
        const label = new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', {weekday: 'short'});
        li.innerHTML = `
           <span class="trend-amount" aria-hidden="true">$${Math.round(day.total)}</span>
           <span class="sr-only">${label}: ${formatMoney(day.total)}</span>
           <span class="trend-col"><span class="trend-bar" style="height:${percent}%"></span></span>
           <span class="trend-day" aria-hidden="true">${label}</span>`;
        list.appendChild(li);
    });
};                                                                                                                                               
                                
                            
