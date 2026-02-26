# 🚢 Royal Caribbean Casino Royale — Instant Cruise Certificate PDF Generator

A lightweight React app that generates direct PDF links for Royal Caribbean Casino Royale Instant Cruise Certificates for China (CHN) and Singapore (S) routes.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![React](https://img.shields.io/badge/React-18.1.0-61DAFB?logo=react)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

**Link Generator** — Select a year and month to instantly generate all PDF links for CHN (CHN01–CHN07) and Singapore (SVIP2, S01–S08, including S02A and S03A) routes

**Points Display** — Shows the exact point value for each certificate tier (ranging from 800 to 48,088 points)

**PDF Preview** — View certificates directly in the browser with full PDF parsing and page navigation

**Offer Code Lookup** — Look up any specific offer code (e.g. 2603CHN03 or 2603SVIP2) to get its direct PDF URL

**Copy Links** — Copy individual links, by group (CHN or S), or all links at once

**Open PDFs** — Open any PDF directly in a new browser tab

**Dark Mode** — Toggle between light and dark themes

## 🔗 PDF URL Format

Links are generated in the following format:

```
https://www.royalcaribbean.com/content/dam/royal/resources/pdf/casino/offers/YYMM[TYPE][CODE].pdf
```

| Segment | Description |
|---------|-------------|
| YY | 2-digit year (e.g. 26 for 2026) |
| MM | 2-digit month (e.g. 03 for March) |
| TYPE | CHN for China, S for Singapore |
| CODE | 01–07 for CHN, SVIP2/01–08 for S (including 02A, 03A) |

**Examples:**
- `2603CHN03.pdf` → China, March 2026, code 03 (16,088 points)
- `2603S05.pdf` → Singapore, March 2026, code 05 (2,000 points)
- `2603SVIP2.pdf` → Singapore, March 2026, VIP tier 2 (40,000 points)

## 📊 Certificate Types & Points

### China (CHN) — 7 Certificates
- **CHN01** — 48,088 points
- **CHN02** — 28,088 points
- **CHN03** — 16,088 points
- **CHN04** — 12,888 points
- **CHN05** — 6,488 points
- **CHN06** — 2,808 points
- **CHN07** — 2,088 points

### Singapore (S) — 11 Certificates
- **SVIP2** — 40,000 points
- **S01** — 25,000 points
- **S02** — 15,000 points
- **S02A** — 9,000 points
- **S03** — 6,500 points
- **S03A** — 4,000 points
- **S04** — 3,000 points
- **S05** — 2,000 points
- **S06** — 1,500 points
- **S07** — 1,200 points
- **S08** — 800 points

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Royal-Carribean.git
cd Royal-Carribean

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 📦 Deploy to GitHub Pages

### Quick Setup

1. **Update `package.json`** — Replace `YOUR_GITHUB_USERNAME` with your actual username:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/Royal-Carribean"
   ```

2. **Install and Deploy**:
   ```bash
   npm install
   npm run deploy
   ```

3. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: `gh-pages` branch
   - Save

4. **Visit your site** (after 2-3 minutes):
   ```
   https://YOUR_GITHUB_USERNAME.github.io/Royal-Carribean
   ```

### Updating Your Site

```bash
# Make changes, then:
git add .
git commit -m "Your update"
git push origin main
npm run deploy
```

See [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) for detailed deployment instructions and troubleshooting.

## 🛠️ Built With

- React 18.1.0
- Tailwind CSS 4.2.1
- react-pdf 7.7.0 (PDF rendering)
- pdfjs-dist 3.11.174 (PDF parsing)
- Lucide React (icons)
- gh-pages (deployment)

## 📖 Usage

### Generate Links
1. Select year and month
2. Click "Generate Links"
3. View all certificates with their point values

### Preview PDF
1. Click the 📄 icon next to any certificate
2. View the PDF in-app with page navigation
3. Click "Open Full PDF" to view in a new tab

### Lookup Offer Code
1. Enter code (e.g., `2603CHN03`)
2. Click "Lookup" or press Enter
3. Preview or copy the direct link

### Copy Links
- **Single**: Click 📋 icon
- **Group**: Click "Copy group" button
- **All**: Click "Copy all" at the top

## 🔄 Recent Updates (v2.0)

### Added ✅
- Missing Singapore codes: SVIP2, S02A, S03A (now 11 total)
- Complete points reference for all 18 certificate types
- In-app PDF preview with react-pdf
- Multi-page PDF navigation
- Points display under each certificate
- GitHub Pages deployment setup
- Loading states and error handling

### Fixed 🐛
- Singapore certificate count (was 8, now 11)
- PDF embedding CORS issues
- Preview modal responsiveness

## 🤝 Contributing

Contributions welcome! Fork the repo, create a feature branch, and submit a PR.

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Royal Caribbean International
- React & Tailwind CSS teams
- Mozilla PDF.js team
- Lucide icons

## 📧 Support

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment options
- Open an issue for bugs or questions
- Review existing issues for solutions

---

**Made with ❤️ for Royal Caribbean Casino Royale members**

Last Updated: February 2026
