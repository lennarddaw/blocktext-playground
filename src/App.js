import React, { useMemo, useRef, useState, useEffect } from "react";

// 1:1 SVG export mit eingebetteter lokaler Schrift (foreignObject)
// - Lädt Montserrat Variable-TTF automatisch aus /public/fonts/montserrat/
// - Betten als data: URL in das SVG ein (keine manuelle Eingabe nötig)

const HTMLCSSPlayground = () => {
  const [text, setText] = useState(
    "Das Thema: Verschattung als architektonisches Gestaltungselement. Anders, ungewöhnlich und provokant wirkt diese Architektur als Zeichen unserer Zeit ganz selbstverständlich neben dem Backsteingebäude des alten Bahnhofs in Montabaur. Die oberen Stockwerke beider Gebäudeblocks haben jeweils eine Penthouse-Artrium-Wohnung mit einem exklusiven Rundumblick über Montabaur und den Westerwald. Alle Zimmer haben einen Ausgang auf die jeweils innenliegende Terrasse im Loungestyle."
  );

  const [styles, setStyles] = useState({
    // Grundwerte
    backgroundColor: "#2e546f",
    color: "#ffffff",
    width: 271,
    letterSpacing: -0.4,
    wordSpacing: -2,
    lineHeight: 1.5,
    fontSize: 16,
    textAlign: "justify",
    // Abstände
    padding: 0,            // oben/unten
    paddingLeft: 0,         // links
    paddingRight: 0,        // rechts
    // Mikrotypografie
    textIndent: 0,          // Erste Zeile einrücken
    paragraphSpacing: 0,    // Abstand zwischen Absätzen
    hyphenate: "auto",      // "auto" | "manual" | "none"
    lang: "de",             // Sprache für Silbentrennung
    alignLast: "auto",      // "auto" | "left" | "right" | "center" | "justify"
    wrapMode: "standard",   // "standard" | "long-words" | "anywhere" | "keep-all"
    hangingPunctuation: false,
    // Schrift
    fontFamily: "Montserrat, sans-serif",
  });

  // --- Eingebettete Font-Daten (auto load aus /public) ---
  const [fontDataUrl, setFontDataUrl] = useState("");         // Montserrat Variable (normal)
  const [fontDataUrlItalic, setFontDataUrlItalic] = useState(""); // Montserrat Variable (italic, optional)

  const containerRef = useRef(null);
  const blockRef = useRef(null);

  const updateStyle = (property, value) => {
    setStyles((prev) => ({ ...prev, [property]: value }));
  };

  const fonts = useMemo(
    () => [
      "Montserrat, sans-serif",
      "Helvetica, sans-serif",
      "Georgia, serif",
      "Times New Roman, serif",
      "Courier New, monospace",
      "Verdana, sans-serif",
      "Trebuchet MS, sans-serif",
    ],
    []
  );

  const bgPresets = [
    { label: "Primary", value: "#FF0000" },
    { label: "Secondary", value: "#958F80" },
    { label: "Home Staging", value: "#635448" },
    { label: "Light Work", value: "#906c4c" },
    { label: "Light Sculpture", value: "#958F80" },
    { label: "Architecture", value: "#2e546f" },
    { label: "Himmel Blau", value: "#3b6493" },
    { label: "Brown", value: "#6f5b4a" },
    { label: "Khakigrau", value: "#756444" },
    { label: "Weiß", value: "#ffffff" },
  ];

  // ---------- Fonts automatisch einbetten ----------
  useEffect(() => {
    autoEmbed("/fonts/montserrat/Montserrat-VariableFont_wght.ttf", setFontDataUrl);
    autoEmbed("/fonts/montserrat/Montserrat-Italic-VariableFont_wght.ttf", setFontDataUrlItalic); // optional
  }, []);

  async function autoEmbed(path, setter) {
    try {
      const res = await fetch(path); // same-origin → kein CORS-Problem
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = await res.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      setter(`data:font/ttf;base64,${b64}`);
    } catch (e) {
      console.warn("Font embed failed:", e);
    }
  }

  // ---------- Mapping für Anzeige-Labels ----------
  const wrapLabel = {
    standard: "Standard",
    "long-words": "Lange Wörter umbrechen",
    anywhere: "Überall umbrechen",
    "keep-all": "Nur an erlaubten Stellen",
  };
  const hyphenLabel = {
    auto: "Automatisch",
    manual: "Nur weiche Trennstellen",
    none: "Keine",
  };
  const alignLastLabel = {
    auto: "Automatisch",
    left: "Links",
    center: "Zentriert",
    right: "Rechts",
    justify: "Blocksatz",
  };
  const textAlignLabel = {
    left: "Links",
    center: "Zentriert",
    right: "Rechts",
    justify: "Blocksatz",
  };

  // ---------- Mapping für Zeilenumbruch-Profile (CSS) ----------
  const wrapMap = {
    standard:    { wordBreak: "normal",   overflowWrap: "break-word" },
    "long-words":{ wordBreak: "break-word", overflowWrap: "break-word" },
    anywhere:    { wordBreak: "normal",   overflowWrap: "anywhere" },
    "keep-all":  { wordBreak: "keep-all", overflowWrap: "normal" },
  };

  // ---------- Helpers ----------
  const cssTextBlock = () => {
    const fam = styles.fontFamily;
    const { wordBreak, overflowWrap } = wrapMap[styles.wrapMode] || wrapMap.standard;
    const hyphenCSS = styles.hyphenate; // auto | manual | none

    return (
`.text-block{
background-color:${styles.backgroundColor};
color:${styles.color};
width:${styles.width}px;
letter-spacing:${styles.letterSpacing}px;
word-spacing:${styles.wordSpacing}px;
line-height:${styles.lineHeight};
font-size:${styles.fontSize}px;
text-align:${styles.textAlign};
text-align-last:${styles.alignLast};
padding-top:${styles.padding}px;
padding-bottom:${styles.padding}px;
padding-left:${styles.paddingLeft}px;
padding-right:${styles.paddingRight}px;
font-family:${fam};
white-space:pre-wrap;
hyphens:${hyphenCSS};
-webkit-hyphens:${hyphenCSS};
-moz-hyphens:${hyphenCSS};
word-break:${wordBreak};
overflow-wrap:${overflowWrap};
${styles.hangingPunctuation ? "hanging-punctuation:first allow-end;" : ""}
-webkit-font-smoothing:antialiased;
-moz-osx-font-smoothing:grayscale;
}
.text-block p{
  margin:0;
  text-indent:${styles.textIndent}px;
}
.text-block p + p{
  margin-top:${styles.paragraphSpacing}px;
}`
    );
  };

  const escapeHtml = (str) =>
    (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const measureBlock = () => {
    const node = blockRef.current;
    if (!node) return { width: styles.width, height: 200 };
    const { width, height } = node.getBoundingClientRect();
    return { width: Math.ceil(width), height: Math.ceil(height) };
  };

  const buildFontFace = () => {
    const fam = styles.fontFamily.split(",")[0].trim(); // "Montserrat"
    let css = "";
    if (fontDataUrl) {
      css += `@font-face{
  font-family:'${fam}';
  src:url('${fontDataUrl}') format('truetype');
  font-weight:100 900;
  font-style:normal;
  font-display:block;
}`;
    }
    if (fontDataUrlItalic) {
      css += `@font-face{
  font-family:'${fam}';
  src:url('${fontDataUrlItalic}') format('truetype');
  font-weight:100 900;
  font-style:italic;
  font-display:block;
}`;
    }
    return css;
  };

  // ---------- Export: foreignObject (1:1 fidelity) ----------
  const exportSVGForeignObject = () => {
    const { width, height } = measureBlock();
    const headStyle =
      `*{margin:0;box-sizing:border-box;}\n` +
      buildFontFace() + "\n" +
      cssTextBlock();

    // Text in <p>-Absätze umwandeln
    const paragraphs = (text || "").split(/\n{2,}/);
    const htmlParagraphs = paragraphs
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
      .join("");

    const html =
`<div xmlns="http://www.w3.org/1999/xhtml" lang="${styles.lang}">
  <style>
${headStyle}
  </style>
  <div class="text-block">${htmlParagraphs}</div>
</div>`;

    const svg =
`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject x="0" y="0" width="${width}" height="${height}">
    ${html}
  </foreignObject>
</svg>`;

    triggerDownload(svg, "typography_export_1to1.svg");
  };

  const triggerDownload = (svgString, filename) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ----------- Rendering-Helfer: Absätze/Zeilenumbrüche ----------
  const renderParagraphs = (value) => {
    const paras = (value || "").split(/\n{2,}/);
    return paras.map((para, idx) => {
      const lines = para.split("\n");
      return (
        <p key={idx}>
          {lines.map((ln, i) => (
            <React.Fragment key={i}>
              {ln}
              {i < lines.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">HTML/CSS Typography</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kontrollelemente */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Einstellungen</h2>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text eingeben
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-36 p-3 border border-gray-300 rounded-md resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gib hier deinen Text ein... Absätze mit Leerzeile trennen (Enter + Enter)."
              />
            </div>

            {/* Farben */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hintergrundfarbe</label>
                  <span className="text-xs text-gray-500">{styles.backgroundColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.backgroundColor}
                    onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styles.backgroundColor}
                    onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                {/* Presets */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {bgPresets.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => updateStyle("backgroundColor", c.value)}
                        title={c.label}
                        aria-label={c.label}
                        className={`w-8 h-8 rounded border border-gray-300 hover:opacity-80 focus:outline-none ${
                          styles.backgroundColor === c.value ? "ring-2 ring-blue-500 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Textfarbe</label>
                  <span className="text-xs text-gray-500">{styles.color}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.color}
                    onChange={(e) => updateStyle("color", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styles.color}
                    onChange={(e) => updateStyle("color", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Schrift & Breite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schriftart</label>
                  <span className="text-xs text-gray-500">Aktuell: {styles.fontFamily.split(",")[0]}</span>
                </div>
                <select
                  value={styles.fontFamily}
                  onChange={(e) => updateStyle("fontFamily", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font.split(",")[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block-Breite</label>
                  <span className="text-xs text-gray-500">{styles.width} px</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="800"
                  value={styles.width}
                  onChange={(e) => updateStyle("width", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Typo-Grundwerte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schriftgröße</label>
                  <span className="text-xs text-gray-500">{styles.fontSize} px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={styles.fontSize}
                  onChange={(e) => updateStyle("fontSize", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zeilenhöhe</label>
                  <span className="text-xs text-gray-500">{styles.lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={styles.lineHeight}
                  onChange={(e) => updateStyle("lineHeight", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buchstabenabstand</label>
                  <span className="text-xs text-gray-500">{styles.letterSpacing} px</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="5"
                  step="0.1"
                  value={styles.letterSpacing}
                  onChange={(e) => updateStyle("letterSpacing", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wortabstand</label>
                  <span className="text-xs text-gray-500">{styles.wordSpacing} px</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="10"
                  step="0.5"
                  value={styles.wordSpacing}
                  onChange={(e) => updateStyle("wordSpacing", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Mikrotypografie */}
            <div className="mt-8 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Erste Zeile einrücken</label>
                  <span className="text-xs text-gray-500">{styles.textIndent} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={styles.textIndent}
                  onChange={(e) => updateStyle("textIndent", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Abstand zwischen Absätzen</label>
                  <span className="text-xs text-gray-500">{styles.paragraphSpacing} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={styles.paragraphSpacing}
                  onChange={(e) => updateStyle("paragraphSpacing", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Silbentrennung</label>
                  </div>
                  <select
                    value={styles.hyphenate}
                    onChange={(e) => updateStyle("hyphenate", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="auto">Automatisch</option>
                    <option value="manual">Nur bei weichen Trennstellen</option>
                    <option value="none">Keine</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sprache</label>
                  </div>
                  <select
                    value={styles.lang}
                    onChange={(e) => updateStyle("lang", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">Englisch</option>
                    <option value="fr">Französisch</option>
                    <option value="es">Spanisch</option>
                    <option value="it">Italienisch</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ausrichtung</label>
                  </div>
                  <select
                    value={styles.textAlign}
                    onChange={(e) => updateStyle("textAlign", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="left">Links</option>
                    <option value="center">Zentriert</option>
                    <option value="right">Rechts</option>
                    <option value="justify">Blocksatz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Letzte Zeile</label>
                  </div>
                  <select
                    value={styles.alignLast}
                    onChange={(e) => updateStyle("alignLast", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="auto">Automatisch</option>
                    <option value="left">Links</option>
                    <option value="center">Zentriert</option>
                    <option value="right">Rechts</option>
                    <option value="justify">Blocksatz</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zeilenumbruch-Regeln</label>
                  </div>
                  <select
                    value={styles.wrapMode}
                    onChange={(e) => updateStyle("wrapMode", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="standard">Standard</option>
                    <option value="long-words">Lange Wörter umbrechen</option>
                    <option value="anywhere">Überall umbrechen</option>
                    <option value="keep-all">Nur an erlaubten Stellen</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Innenabstände */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Innenabstand o/u</label>
                  <span className="text-xs text-gray-500">{styles.padding} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={styles.padding}
                  onChange={(e) => updateStyle("padding", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Innenabstand links</label>
                  <span className="text-xs text-gray-500">{styles.paddingLeft} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={styles.paddingLeft}
                  onChange={(e) => updateStyle("paddingLeft", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Innenabstand rechts</label>
                  <span className="text-xs text-gray-500">{styles.paddingRight} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={styles.paddingRight}
                  onChange={(e) => updateStyle("paddingRight", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() =>
                setStyles((prev) => ({
                  ...prev,
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  width: 600,
                  letterSpacing: 0,
                  wordSpacing: 0,
                  lineHeight: 1.5,
                  fontSize: 16,
                  textAlign: "justify",
                  padding: 20,
                  paddingLeft: 0,
                  paddingRight: 0,
                  textIndent: 0,
                  paragraphSpacing: 0,
                  hyphenate: "auto",
                  lang: "de",
                  alignLast: "auto",
                  wrapMode: "standard",
                  hangingPunctuation: false,
                  fontFamily: "Arial, sans-serif",
                }))
              }
              className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Zurücksetzen
            </button>

            {/* Export */}
            <div className="mt-6">
              <button
                onClick={exportSVGForeignObject}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Export SVG – 1:1 (embedded Montserrat)
              </button>
            </div>
          </div>

          {/* Vorschau */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Vorschau</h2>

            <div
              ref={containerRef}
              className="border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-96 flex items-start justify-center"
            >
              <div
                ref={blockRef}
                lang={styles.lang}
                style={{
                  backgroundColor: styles.backgroundColor,
                  color: styles.color,
                  width: `${styles.width}px`,
                  maxWidth: "100%",
                  letterSpacing: `${styles.letterSpacing}px`,
                  wordSpacing: `${styles.wordSpacing}px`,
                  lineHeight: styles.lineHeight,
                  fontSize: `${styles.fontSize}px`,
                  textAlign: styles.textAlign,
                  paddingTop: `${styles.padding}px`,
                  paddingBottom: `${styles.padding}px`,
                  paddingLeft: `${styles.paddingLeft}px`,
                  paddingRight: `${styles.paddingRight}px`,
                  fontFamily: styles.fontFamily,
                  borderRadius: "0px",
                  // Zeilenumbruch-Profile live anwenden
                  wordBreak: wrapMap[styles.wrapMode]?.wordBreak || "normal",
                  overflowWrap: wrapMap[styles.wrapMode]?.overflowWrap || "break-word",
                  // Silbentrennung live
                  hyphens: styles.hyphenate,
                  WebkitHyphens: styles.hyphenate,
                  MozHyphens: styles.hyphenate,
                  // Optischer Rand
                  hangingPunctuation: styles.hangingPunctuation ? "first allow-end" : "none",
                }}
                className="transition-all duration-200"
              >
                <div
                  style={{
                    textAlignLast: styles.alignLast,
                  }}
                  className="text-block"
                >
                  {renderParagraphs(text)}
                </div>
              </div>
            </div>

            {/* CSS Code */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Generierter CSS Code:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto text-gray-800">
                {cssTextBlock()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLCSSPlayground;