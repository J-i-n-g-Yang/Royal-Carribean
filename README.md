# 🚢 Royal Caribbean Casino Royale — Instant Cruise Certificate PDF Generator

A lightweight React app that generates direct PDF links for Royal Caribbean Casino Royale Instant Cruise Certificates for China (CHN) and Singapore (S) routes.

---

## ✨ Features

- **Link Generator** — Select a year and month to instantly generate all PDF links for CHN (CHN01–CHN07) and Singapore (S01–S08) routes
- **Offer Code Lookup** — Look up any specific offer code (e.g. `2601CHN03`) to get its direct PDF URL
- **Copy Links** — Copy individual links, by group (CHN or S), or all links at once
- **Open PDFs** — Open any PDF directly in a new browser tab
- **Dark Mode** — Toggle between light and dark themes

---

## 🔗 PDF URL Format

Links are generated in the following format:

```
https://www.royalcaribbean.com/content/dam/royal/resources/pdf/casino/offers/YYMM[TYPE][CODE].pdf
```

| Segment | Description |
|--------|-------------|
| `YY` | 2-digit year (e.g. `26` for 2026) |
| `MM` | 2-digit month (e.g. `01` for January) |
| `TYPE` | `CHN` for China, `S` for Singapore |
| `CODE` | `01`–`07` for CHN, `01`–`08` for S |

**Examples:**
- `2601CHN03.pdf` → China, January 2026, code 03
- `2601S05.pdf` → Singapore, January 2026, code 05

---

## 🚀 Getting Started

### Prerequisites
- Node.js v19+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/rcl-pdf-generator.git
cd rcl-pdf-generator

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

---

## 🛠 Tech Stack

- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — Build tool
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [lucide-react](https://lucide.dev) — Icons

---

## ⚠️ Notes

- PDF availability depends on Royal Caribbean's servers — not all codes may exist for every month
- Direct downloads are not supported due to browser CORS restrictions; PDFs open in a new tab instead
- For bulk downloads, use the included [Node.js download script](./download.js)

---

## 📥 Bulk Download Script

A Node.js script is included to download all PDFs for a given month directly to your machine:

```bash
node download.js
```

Edit the `YEAR` and `MONTH` variables at the top of `download.js` before running.

---

## 📄 License

MIT — free to use and modify.
