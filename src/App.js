import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Search,
  Moon,
  Sun,
  ExternalLink,
} from 'lucide-react';

const BASE_URL =
  'https://www.royalcaribbean.com/content/dam/royal/resources/pdf/casino/offers/';

export default function App() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(1);
  const [links, setLinks] = useState([]);
  const [copied, setCopied] = useState(null);
  const [dark, setDark] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const d = (light, darkCls) => (dark ? darkCls : light);

  const generate = () => {
    const yy = String(year).slice(-2);
    const mm = String(month).padStart(2, '0');
    const generated = [];
    for (let x = 1; x <= 7; x++) {
      const f = `${yy}${mm}CHN0${x}.pdf`;
      generated.push({
        label: `CHN0${x}`,
        filename: f,
        url: BASE_URL + f,
        group: 'CHN',
      });
    }
    for (let x = 1; x <= 8; x++) {
      const f = `${yy}${mm}S0${x}.pdf`;
      generated.push({
        label: `S0${x}`,
        filename: f,
        url: BASE_URL + f,
        group: 'S',
      });
    }
    setLinks(generated);
    setCopied(null);
  };

  const openPdf = (url) => window.open(url, '_blank');

  const copyAll = () => {
    navigator.clipboard.writeText(links.map((l) => l.url).join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const copyGroup = (group) => {
    const key = 'group-' + group;
    navigator.clipboard.writeText(
      links
        .filter((l) => l.group === group)
        .map((l) => l.url)
        .join('\n')
    );
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copySingle = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLookup = () => {
    const code = lookupCode.trim().toUpperCase();
    if (!code) return;
    const filename = code.endsWith('.PDF') ? code : code + '.pdf';
    const url = BASE_URL + filename;
    setLookupResult({ filename, url });
  };

  const chnLinks = links.filter((l) => l.group === 'CHN');
  const sLinks = links.filter((l) => l.group === 'S');

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-6 ${d(
        'bg-gradient-to-br from-blue-50 to-indigo-100',
        'bg-gray-950'
      )}`}
    >
      <div
        className={`max-w-4xl mx-auto rounded-2xl shadow-xl p-8 transition-colors duration-300 ${d(
          'bg-white',
          'bg-gray-900'
        )}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText
              className={`w-8 h-8 ${d('text-blue-600', 'text-blue-400')}`}
            />
            <h1
              className={`text-xl font-bold leading-tight ${d(
                'text-gray-800',
                'text-white'
              )}`}
            >
              Royal Caribbean Casino Royale
              <br />
              <span
                className={`text-sm font-semibold ${d(
                  'text-blue-600',
                  'text-blue-400'
                )}`}
              >
                Instant Cruise Certificate PDF Generator
              </span>
            </h1>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-full transition-colors ${d(
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'bg-gray-700 hover:bg-gray-600 text-yellow-300'
            )}`}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Offer Code Lookup */}
        <div
          className={`rounded-xl p-5 mb-6 border ${d(
            'bg-blue-50 border-blue-100',
            'bg-gray-800 border-gray-700'
          )}`}
        >
          <h2
            className={`text-sm font-semibold uppercase tracking-wide mb-3 ${d(
              'text-blue-700',
              'text-blue-300'
            )}`}
          >
            <Search className="w-4 h-4 inline mr-1 mb-0.5" />
            Offer Code Lookup
          </h2>
          <p className={`text-xs mb-3 ${d('text-gray-500', 'text-gray-400')}`}>
            Enter an offer code (e.g.{' '}
            <span className="font-mono">2601CHN03</span>) to get its direct PDF
            link.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 2601CHN03 or 2601S04"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className={`flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${d(
                'bg-white border-gray-300 text-gray-800',
                'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              )}`}
            />
            <button
              onClick={handleLookup}
              disabled={!lookupCode.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-colors"
            >
              <Search className="w-4 h-4" /> Lookup
            </button>
          </div>
          {lookupResult && (
            <div
              className={`mt-3 p-3 rounded-lg flex items-center justify-between border ${d(
                'bg-white border-gray-200',
                'bg-gray-700 border-gray-600'
              )}`}
            >
              <div className="min-w-0">
                <p
                  className={`text-sm font-mono font-medium truncate ${d(
                    'text-gray-700',
                    'text-gray-200'
                  )}`}
                >
                  {lookupResult.filename}
                </p>
                <p
                  className={`text-xs mt-0.5 font-mono truncate ${d(
                    'text-gray-400',
                    'text-gray-400'
                  )}`}
                >
                  {lookupResult.url}
                </p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button
                  onClick={() => copySingle(lookupResult.url, 'lookup')}
                  className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${d(
                    'bg-gray-100 hover:bg-gray-200 text-gray-700',
                    'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  )}`}
                >
                  {copied === 'lookup' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === 'lookup' ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => openPdf(lookupResult.url)}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Open
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${d(
                'text-gray-700',
                'text-gray-300'
              )}`}
            >
              Year
            </label>
            <input
              type="number"
              min="2020"
              max="2099"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${d(
                'border-gray-300 text-gray-800',
                'bg-gray-800 border-gray-600 text-white'
              )}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${d(
                'text-gray-700',
                'text-gray-300'
              )}`}
            >
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${d(
                'border-gray-300 text-gray-800',
                'bg-gray-800 border-gray-600 text-white'
              )}`}
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <FileText className="w-5 h-5" /> Generate Links
        </button>

        {/* Results */}
        {links.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <p className={`text-sm ${d('text-gray-500', 'text-gray-400')}`}>
                {links.length} links —{' '}
                <span className="font-semibold">
                  {monthNames[month - 1]} {year}
                </span>
              </p>
              <button
                onClick={copyAll}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors ${d(
                  'bg-gray-100 hover:bg-gray-200 text-gray-700',
                  'bg-gray-700 hover:bg-gray-600 text-gray-200'
                )}`}
              >
                {copied === 'all' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied === 'all' ? 'Copied!' : 'Copy all'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'China (CHN)', data: chnLinks, group: 'CHN' },
                { title: 'Singapore (S)', data: sLinks, group: 'S' },
              ].map(({ title, data, group }) => (
                <div
                  key={group}
                  className={`border rounded-xl overflow-hidden ${d(
                    'border-gray-200',
                    'border-gray-700'
                  )}`}
                >
                  <div
                    className={`flex items-center justify-between px-4 py-2 ${d(
                      'bg-gray-50',
                      'bg-gray-800'
                    )}`}
                  >
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${d(
                        'text-gray-500',
                        'text-gray-400'
                      )}`}
                    >
                      {title}
                    </span>
                    <button
                      onClick={() => copyGroup(group)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${d(
                        'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200',
                        'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                      )}`}
                    >
                      {copied === 'group-' + group ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied === 'group-' + group ? 'Copied!' : 'Copy group'}
                    </button>
                  </div>
                  <ul
                    className={`divide-y ${d(
                      'divide-gray-100',
                      'divide-gray-700'
                    )}`}
                  >
                    {data.map((link) => (
                      <li
                        key={link.filename}
                        className={`flex items-center justify-between px-4 py-2 transition-colors ${d(
                          'hover:bg-gray-50',
                          'hover:bg-gray-800/60'
                        )}`}
                      >
                        <span
                          className={`text-sm font-mono truncate ${d(
                            'text-blue-600',
                            'text-blue-400'
                          )}`}
                        >
                          {link.filename}
                        </span>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            onClick={() => copySingle(link.url, link.filename)}
                            title="Copy URL"
                            className={`p-1 rounded transition-colors ${d(
                              'text-gray-400 hover:text-gray-700',
                              'text-gray-500 hover:text-gray-300'
                            )}`}
                          >
                            {copied === link.filename ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openPdf(link.url)}
                            title="Open PDF"
                            className={`p-1 rounded transition-colors ${d(
                              'text-gray-400 hover:text-blue-600',
                              'text-gray-500 hover:text-blue-400'
                            )}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
