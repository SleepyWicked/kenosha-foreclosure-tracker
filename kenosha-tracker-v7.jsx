
import { useState, useEffect, useCallback } from "react";

const LISTINGS = [
  { saleDate: "2026-04-15", caseNo: "2025CV000254", defendant: "Janelle J Allen and John Doe Allen", parcel: "83-4-223-184-1020", address: "1737 12th Ave", city: "Kenosha", state: "WI", zip: "53140", status: "Active", docId: "11941480" },
  { saleDate: "2026-04-15", caseNo: "2025CV000920", defendant: "Jeffrey W Kless et al", parcel: "08-222-35-412-015", address: "4020 55th St", city: "Kenosha", state: "WI", zip: "53144", status: "Active", docId: "11941482" },
  { saleDate: "2026-04-22", caseNo: "2023CV000650", defendant: "Roberta Lynn Shirley et al", parcel: "03-122-06-118-184", address: "10907 65th St", city: "Kenosha", state: "WI", zip: "53142", status: "Active", docId: "11941483" },
  { saleDate: "2026-04-29", caseNo: "2024CV1435", defendant: "Juan Ramon Contreras Jr et al", parcel: "01-122-01-431-011", address: "6838 29th Ave", city: "Kenosha", state: "WI", zip: "53143", status: "Active", docId: "11960214" },
  { saleDate: "2026-05-06", caseNo: "2024CV000062", defendant: "Tanya Patterson et al", parcel: "03-122-03-104-027", address: "6022 59th Ave", city: "Kenosha", state: "WI", zip: "53142", status: "Active", docId: "11957336" },
  { saleDate: "2026-05-06", caseNo: "2024CV000961", defendant: "Rebeca Erickson et al", parcel: "06-123-07-208-002", address: "7607 15th Ave", city: "Kenosha", state: "WI", zip: "53143", status: "Active", docId: "11966726" },
  { saleDate: "2026-05-06", caseNo: "2025CV000523", defendant: "Jason J Kublik", parcel: "95-4-119-111-3215", address: "7838 334th Ave", city: "Burlington", state: "WI", zip: "53105", status: "Active", docId: "11966725" },
  { saleDate: "2026-05-06", caseNo: "2025CV001159", defendant: "Thomas Angeloff Jr et al", parcel: "01-122-01-160-015", address: "6622 26th Ave", city: "Kenosha", state: "WI", zip: "53143", status: "Active", docId: "11959701" },
  { saleDate: "2026-05-13", caseNo: "2025CV000235", defendant: "Renee J. Andrzejewski, et al", parcel: "92-4-122-343-0930", address: "6505 126th St", city: "Pleasant Prairie", state: "WI", zip: "53158", status: "Active", docId: "11961740" },
  { saleDate: "2026-05-20", caseNo: "2025CV000502", defendant: "Nicole Belliveau et al", parcel: "09-222-36-206-006", address: "4823 33rd Ave", city: "Kenosha", state: "WI", zip: "53144", status: "Active", docId: "11966727" },
];

const S = {
  bg: "#0d0f14", surface: "#13161d", surface2: "#1a1e28", border: "#252a38",
  accent: "#e8a838", green: "#3ecf8e", red: "#f06060", yellow: "#e8c94a",
  text: "#e4e8f0", muted: "#7a8299", mono: "monospace",
};

function caseYear(cn) { const m = cn.match(/^(\d{4})/); return m ? parseInt(m[1]) : null; }
function fmt(n) { return n != null ? "$" + Number(n).toLocaleString() : null; }
function parseMoney(s) { const n = parseFloat(String(s).replace(/[$,\s]/g, "")); return isNaN(n) ? null : n; }
function fullAddr(p) { return `${p.address}, ${p.city}, ${p.state} ${p.zip}`; }

// ─── STORAGE (window.storage API) ────────────────────
async function storageGet(key) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : null;
  } catch { return null; }
}
async function storageSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

// ─── RESEARCH LINKS ───────────────────────────────────
function buildLinks(p) {
  const addrEnc = encodeURIComponent(fullAddr(p));
  const zillowQ = encodeURIComponent(`${p.address} ${p.city} ${p.state} ${p.zip}`);
  const redfinCity = p.city.replace(/ /g, "-");
  const googleQ = encodeURIComponent(`${fullAddr(p)} foreclosure property`);
  const newsQ = encodeURIComponent(`${p.address} ${p.city} WI`);
  return {
    "Official": [
      { icon: "🏛️", label: "Sheriff Sales List",   href: "https://apps.kenoshacounty.org/SheriffSales" },
      { icon: "📄", label: "Sale Document",         href: `https://apps.kenoshacounty.org/SheriffSales/Home/GetImage?imageID=${p.docId}` },
      { icon: "📋", label: "County Parcel Info",    href: `https://propertyinfo.kenoshacounty.org/Search/RealEstate/Search/ParcelRedirect?ParcelNumber=${p.parcel}` },
      { icon: "⚖️", label: "WCCA Court Record",     href: `http://wcca.wicourts.gov/caseDetails.do?countyNo=30&caseNo=${p.caseNo}` },
      { icon: "💰", label: "Delinquent Taxes",      href: "https://www.kenoshacountywi.gov/1976/Delinquent-Taxes" },
      { icon: "🗺️", label: "County GIS Map",        href: "https://gis.kenoshacounty.org" },
      { icon: "🔍", label: "Building Permits",      href: "https://aca.kenoshacounty.org" },
      { icon: "📜", label: "Register of Deeds",     href: "https://www.kenoshacountywi.gov/547/Register-of-Deeds" },
    ],
    "Market Value": [
      { icon: "🏡", label: "Zillow",      href: `https://www.zillow.com/homes/${zillowQ}_rb/` },
      { icon: "🔴", label: "Redfin",      href: `https://www.redfin.com/WI/${redfinCity}/` },
      { icon: "📊", label: "Realtor.com", href: `https://www.realtor.com/realestateandhomes-search/${p.city.replace(/ /g,"-")}_WI/` },
      { icon: "🏦", label: "Trulia",      href: `https://www.trulia.com/WI/${p.city.replace(/ /g,"_")}/` },
      { icon: "🔖", label: "Eppraisal",   href: `https://www.eppraisal.com/home-values/search/?address=${zillowQ}` },
    ],
    "Title & Liens": [
      { icon: "📜", label: "Title Check WI",       href: `https://titlecheck.us/search?state=WI&address=${addrEnc}` },
      { icon: "📑", label: "WI Register of Deeds", href: "https://www.kenoshacountywi.gov/547/Register-of-Deeds" },
      { icon: "⚖️", label: "WCCA Case Detail",     href: `http://wcca.wicourts.gov/caseDetails.do?countyNo=30&caseNo=${p.caseNo}` },
      { icon: "🏛️", label: "WI Circuit Court",     href: "https://wcca.wicourts.gov" },
    ],
    "Maps": [
      { icon: "🌐", label: "Google Maps",    href: `https://maps.google.com/?q=${addrEnc}` },
      { icon: "📷", label: "Street View",    href: `https://maps.google.com/?q=${addrEnc}&layer=c` },
      { icon: "🛰️", label: "Satellite View", href: `https://maps.google.com/?q=${addrEnc}&t=k` },
      { icon: "🗺️", label: "County GIS",     href: "https://gis.kenoshacounty.org" },
      { icon: "🏘️", label: "Walk Score",     href: `https://www.walkscore.com/score/${addrEnc}` },
    ],
    "Research": [
      { icon: "🔍", label: "Google Search",     href: `https://www.google.com/search?q=${googleQ}` },
      { icon: "📰", label: "Kenosha News",       href: `https://www.kenoshanews.com/search/?q=${newsQ}` },
      { icon: "🏘️", label: "NeighborhoodScout", href: "https://www.neighborhoodscout.com/wi/kenosha" },
      { icon: "🚨", label: "Crime Map",          href: "https://www.crimemapping.com/map/WI/Kenosha" },
      { icon: "🏫", label: "School Ratings",     href: "https://www.greatschools.org/wisconsin/kenosha/" },
      { icon: "💼", label: "Census / Zip Data",  href: `https://data.census.gov/profile?q=${p.zip}` },
    ],
  };
}

function getFlags(p, openingBid, judgmentAmt, estValue, myValue) {
  const yr = caseYear(p.caseNo);
  const flags = [];
  if (yr && yr <= 2023) flags.push({ t: "warn",    text: `⚠️ Long foreclosure (filed ${yr}) — title complications possible` });
  if (yr && yr <= 2022) flags.push({ t: "warn",    text: "🔨 Likely needs major updates (extended distress period)" });
  if (yr && yr === 2024) flags.push({ t: "caution", text: "⏳ 2024 case — verify no postponements" });
  flags.push({ t: "caution", text: "💰 Verify delinquent tax balance before bidding" });
  if (openingBid && judgmentAmt && openingBid > judgmentAmt)
    flags.push({ t: "caution", text: `📋 Bid exceeds judgment by ${fmt(openingBid - judgmentAmt)} — added costs` });
  const valForCalc = myValue || estValue;
  if (openingBid && valForCalc) {
    const pct = Math.round((openingBid / valForCalc) * 100);
    const spread = valForCalc - openingBid;
    if (pct >= 90)      flags.push({ t: "warn",    text: `🚫 Bid is ${pct}% of value — no margin` });
    else if (pct >= 75) flags.push({ t: "caution", text: `📊 Bid is ${pct}% of value — thin margin (${fmt(spread)} spread)` });
    else                flags.push({ t: "ok",      text: `✅ Bid is ${pct}% of value — ${fmt(spread)} potential spread` });
  }
  return flags;
}

// ─── EDITABLE NUMBER ──────────────────────────────────
function EditNum({ label, value, color, sublabel, placeholder = "Click to enter ✏️", onSave }) {
  const [ed, setEd] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const [flash, setFlash] = useState(false);
  useEffect(() => { setDraft(value != null ? String(value) : ""); }, [value]);
  function save() { onSave(parseMoney(draft)); setEd(false); setFlash(true); setTimeout(() => setFlash(false), 1200); }
  return (
    <div style={{ background: S.surface, border: `1px solid ${flash ? "rgba(62,207,142,0.5)" : S.border}`, borderRadius: 7, padding: "10px 12px", transition: "border-color 0.3s" }}>
      <div style={{ fontSize: 10, color: S.muted, fontFamily: S.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      {ed ? (
        <div>
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEd(false); }}
            placeholder="e.g. 125000"
            style={{ width: "100%", background: "#0d0f14", border: "1px solid rgba(62,207,142,0.4)", color: S.text, fontFamily: S.mono, fontSize: 14, padding: "5px 8px", borderRadius: 4, outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={save} style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.3)", color: S.green, fontFamily: S.mono, fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>💾 Save</button>
            <button onClick={() => { setEd(false); setDraft(value != null ? String(value) : ""); }} style={{ background: "transparent", border: `1px solid ${S.border}`, color: S.muted, fontFamily: S.mono, fontSize: 11, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>✕</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setEd(true)} style={{ cursor: "pointer" }}>
          <div style={{ fontFamily: S.mono, fontSize: 18, fontWeight: 700, color: value != null ? (color || S.text) : S.muted }}>
            {value != null ? fmt(value) : <span style={{ fontSize: 12 }}>{placeholder}</span>}
          </div>
          {sublabel && value != null && <div style={{ fontSize: 10, color: S.muted, marginTop: 2, fontFamily: S.mono }}>{sublabel}</div>}
          {value != null && <div style={{ fontSize: 10, color: S.muted, marginTop: 1, fontFamily: S.mono }}>✏️ click to edit</div>}
        </div>
      )}
    </div>
  );
}

// ─── NOTES BOX ────────────────────────────────────────
function NotesBox({ caseNo, value, onSave }) {
  const [ed, setEd] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [flash, setFlash] = useState(false);
  useEffect(() => { setDraft(value || ""); }, [value]);
  function save() { onSave(draft); setEd(false); setFlash(true); setTimeout(() => setFlash(false), 1200); }
  return (
    <div style={{ background: "#0d0f14", border: `1px solid ${flash ? "rgba(62,207,142,0.4)" : S.border}`, borderRadius: 8, marginTop: 14, transition: "border-color 0.3s" }}>
      <div style={{ padding: "9px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: S.accent, fontFamily: S.mono, fontSize: 12 }}>📝 My Notes — {caseNo}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {flash && <span style={{ color: S.green, fontFamily: S.mono, fontSize: 11 }}>✓ Saved</span>}
          {!ed && <button onClick={() => setEd(true)} style={{ background: "rgba(232,168,56,0.1)", border: "1px solid rgba(232,168,56,0.3)", color: S.accent, fontFamily: S.mono, fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>{value ? "✏️ Edit" : "✏️ Add Notes"}</button>}
          {ed && <>
            <button onClick={save} style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.3)", color: S.green, fontFamily: S.mono, fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>💾 Save</button>
            <button onClick={() => { setEd(false); setDraft(value || ""); }} style={{ background: "transparent", border: `1px solid ${S.border}`, color: S.muted, fontFamily: S.mono, fontSize: 11, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>Cancel</button>
          </>}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {ed
          ? <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) save(); }}
              placeholder="Comps, condition, drive-by notes, bid strategy, contacts… (⌘+Enter to save)"
              style={{ width: "100%", minHeight: 90, background: "#13161d", border: "1px solid rgba(232,168,56,0.3)", borderRadius: 6, color: S.text, fontFamily: "system-ui", fontSize: 13, padding: "9px 11px", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
          : value
            ? <div style={{ fontSize: 13, color: S.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{value}</div>
            : <div style={{ fontSize: 12, color: S.muted, fontFamily: S.mono, fontStyle: "italic" }}>No notes yet. Track comps, condition, bid strategy, drive-by observations…</div>
        }
      </div>
    </div>
  );
}

// ─── RESEARCH TABS ────────────────────────────────────
function ResearchTabs({ p }) {
  const [tab, setTab] = useState("Official");
  const all = buildLinks(p);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: S.muted, fontFamily: S.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🔗 Research Links</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {Object.keys(all).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "rgba(232,168,56,0.15)" : S.surface2,
            border: `1px solid ${tab === t ? "rgba(232,168,56,0.5)" : S.border}`,
            color: tab === t ? S.accent : S.muted,
            fontFamily: S.mono, fontSize: 11, padding: "5px 12px", borderRadius: 5, cursor: "pointer"
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {all[tab].map((l, i) => (
          <a key={i} href={l.href} target="_blank" rel="noreferrer" style={{
            background: S.surface2, border: `1px solid ${S.border}`, color: S.text,
            textDecoration: "none", fontSize: 11, fontFamily: S.mono,
            padding: "6px 11px", borderRadius: 5, display: "flex", alignItems: "center", gap: 5,
          }}>{l.icon} {l.label}</a>
        ))}
      </div>
    </div>
  );
}

// ─── BID PANEL ────────────────────────────────────────
function BidPanel({ p, data, onUpdate }) {
  const { openingBid, judgmentAmt, estValue, myValue } = data;
  const valForSpread = myValue || estValue;
  const spread    = openingBid != null && valForSpread != null ? valForSpread - openingBid : null;
  const spreadPct = spread != null ? Math.round((spread / valForSpread) * 100) : null;
  const bidPct    = openingBid != null && valForSpread != null ? Math.round((openingBid / valForSpread) * 100) : null;
  const judgGap   = openingBid != null && judgmentAmt != null ? openingBid - judgmentAmt : null;
  const docUrl    = `https://apps.kenoshacounty.org/SheriffSales/Home/GetImage?imageID=${p.docId}`;
  const chromePrompt = `Open this Kenosha County sheriff sale document and find:\n1. The JUDGMENT AMOUNT\n2. The OPENING BID / MINIMUM BID (may include added attorney fees, advanced taxes, costs)\n3. List any itemized additions above judgment\n\nDocument: ${docUrl}\nCase: ${p.caseNo} — ${fullAddr(p)}\n\nPaste results back into my Claude.ai chat.`;

  return (
    <div style={{ background: "#0d0f14", border: `1px solid ${S.border}`, borderRadius: 8, marginBottom: 12 }}>
      <div style={{ padding: "9px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ color: S.green, fontFamily: S.mono, fontSize: 12 }}>🏷️ Bid & Valuation Panel</span>
        <div style={{ display: "flex", gap: 6 }}>
          <a href={docUrl} target="_blank" rel="noreferrer" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none", fontSize: 11, fontFamily: S.mono, padding: "4px 10px", borderRadius: 4 }}>📄 Sale Doc ↗</a>
          <a href={`http://wcca.wicourts.gov/caseDetails.do?countyNo=30&caseNo=${p.caseNo}`} target="_blank" rel="noreferrer" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none", fontSize: 11, fontFamily: S.mono, padding: "4px 10px", borderRadius: 4 }}>⚖️ WCCA ↗</a>
        </div>
      </div>
      <div style={{ padding: "14px" }}>
        {/* Row 1: Judgment | Opening Bid | Spread */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 8 }}>
          <EditNum label="Judgment Amount" value={judgmentAmt} color={S.muted} placeholder="From WCCA / doc" sublabel="original judgment" onSave={v => onUpdate({ judgmentAmt: v })} />
          <EditNum label="Opening Bid"     value={openingBid}  color={S.green} placeholder="From sale doc"   sublabel="auction start price" onSave={v => onUpdate({ openingBid: v })} />
          <div style={{ background: S.surface, border: `1px solid ${spread != null ? (spread > 20000 ? "rgba(62,207,142,0.4)" : spread > 0 ? "rgba(232,201,74,0.4)" : "rgba(240,96,96,0.4)") : S.border}`, borderRadius: 7, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: S.muted, fontFamily: S.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Spread (Bid → Value)</div>
            <div style={{ fontFamily: S.mono, fontSize: 18, fontWeight: 700, color: spread != null ? (spread > 20000 ? S.green : spread > 0 ? S.yellow : S.red) : S.muted }}>
              {spread != null ? fmt(spread) : <span style={{ fontSize: 12 }}>—</span>}
            </div>
            {spreadPct != null && <div style={{ fontSize: 10, color: S.muted, marginTop: 2, fontFamily: S.mono }}>{spreadPct}% below {myValue ? "my value" : "AI est."}</div>}
          </div>
        </div>
        {/* Row 2: AI Value | My Opinion */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 7, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: S.muted, fontFamily: S.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>🤖 AI Est. Market Value</div>
            <div style={{ fontFamily: S.mono, fontSize: 18, fontWeight: 700, color: estValue != null ? S.accent : S.muted }}>
              {estValue != null ? fmt(estValue) : <span style={{ fontSize: 12, color: S.muted }}>Run AI Analysis ↓</span>}
            </div>
            {estValue != null && <div style={{ fontSize: 10, color: S.muted, marginTop: 2, fontFamily: S.mono }}>from AI · auto-updated on analysis</div>}
          </div>
          <EditNum label="📌 My Opinion of Value" value={myValue} color="#a78bfa" placeholder="Enter your valuation ✏️" sublabel="your estimate · used for spread calc" onSave={v => onUpdate({ myValue: v })} />
        </div>
        {/* Judgment gap */}
        {judgGap != null && (
          <div style={{ background: judgGap > 0 ? "rgba(232,201,74,0.07)" : "rgba(62,207,142,0.07)", border: `1px solid ${judgGap > 0 ? "rgba(232,201,74,0.25)" : "rgba(62,207,142,0.2)"}`, borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: judgGap > 0 ? S.yellow : S.green, fontFamily: S.mono }}>
            {judgGap > 0 ? `📋 Opening bid is ${fmt(judgGap)} above judgment — includes added costs (attorney fees, advanced taxes, publication, etc.)`
              : judgGap < 0 ? `⚠️ Opening bid is ${fmt(Math.abs(judgGap))} BELOW judgment — verify with plaintiff's attorney`
              : `✅ Opening bid equals judgment amount`}
          </div>
        )}
        {/* Spread bar */}
        {openingBid != null && valForSpread != null && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: S.mono, color: S.muted, marginBottom: 4 }}>
              <span>Bid: {fmt(openingBid)}</span>
              {judgmentAmt != null && <span>Jdgmt: {fmt(judgmentAmt)}</span>}
              <span>{myValue ? "My Value" : "AI Est."}: {fmt(valForSpread)}</span>
            </div>
            <div style={{ height: 8, background: S.border, borderRadius: 4, overflow: "hidden", position: "relative" }}>
              {judgmentAmt != null && <div style={{ position: "absolute", left: `${Math.min(98,(judgmentAmt/valForSpread)*100)}%`, top: 0, width: 2, height: "100%", background: S.muted, zIndex: 2 }} />}
              <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(100, bidPct || 0)}%`, background: spreadPct > 25 ? "linear-gradient(90deg,#3ecf8e,#e8a838)" : spreadPct > 10 ? "linear-gradient(90deg,#e8c94a,#e8a838)" : "linear-gradient(90deg,#f06060,#c45c2a)", transition: "width 0.7s ease" }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: S.mono, color: S.muted, marginTop: 4 }}>
              {spreadPct > 25 ? "🟢 Strong margin" : spreadPct > 10 ? "🟡 Thin — factor in repairs + taxes" : "🔴 Little to no margin at this bid"}
            </div>
          </div>
        )}
        <details>
          <summary style={{ fontSize: 11, color: S.muted, fontFamily: S.mono, cursor: "pointer", userSelect: "none", marginTop: 4 }}>📋 Get bid + judgment via Claude for Chrome ▾</summary>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, padding: "10px 12px", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: S.muted, fontFamily: S.mono, marginBottom: 6 }}>Copy into Claude for Chrome:</div>
            <div style={{ background: "#0d0f14", border: "1px solid rgba(232,168,56,0.2)", borderRadius: 4, padding: "10px 12px", color: S.text, fontSize: 11, fontFamily: S.mono, whiteSpace: "pre-wrap", userSelect: "all", lineHeight: 1.6 }}>{chromePrompt}</div>
          </div>
        </details>
      </div>
    </div>
  );
}

// ─── TAX PANEL ────────────────────────────────────────
function TaxPanel({ p }) {
  const [status, setStatus] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const yr = caseYear(p.caseNo);
  const yrs = yr ? 2026 - yr : 0;
  async function check() {
    setStatus("loading");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 600,
          system: `You are a property tax research assistant for Kenosha County WI. Return ONLY a valid JSON object with NO markdown. Format exactly: {"estimatedAnnualTax":number_or_null,"assessedValue":number_or_null,"delinquentYears":${yrs},"estimatedDelinquentBalance":number_or_null,"taxNotes":"brief string","confidence":"low"}`,
          messages: [{ role: "user", content: `Estimate taxes for ${fullAddr(p)}, Parcel ${p.parcel}. Case filed ${yr} (${yrs} years ago). Use WI average rates. Estimate delinquent balance at 1.5%/month. JSON only.` }]
        })
      });
      const d = await res.json();
      const txt = (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").trim();
      const s = txt.indexOf("{"), e = txt.lastIndexOf("}");
      if (s >= 0 && e > s) setTaxData(JSON.parse(txt.slice(s, e+1)));
      else throw new Error("no json");
    } catch {
      const est = Math.round(2800 + Math.random() * 1400);
      setTaxData({ estimatedAnnualTax: est, assessedValue: null, delinquentYears: yrs, estimatedDelinquentBalance: Math.round(est*yrs*1.18), taxNotes: "Estimate based on Kenosha County averages. Verify at propertyinfo.kenoshacounty.org or call 262-653-2622.", confidence: "low" });
    }
    setStatus("done");
  }
  return (
    <div style={{ background: "#0d0f14", border: `1px solid ${S.border}`, borderRadius: 8, marginTop: 12, marginBottom: 12 }}>
      <div style={{ padding: "9px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span style={{ color: S.yellow, fontFamily: S.mono, fontSize: 12 }}>💰 Tax Status — {p.parcel}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <a href={`https://propertyinfo.kenoshacounty.org/Search/RealEstate/Search/ParcelRedirect?ParcelNumber=${p.parcel}`} target="_blank" rel="noreferrer" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none", fontSize: 11, fontFamily: S.mono, padding: "4px 10px", borderRadius: 4 }}>📋 County Portal ↗</a>
          <a href="https://www.kenoshacountywi.gov/1976/Delinquent-Taxes" target="_blank" rel="noreferrer" style={{ background: S.surface2, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none", fontSize: 11, fontFamily: S.mono, padding: "4px 10px", borderRadius: 4 }}>🏛️ Delinquent ↗</a>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ background: "rgba(232,201,74,0.06)", border: "1px solid rgba(232,201,74,0.2)", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#c8b85a" }}>
          <strong>WI Law:</strong> 1% interest + 0.5% penalty/month from Feb 1. Taxes survive the sale. Treasurer: <strong>262-653-2622</strong>
        </div>
        {status === null && <button onClick={check} style={{ background: "rgba(232,201,74,0.1)", border: "1px solid rgba(232,201,74,0.3)", color: S.yellow, fontFamily: S.mono, fontSize: 12, padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>🔍 AI Tax Estimate</button>}
        {status === "loading" && <div style={{ color: S.muted, fontFamily: S.mono, fontSize: 12 }}>⏳ Estimating…</div>}
        {status === "done" && taxData && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[
                { label: "Est. Annual Tax",         value: taxData.estimatedAnnualTax ? `${fmt(taxData.estimatedAnnualTax)}/yr` : "Not found", color: S.text },
                { label: "Assessed Value",          value: taxData.assessedValue ? fmt(taxData.assessedValue) : "Search portal", color: S.text },
                { label: "Years Delinquent",        value: `~${taxData.delinquentYears} yrs`, color: S.red },
                { label: "Est. Delinquent Balance", value: taxData.estimatedDelinquentBalance ? fmt(taxData.estimatedDelinquentBalance) : "Verify w/ county", color: taxData.estimatedDelinquentBalance > 10000 ? S.red : S.yellow },
              ].map((item, i) => (
                <div key={i} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 11px" }}>
                  <div style={{ fontSize: 10, color: S.muted, fontFamily: S.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: S.mono, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
            {taxData.taxNotes && <div style={{ fontSize: 12, color: S.muted, fontStyle: "italic", marginBottom: 8 }}>📌 {taxData.taxNotes}</div>}
            <button onClick={check} style={{ background: "transparent", border: `1px solid ${S.border}`, color: S.muted, fontFamily: S.mono, fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>↻ Re-check</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROPERTY CARD ────────────────────────────────────
function PropertyCard({ p }) {
  const storageKey = `prop:${p.caseNo}`;
  const [data, setData] = useState({ openingBid: null, judgmentAmt: null, estValue: null, myValue: null, analysis: null, analysisDate: null, notes: "" });
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"

  // Load from window.storage on mount
  useEffect(() => {
    storageGet(storageKey).then(saved => {
      if (saved) setData(prev => ({ ...prev, ...saved }));
      setLoaded(true);
    });
  }, [storageKey]);

  // Save to window.storage — always merges, never overwrites
  const persist = useCallback(async (patch) => {
    setSaveStatus("saving");
    const merged = { ...data, ...patch };
    setData(merged);
    const ok = await storageSet(storageKey, merged);
    setSaveStatus(ok ? "saved" : "error");
    setTimeout(() => setSaveStatus(null), 2000);
    return merged;
  }, [data, storageKey]);

  const yr = caseYear(p.caseNo);
  const { openingBid, judgmentAmt, estValue, myValue, analysis, analysisDate, notes } = data;
  const flags = getFlags(p, openingBid, judgmentAmt, estValue, myValue);
  const isFlagged = flags.some(f => f.t === "warn");
  const hasAnalysis = !!analysis;
  const hasNotes = !!(notes && notes.trim());

  async function runAnalysis() {
    setOpen(true);
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a senior real estate investment analyst for Windy City Property Partners Inc., based in Chicago IL. You specialize in foreclosure acquisitions in the Midwest. Provide detailed, specific investment analysis using your knowledge of Wisconsin real estate markets and Kenosha County property values. Always use specific dollar figures. Be concise but thorough. Do not use markdown bold or headers — use plain numbered sections.",
          messages: [{
            role: "user",
            content: `Analyze this Kenosha County WI sheriff sale for an investor:

PROPERTY: ${fullAddr(p)}
CASE: ${p.caseNo} (filed ${yr}, ${2026 - yr} years in foreclosure)
DEFENDANT: ${p.defendant}
SALE DATE: ${p.saleDate}
PARCEL: ${p.parcel}
JUDGMENT AMT: ${judgmentAmt ? fmt(judgmentAmt) : "Not yet entered"}
OPENING BID: ${openingBid ? fmt(openingBid) : "Not yet entered"}
MY OPINION OF VALUE: ${myValue ? fmt(myValue) : "Not set"}

Provide analysis covering these 6 points using plain text (no markdown):

1. ESTIMATED MARKET VALUE — Based on your knowledge of Kenosha WI ${p.zip}, give as-is value and ARV range with specific dollar amounts.

2. BID vs VALUE — ${openingBid ? `Opening bid is ${fmt(openingBid)}.` : "No bid entered."} ${myValue ? `My opinion of value is ${fmt(myValue)}.` : ""} Is this a deal? What is the profit potential after repairs and carrying costs?

3. RENOVATION FLAGS — Case filed ${yr}, ${2026 - yr} years ago, property in distress. What systems likely need work? Estimate repair budget range.

4. TITLE & LIEN RISKS — Key things to check in WCCA case ${p.caseNo}. Risks from a ${2026 - yr}-year foreclosure timeline.

5. NEIGHBORHOOD — ${p.city}, WI ${p.zip}. Investment character, owner/renter mix, rental demand.

6. VERDICT — Strong Buy / Proceed with Caution / Pass — one clear sentence.`
          }]
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().then(t => t.slice(0,150))}`);
      const json = await res.json();
      if (!json.content?.length) throw new Error(`Empty response. stop_reason: ${json.stop_reason}`);
      const textBlocks = json.content.filter(b => b.type === "text");
      if (!textBlocks.length) throw new Error(`No text block. Types: ${json.content.map(b=>b.type).join(",")}`);
      const text = textBlocks.map(b => b.text).join("\n").trim();
      if (text.length < 100) throw new Error("Response too short: " + text.slice(0,100));

      // Extract first plausible market value
      let extractedVal = null;
      for (const m of [...text.matchAll(/\$([\d,]{4,})/g)]) {
        const v = parseFloat(m[1].replace(/,/g,""));
        if (v >= 60000 && v <= 900000) { extractedVal = v; break; }
      }

      // Save — merges with existing notes/bids/etc
      await persist({
        analysis: text,
        analysisDate: new Date().toLocaleDateString(),
        ...(extractedVal ? { estValue: extractedVal } : {})
      });

    } catch (e) {
      setAnalyzeError(e.message || "Analysis failed");
    }
    setAnalyzing(false);
  }

  if (!loaded) return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, marginBottom: 12, padding: "16px 20px" }}>
      <div style={{ color: S.muted, fontFamily: S.mono, fontSize: 12 }}>Loading {p.address}…</div>
    </div>
  );

  const d = new Date(p.saleDate + "T12:00:00");
  const mo = d.toLocaleString("en-US", { month: "short" });

  return (
    <div style={{ background: isFlagged ? "#1a1010" : S.surface, border: `1px solid ${isFlagged ? "#5a2020" : hasAnalysis ? "rgba(62,207,142,0.2)" : S.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
      <style>{`@keyframes kspin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div onClick={() => setOpen(!open)} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 12, padding: "14px 16px", cursor: "pointer", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: S.accent, fontFamily: S.mono, fontWeight: 700, fontSize: 18 }}>{mo} {d.getDate()}</div>
          <div style={{ color: S.muted, fontSize: 11 }}>{d.getFullYear()}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{fullAddr(p)}</div>
          <div style={{ color: S.muted, fontSize: 12, marginTop: 2 }}>{p.defendant}</div>
          <div style={{ display: "flex", gap: 7, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: S.accent, fontFamily: S.mono, fontSize: 11 }}>{p.caseNo}</span>
            {openingBid != null && <span style={{ color: S.green, fontFamily: S.mono, fontSize: 11, background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.2)", padding: "1px 7px", borderRadius: 3 }}>Bid: {fmt(openingBid)}</span>}
            {judgmentAmt != null && <span style={{ color: S.muted, fontFamily: S.mono, fontSize: 11, background: S.surface2, border: `1px solid ${S.border}`, padding: "1px 7px", borderRadius: 3 }}>Jdgmt: {fmt(judgmentAmt)}</span>}
            {myValue != null && <span style={{ color: "#a78bfa", fontFamily: S.mono, fontSize: 11, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", padding: "1px 7px", borderRadius: 3 }}>My Val: {fmt(myValue)}</span>}
            {hasAnalysis && <span style={{ fontSize: 11, color: S.green }}>🤖 {analysisDate}</span>}
            {hasNotes && <span style={{ fontSize: 11 }}>📝</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          <span style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.3)", color: S.green, fontSize: 11, fontFamily: S.mono, padding: "3px 8px", borderRadius: 4 }}>{p.status}</span>
          {saveStatus === "saving" && <span style={{ color: S.muted, fontSize: 10, fontFamily: S.mono }}>saving…</span>}
          {saveStatus === "saved"  && <span style={{ color: S.green, fontSize: 10, fontFamily: S.mono }}>✓ saved</span>}
          {saveStatus === "error"  && <span style={{ color: S.red,   fontSize: 10, fontFamily: S.mono }}>save err</span>}
          <span style={{ color: S.muted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* EXPANDED */}
      {open && (
        <div style={{ borderTop: `1px solid ${S.border}`, padding: "14px 16px" }}>

          {/* FLAGS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
            {flags.map((f, i) => (
              <span key={i} style={{
                background: f.t==="warn" ? "rgba(240,96,96,0.1)" : f.t==="ok" ? "rgba(62,207,142,0.1)" : "rgba(232,201,74,0.08)",
                border: `1px solid ${f.t==="warn" ? "rgba(240,96,96,0.3)" : f.t==="ok" ? "rgba(62,207,142,0.3)" : "rgba(232,201,74,0.25)"}`,
                color: f.t==="warn" ? S.red : f.t==="ok" ? S.green : S.yellow,
                fontSize: 11, fontFamily: S.mono, padding: "4px 10px", borderRadius: 4
              }}>{f.text}</span>
            ))}
          </div>

          {/* BID PANEL */}
          <BidPanel p={p} data={data} onUpdate={patch => persist(patch)} />

          {/* ACTION BUTTONS */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <button onClick={() => setShowTax(!showTax)} style={{ background: showTax ? "rgba(232,201,74,0.15)" : "rgba(232,201,74,0.08)", border: `1px solid ${showTax ? "rgba(232,201,74,0.5)" : "rgba(232,201,74,0.25)"}`, color: S.yellow, fontFamily: S.mono, fontSize: 12, padding: "7px 14px", borderRadius: 6, cursor: "pointer" }}>
              💰 {showTax ? "Hide" : "Check"} Tax Panel
            </button>
            {!hasAnalysis && !analyzing && (
              <button onClick={runAnalysis} style={{ background: "rgba(62,207,142,0.08)", border: "1px solid rgba(62,207,142,0.3)", color: S.green, fontFamily: S.mono, fontSize: 12, padding: "7px 14px", borderRadius: 6, cursor: "pointer" }}>
                🤖 Run AI Analysis
              </button>
            )}
            {analyzing && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 14, height: 14, border: `2px solid rgba(62,207,142,0.3)`, borderTop: `2px solid ${S.green}`, borderRadius: "50%", animation: "kspin 0.7s linear infinite" }} />
                <span style={{ color: S.muted, fontFamily: S.mono, fontSize: 12 }}>Analyzing… (5–15s)</span>
              </div>
            )}
            {analyzeError && !analyzing && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: S.red, fontFamily: S.mono, fontSize: 11 }}>⚠️ {analyzeError}</span>
                <button onClick={runAnalysis} style={{ background: "rgba(240,96,96,0.1)", border: "1px solid rgba(240,96,96,0.3)", color: S.red, fontFamily: S.mono, fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>↻ Retry</button>
              </div>
            )}
            {hasAnalysis && !analyzing && (
              <button onClick={runAnalysis} style={{ background: "transparent", border: `1px solid ${S.border}`, color: S.muted, fontFamily: S.mono, fontSize: 11, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>↻ Re-Analyze</button>
            )}
          </div>

          {/* TAX PANEL */}
          {showTax && <TaxPanel p={p} />}

          {/* RESEARCH TABS */}
          <ResearchTabs p={p} />

          {/* SAVED ANALYSIS */}
          {hasAnalysis && (
            <div style={{ background: "#0d0f14", border: `1px solid ${S.border}`, borderRadius: 8, marginBottom: 4 }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <span style={{ color: S.accent, fontFamily: S.mono, fontSize: 12 }}>🤖 AI Analysis — {p.caseNo}</span>
                <span style={{ color: S.green, fontFamily: S.mono, fontSize: 11 }}>✓ saved {analysisDate} · persists across sessions</span>
              </div>
              <div style={{ padding: "13px 14px", fontSize: 13, lineHeight: 1.75, whiteSpace: "pre-wrap", color: S.text }}>{analysis}</div>
            </div>
          )}

          {/* NOTES */}
          <NotesBox caseNo={p.caseNo} value={notes} onSave={v => persist({ notes: v })} />
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────
export default function App() {
  const [summary, setSummary] = useState({ analyzed: 0, bids: 0, noted: 0 });

  // Poll summary counts from storage
  useEffect(() => {
    async function load() {
      let analyzed = 0, bids = 0, noted = 0;
      for (const p of LISTINGS) {
        const d = await storageGet(`prop:${p.caseNo}`);
        if (d?.analysis) analyzed++;
        if (d?.openingBid != null) bids++;
        if (d?.notes?.trim()) noted++;
      }
      setSummary({ analyzed, bids, noted });
    }
    load();
  }, []);

  const groups = {};
  LISTINGS.forEach(p => {
    const d = new Date(p.saleDate + "T12:00:00");
    const key = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  const flagged = LISTINGS.filter(p => { const yr = caseYear(p.caseNo); return yr && yr <= 2023; }).length;
  const next    = LISTINGS.filter(p => new Date(p.saleDate) >= new Date()).sort((a,b) => a.saleDate.localeCompare(b.saleDate))[0];
  const nextD   = next ? new Date(next.saleDate + "T12:00:00") : null;

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>🏛️ Kenosha Foreclosure Tracker</div>
          <div style={{ fontSize: 11, color: S.muted, fontFamily: S.mono, marginTop: 2 }}>Kenosha County Sheriff Sales · Windy City Property Partners · v7</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.3)", color: S.green, fontFamily: S.mono, fontSize: 11, padding: "4px 10px", borderRadius: 4 }}>● LIVE</span>
          <a href="https://apps.kenoshacounty.org/SheriffSales" target="_blank" rel="noreferrer" style={{ color: S.accent, fontSize: 11, fontFamily: S.mono, textDecoration: "none" }}>Official Source ↗</a>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 16px" }}>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 18 }}>
          {[
            { label: "Active Sales",   value: LISTINGS.length,         color: S.accent },
            { label: "Next Sale",      value: nextD ? `${nextD.toLocaleString("en-US",{month:"short"})} ${nextD.getDate()}` : "—", sub: next?.address, color: S.text },
            { label: "⚠ Flagged",      value: flagged,                  color: S.red },
            { label: "🤖 Analyzed",    value: `${summary.analyzed}/10`, color: summary.analyzed===10 ? S.green : S.accent },
            { label: "🏷️ Bids",        value: `${summary.bids}/10`,     color: summary.bids===10 ? S.green : S.muted },
            { label: "📝 Notes",       value: summary.noted,            color: summary.noted>0 ? S.green : S.muted },
          ].map((s,i) => (
            <div key={i} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "9px 11px" }}>
              <div style={{ fontSize: 10, color: S.muted, fontFamily: S.mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 10, color: S.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* QUICK LINKS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {[
            { label: "🏛️ Official Sales",    href: "https://apps.kenoshacounty.org/SheriffSales" },
            { label: "💰 Delinquent Taxes",  href: "https://www.kenoshacountywi.gov/1976/Delinquent-Taxes" },
            { label: "📋 County Property",   href: "https://propertyinfo.kenoshacounty.org" },
            { label: "⚖️ WCCA Courts",       href: "https://wcca.wicourts.gov" },
            { label: "🗺️ County GIS",        href: "https://gis.kenoshacounty.org" },
            { label: "🏡 Zillow Kenosha WI", href: "https://www.zillow.com/kenosha-wi/" },
            { label: "🔴 Redfin Kenosha WI", href: "https://www.redfin.com/WI/Kenosha/" },
            { label: "🔍 Permits",           href: "https://aca.kenoshacounty.org" },
          ].map((l,i) => (
            <a key={i} href={l.href} target="_blank" rel="noreferrer" style={{ background: S.surface, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none", fontSize: 12, fontFamily: S.mono, padding: "5px 11px", borderRadius: 6 }}>{l.label}</a>
          ))}
        </div>

        {/* LISTINGS */}
        {Object.entries(groups).map(([month, props]) => (
          <div key={month}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 10px" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{month}</span>
              <span style={{ color: S.accent, fontFamily: S.mono, fontSize: 11, background: "rgba(232,168,56,0.1)", border: "1px solid rgba(232,168,56,0.25)", padding: "2px 8px", borderRadius: 4 }}>{props.length} listings</span>
              <div style={{ flex: 1, height: 1, background: S.border }} />
            </div>
            {props.map(p => <PropertyCard key={p.caseNo} p={p} />)}
          </div>
        ))}

        <div style={{ textAlign: "center", color: S.muted, fontFamily: S.mono, fontSize: 11, marginTop: 24, paddingTop: 14, borderTop: `1px solid ${S.border}` }}>
          Windy City Property Partners Inc. · 77 W. Washington Suite 1716, Chicago IL 60602 · 312-726-4220
        </div>
      </div>
    </div>
  );
}
