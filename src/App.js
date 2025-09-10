import React, { useMemo, useRef, useState, useEffect } from "react";

// Fully 1:1 SVG export with embedded font (data URL) via file upload or optional fetch from same-origin URL.
// Uses <foreignObject> to preserve justify, letter/word-spacing, line-height, padding, width, etc.
// If you need absolute compatibility with tools that don't support foreignObject, export a PNG separately.

const HTMLCSSPlayground = () => {
  const [text, setText] = useState(
    "Das Thema: Verschattung als architektonisches Gestaltungselement. Anders, ungewöhnlich und provokant wirkt diese Architektur als Zeichen unserer Zeit ganz selbstverständlich neben dem Backsteingebäude des alten Bahnhofs in Montabaur. Die oberen Stockwerke beider Gebäudeblocks haben jeweils eine Penthouse-Artrium-Wohnung mit einem exklusiven Rundumblick über Montabaur und den Westerwald. Alle Zimmer haben einen Ausgang auf die jeweils innenliegende Terrasse im Loungestyle."
  );

  const [styles, setStyles] = useState({
    backgroundColor: "#2e546f",
    color: "#ffffff",
    width: 600,
    letterSpacing: 0,
    wordSpacing: 0,
    lineHeight: 1.5,
    fontSize: 18,
    textAlign: "justify",
    padding: 20,
    fontFamily: "Montserrat, sans-serif",
  });

  // --- Font embedding ---
  const [fontUrl, setFontUrl] = useState(""); // optional: same-origin WOFF/WOFF2 to embed (CORS must allow)
  const [fontDataUrl, setFontDataUrl] = useState(""); // data: URL after file upload or fetch

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

  // ---------- Helpers ----------
  const cssTextBlock = () => {
    // Keep CSS minimal but 1:1 with state and typical text rendering flags
    return `.text-block{
`+
      `background-color:${styles.backgroundColor};
`+
      `color:${styles.color};
`+
      `width:${styles.width}px;
`+
      `letter-spacing:${styles.letterSpacing}px;
`+
      `word-spacing:${styles.wordSpacing}px;
`+
      `line-height:${styles.lineHeight};
`+
      `font-size:${styles.fontSize}px;
`+
      `text-align:${styles.textAlign};
`+
      `text-align-last:left;
`+
      `padding:${styles.padding}px;
`+
      `font-family:${styles.fontFamily};
`+
      `white-space:pre-wrap;
`+
      `hyphens:auto;
`+
      `-webkit-hyphens:auto;
`+
      `-moz-hyphens:auto;
`+
      `word-break:normal;
`+
      `overflow-wrap:break-word;
`+
      `-webkit-font-smoothing:antialiased;
`+
      `-moz-osx-font-smoothing:grayscale;
`+
      `}`;
  };

  const escapeHtml = (str) =>
    (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const measureBlock = () => {
    const node = blockRef.current;
    if (!node) return { width: styles.width, height: 200 };
    // offsetWidth/Height includes padding; getBoundingClientRect for fractional precision
    const { width, height } = node.getBoundingClientRect();
    return { width: Math.ceil(width), height: Math.ceil(height) };
  };

  const sniffFormatFromDataUrl = (dataUrl) => {
    if (!dataUrl) return "woff2";
    if (dataUrl.startsWith("data:font/woff2")) return "woff2";
    if (dataUrl.startsWith("data:font/woff")) return "woff";
    if (dataUrl.startsWith("data:font/ttf")) return "truetype";
    if (dataUrl.startsWith("data:font/otf")) return "opentype";
    return "woff2";
  };

  const buildFontFace = () => {
    // Embed only if user provided data URL (via upload or successful fetch)
    const fam = styles.fontFamily.split(",")[0].trim();
    if (!fontDataUrl) return "";
    const fmt = sniffFormatFromDataUrl(fontDataUrl);
    return `@font-face{
  font-family:'${fam}';
  src:url('${fontDataUrl}') format('${fmt}');
  font-weight:normal;
  font-style:normal;
  font-display:block;
}`;
  };

  // ---------- Font file upload -> data URL ----------
  const onFontFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFontDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // ---------- Optional fetch font from same-origin URL ----------
  const fetchFontAsDataUrl = async () => {
    if (!fontUrl) return;
    try {
      const res = await fetch(fontUrl, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const ext = fontUrl.toLowerCase().endsWith(".woff2") ? "woff2" : fontUrl.toLowerCase().endsWith(".woff") ? "woff" : fontUrl.toLowerCase().endsWith(".otf") ? "otf" : "ttf";
      const mime = ext === "woff2" ? "font/woff2" : ext === "woff" ? "font/woff" : ext === "otf" ? "font/otf" : "font/ttf";
      setFontDataUrl(`data:${mime};base64,${base64}`);
    } catch (e) {
      alert("Font konnte nicht geladen werden (CORS?). Bitte Datei hochladen.");
      console.error(e);
    }
  };

  // ---------- Export: foreignObject (1:1 fidelity) ----------
  const exportSVGForeignObject = () => {
    const { width, height } = measureBlock();

    const fam = styles.fontFamily.split(",")[0].trim();
    const headStyle = `*{margin:0;box-sizing:border-box;}
${buildFontFace()}
${cssTextBlock()}`;

    // Use pre-wrap to preserve line breaks; HTML entity escaping already done.
    const html = `<div xmlns=\"http://www.w3.org/1999/xhtml\">
  <style>
${headStyle}
  </style>
  <div class=\"text-block\">${escapeHtml(text)}</div>
</div>`;

    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
` +
      `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\">
` +
      `  <foreignObject x=\"0\" y=\"0\" width=\"${width}\" height=\"${height}\">
` +
      `    ${html}
` +
      `  </foreignObject>
` +
      `</svg>`;

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Text eingeben:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gib hier deinen Text ein..."
              />
            </div>

            {/* Farben */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hintergrundfarbe:</label>
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
                        className={`w-8 h-8 rounded border border-gray-300 hover:opacity-80 focus:outline-none ${styles.backgroundColor === c.value ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Textfarbe:</label>
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

            {/* Schriftart */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Schriftart:</label>
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

            {/* Font embedding controls */}
            <div className="mb-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Webfont einbetten (für 1:1 SVG):</label>
              <input
                type="file"
                accept=".woff,.woff2,.ttf,.otf"
                onChange={(e) => onFontFile(e.target.files?.[0])}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://deine-domain/fonts/Montserrat.woff2"
                  value={fontUrl}
                  onChange={(e) => setFontUrl(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={fetchFontAsDataUrl}
                  className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Laden
                </button>
              </div>
              <p className="text-xs text-gray-500">Tipp: Google Fonts direkt blockiert oft CORS. Besser selbst hosten oder Datei hochladen. Eingebettete Schrift wird als data URL in das SVG geschrieben.</p>
            </div>

            {/* Block-Breite */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Block-Breite: {styles.width}px</label>
              <input
                type="range"
                min="200"
                max="800"
                value={styles.width}
                onChange={(e) => updateStyle("width", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Schriftgröße */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Schriftgröße: {styles.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="48"
                value={styles.fontSize}
                onChange={(e) => updateStyle("fontSize", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Letter Spacing */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buchstabenabstand: {styles.letterSpacing}px</label>
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

            {/* Word Spacing */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Wortabstand: {styles.wordSpacing}px</label>
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

            {/* Line Height */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zeilenhöhe: {styles.lineHeight}</label>
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

            {/* Padding */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Innenabstand: {styles.padding}px</label>
              <input
                type="range"
                min="0"
                max="50"
                value={styles.padding}
                onChange={(e) => updateStyle("padding", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() =>
                setStyles({
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  width: 600,
                  letterSpacing: 0,
                  wordSpacing: 0,
                  lineHeight: 1.5,
                  fontSize: 16,
                  textAlign: "justify",
                  padding: 20,
                  fontFamily: "Arial, sans-serif",
                })
              }
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Zurücksetzen
            </button>

            {/* Export Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={exportSVGForeignObject}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Export SVG – 1:1 (embedded font)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Für 1:1 Ergebnis muss die verwendete Schrift eingebettet sein (Datei hochladen oder gleiche Domain + CORS erlauben und "Laden" klicken).</p>
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
                  padding: `${styles.padding}px`,
                  fontFamily: styles.fontFamily,
                  borderRadius: "0px",
                }}
                className="transition-all duration-200"
              >
                {text || "Hier wird dein Text angezeigt..."}
              </div>
            </div>

            {/* CSS Code */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Generierter CSS Code:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto text-gray-800">{cssTextBlock()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLCSSPlayground;