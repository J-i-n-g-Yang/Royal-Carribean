document.addEventListener("DOMContentLoaded", () => {

const BASE_URL = 'https://www.royalcaribbean.com/content/dam/royal/resources/pdf/casino/offers/';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let currentLinks = [];

window.doLookup = function(){
  const raw = document.getElementById('lookupCode').value.trim().toUpperCase();
  if(!raw) return;

  const filename = raw.endsWith('.PDF') ? raw : raw+'.pdf';
  const url = BASE_URL + filename;

  document.getElementById('lookupFilename').textContent = filename;
  document.getElementById('lookupUrl').textContent = url;
  document.getElementById('lookupResult').style.display = 'block';
}

function generateLinksLocal(year, month){
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2,'0');

  const chn = [], s = [];

  for(let i=1;i<=7;i++){
    const code = `CHN0${i}`;
    const file = `${yy}${mm}${code}.pdf`;
    chn.push({label:code,url:BASE_URL+file});
  }

  const sCodes = ["SVIP2","S01","S02","S02A","S03","S03A","S04","S05","S06","S07","S08"];
  for(const code of sCodes){
    const file = `${yy}${mm}${code}.pdf`;
    s.push({label:code,url:BASE_URL+file});
  }

  return {CHN: chn, S: s};
}

window.generateLinks = async function(){
  const year = parseInt(document.getElementById('genYear').value)||2026;
  const month = parseInt(document.getElementById('genMonth').value)||1;

  let data;

  try {
    const res = await fetch(`http://localhost:5000/generate?year=${year}&month=${month}`);
    data = await res.json();
  } catch {
    data = generateLinksLocal(year, month);
  }

  currentLinks = [...data.CHN, ...data.S];

  renderLinks('chnLinks', data.CHN);
  renderLinks('sLinks', data.S);

  document.getElementById('linksCaption').textContent =
    `${currentLinks.length} links — ${MONTHS[month-1]} ${year}`;

  document.getElementById('linksResult').style.display = 'block';
}

function renderLinks(elId, links){
  const el = document.getElementById(elId);

  el.innerHTML = links.map(l => `
    <div class="link-row">
      <span>${l.label}</span>
      <div>
        <button onclick="copyUrl('${l.url}')">Copy</button>
        <button onclick="window.open('${l.url}')">Open</button>
      </div>
    </div>
  `).join('');
}

window.copyUrl = function(url){
  navigator.clipboard.writeText(url);
}

});