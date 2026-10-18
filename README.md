# Student Finance Tracker
A responsive, accessible expense tracker for students, built with vanilla HTML, CSS and JavaScript (no frameworks).
**Theme:** Student Finance Tracker
**Live site:** https://eiriza-byte.github.io/Student_Finance_Tracker/
**Demo video (unlisted):** https://www.youtube.com/watch?v=9X5wYP8E9vU
**Contact:** [GitHub](https://github.com/eiriza-byte) | e.iriza@alustudent.com
## Features
- **Dashboard:** total spent, number of transactions, top category, totals in two other currencies, a spending cap with remaining or overage, and a last-7-days bar chart.
- **Records:** table on desktop, cards on mobile, with sorting (date, description, amount, both directions).
- **Regex search:** live search with an "Ignore case" toggle, safe pattern compiling (a bad pattern shows an error instead of crashing) and `<mark>` highlighting of matches.
- **Add and edit:** form with inline error messages, plus inline editing of any record. Edits update `updatedAt`.
- **Delete** with a confirmation prompt.
- **Settings:** base currency (USD) plus two others with manual exchange rates, editable categories and a spending cap.
- **Persistence:** records and settings are saved to `localStorage` automatically.
- **Import and export:** export records as JSON. Import validates the structure and every field before replacing your data.
- **Accessibility:** skip link, semantic landmarks, visible focus, live regions and keyboard-only support (details below).
## Data model
```json
{
    "id": "rec_0001",
    "description": "Lunch at cafeteria",
    "amount": 12.5,
    "category": "Food",
    "date": "2025-09-29",
    "createdAt": "2025-09-29T10:00:00.000Z",
    "updatedAt": "2025-09-29T10:00:00.000Z"
}
```
IDs are generated from the highest existing number, so deleting a record never causes a duplicate ID. Settings are stored separately under their own key (currencies and rates, categories, cap).
## Regex catalog
| Where | Pattern | Purpose | Matches | Rejects |
|---|---|---|---|---|
| Description | `^\S(?:.*\S)?$` | No leading or trailing spaces | `Lunch at cafeteria` | ` Lunch` |
| Description (cleanup) | `\s{2,}` replaced by one space | Collapse double spaces | `Bus   pass` becomes `Bus pass` | |
| Amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | Number, up to 2 decimals, no leading zeros | `12`, `12.50`, `0` | `007`, `1.234`, `12.5a` |
| Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | YYYY-MM-DD | `2025-09-29` | `29-09-2025`, `2025-13-01` |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Letters, spaces, hyphens | `Fast-food` | `Food2` |
| **Advanced:** duplicate words | `\b(\w+)\s+\1\b` (case-insensitive) | Back-reference catches repeated words | `Coffee coffee` | `Morning coffee` |
| Exchange rate | `^(0\|[1-9]\d*)(\.\d{1,6})?$` and above 0 | Rate, up to 6 decimals | `0.92` | `0`, `0.1234567` |

Import also checks that dates are real (so `2025-02-30` is rejected), that IDs are unique, that amounts are numbers, and that timestamps parse.
**Example search patterns to try in Records:**

- `\.\d{2}\b` finds amounts with cents
- `(coffee|tea)` finds drinks
- `\b(\w+)\s+\1\b` finds repeated words
- `(` is an invalid pattern, which shows an error message and keeps your list
## Keyboard map
| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move forward and backward through links, fields and buttons |
| `Tab` (first press on any page) | Reveals the "Skip to content" link |
| `Enter` on a skip or navigation link | Jump to main content or switch tab |
| `Enter` in an edit-row text field | Save the edit |
| `Esc` in an edit row | Cancel the edit |
| `Enter` / `Space` on a button | Press it (Save, Edit, Delete, Export, and so on) |
| `Arrow keys` in a dropdown | Change the selected option |
After saving or cancelling an edit, focus returns to that row's Edit button.
## Accessibility notes
- **Landmarks and headings:** `header`, `nav`, `main`, `section` and `footer`, with each section labelled by its heading.
- **Skip link** to the main content, and visible `:focus-visible` outlines on every control.
- **Labels:** every input has a bound `<label>`. Hidden labels are used in edit rows.
- **Errors:** inline messages are linked with `aria-describedby`, invalid fields get `aria-invalid`, and focus moves to the first problem.
- **Live regions:** form, settings, search and import messages use `role="status"`. The spending cap announces politely when you are under it and assertively when you go over.
- **Navigation:** the active tab is marked with `aria-current="page"`.
- **Highlighting:** matches use the native `<mark>` element, and text is escaped before highlighting.
- **Contrast:** form borders and text were chosen to meet WCAG contrast ratios.
- **Motion:** the bar-growth animation and transitions are switched off under `prefers-reduced-motion`.
- **Responsive:** mobile-first, with layout changes at 768px and 1024px, checked at about 360px.
## Accessibility plan
1. Use semantic HTML first, and ARIA only where HTML can't express it.
2. Make every feature keyboard-operable, with visible focus.
3. Announce changes (saves, errors, cap status) in live regions.
4. Never rely on colour alone: the cap message is also text.
5. Test with the keyboard only and with a screen reader before submitting.
## Running the tests
Serve the project folder and open `tests.html`, for example with the VS Code **Live Server** extension (`http://127.0.0.1:5500/tests.html`). Each test shows PASSED or FAILED. They cover the validators, search and sort helpers, the cap and 7-day trend, and import validation.
ES modules do not load from `file://` URLs, so opening the files by double-clicking will not work.
## Running the app
1. Clone the repo.
2. Serve the folder with a local server (for example, VS Code Live Server).
3. Open `index.html`. To load sample data, go to **Settings**, then **Import**, and choose `seed.json`.
## Project structure
```
index.html
tests.html
seed.json
assets/            logo
styles/style.css
scripts/
main.js          wires everything together
state.js         records and settings state
storage.js       localStorage read and write
validators.js    regex rules and import validation
search.js        regex compiler, highlighting, sorting
stats.js         cap status and 7-day trend
settings.js      Settings tab
data.js          JSON import and export
ui.js            rendering
```
## Credits               
- Icons: [Font Awesome](https://fontawesome.com/) (free icons)
- Font: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts
- The safe regex compiler and highlight ideas started from the assignment's starter snippets and were then rewritten.
