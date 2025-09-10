import { useMemo, useRef, useState } from 'react';

const HTMLCSSPlayground = () => {
  const [text, setText] = useState(
    'Das Thema: Verschattung als architektonisches Gestaltungselement. Anders, ungewöhnlich und provokant wirkt diese Architektur als Zeichen unserer Zeit ganz selbstverständlich neben dem Backsteingebäude des alten Bahnhofs in Montabaur. Die oberen Stockwerke beider Gebäudeblocks haben jeweils eine Penthouse-Artrium-Wohnung mit einem exklusiven Rundumblick über Montabaur und den Westerwald. Alle Zimmer haben einen Ausgang auf die jeweils innenliegende Terrasse im Loungestyle.'
  );

  const [styles, setStyles] = useState({
    backgroundColor: '#2e546f',
    color: '#ffffff',
    width: 600,
    letterSpacing: 0,
    wordSpacing: 0,
    lineHeight: 1.5,
    fontSize: 18,
    textAlign: 'justify',
    padding: 20,
    fontFamily: 'Montserrat, sans-serif',
  });

  const [fontUrl, setFontUrl] = useState(''); // optional: self-hosted WOFF/WOFF2 to embed

  const containerRef = useRef(null); // dashed preview frame
  const blockRef = useRef(null); // the colored text block to export

  const updateStyle = (property, value) => {
    setStyles((prev) => ({ ...prev, [property]: value }));
  };

  const fonts = useMemo(
    () => [
      'Montserrat, sans-serif',
      'Helvetica, sans-serif',
      'Georgia, serif',
      'Times New Roman, serif',
      'Courier New, monospace',
      'Verdana, sans-serif',
      'Trebuchet MS, sans-serif',
    ],
    []
  );

// neben fonts:
  const bgPresets = [
  { label: 'Primary',           value: '#FF0000' },
  { label: 'Secondary',         value: '#958F80' },
  { label: 'Home Staging',      value: '#635448' },
  { label: 'Light Work',        value: '#906c4c' },
  { label: 'Light Sculpture',   value: '#958F80' }, // gleiche Farbe wie Secondary
  { label: 'Architecture',      value: '#2e546f' },
  { label: 'Himmel Blau',       value: '#3b6493' },
  { label: 'Brown',             value: '#6f5b4a' },
  { label: 'Khakigrau',         value: '#756444' },
  { label: 'Weiß',              value: '#ffffff' },
];



  // ---------- Helpers ----------
  const cssTextBlock = useMemo(() => {
    return `.text-block {\n  background-color: ${styles.backgroundColor};\n  color: ${styles.color};\n  width: ${styles.width}px;\n  letter-spacing: ${styles.letterSpacing}px;\n  word-spacing: ${styles.wordSpacing}px;\n  line-height: ${styles.lineHeight};\n  font-size: ${styles.fontSize}px;\n  text-align: ${styles.textAlign};\n  padding: ${styles.padding}px;\n  font-family: ${styles.fontFamily};\n  border-radius: 4px;\n}`;
  }, [styles]);

  const escapeHtml = (str) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const computeBlockSize = () => {
    const node = blockRef.current;
    if (!node) return { width: styles.width, height: 200 };
    const rect = node.getBoundingClientRect();
    return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
  };

  const buildFontFace = () => {
    if (!fontUrl) return '';
    const fam = styles.fontFamily.split(',')[0].trim().replace(/\s+/g, ' ');
    return `@font-face {\n  font-family: '${fam}';\n  src: url('${fontUrl}') format('${fontUrl.toLowerCase().endsWith('woff2') ? 'woff2' : 'woff'}');\n  font-weight: normal;\n  font-style: normal;\n}`;
  };

  // ---------- Export Method A: foreignObject (best visual fidelity) ----------
  const exportSVGForeignObject = () => {
    const { width, height } = computeBlockSize();

    // Ensure the HTML we embed is minimal and self-contained
    const html = `<div xmlns=\"http://www.w3.org/1999/xhtml\">\n  <style>\n    *{margin:0;box-sizing:border-box;}\n    ${buildFontFace()}\n    ${cssTextBlock}\n  </style>\n  <div class=\"text-block\">${escapeHtml(text).replace(/\n/g, '<br/>')}</div>\n</div>`;

    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\">\n  <!-- Background as vector rect for robust rendering -->\n  <rect width=\"100%\" height=\"100%\" fill=\"${styles.backgroundColor}\" rx=\"4\" ry=\"4\"/>\n  <foreignObject x=\"0\" y=\"0\" width=\"${width}\" height=\"${height}\">\n    ${html}\n  </foreignObject>\n</svg>`;

    triggerDownload(svg, 'typography_export_foreignObject.svg');
  };

  // ---------- Export Method B: pure SVG <text>/<tspan> (max compatibility) ----------
  // This method approximates wrapping (no justify). It measures with a hidden canvas.
  const exportSVGPure = () => {
    const { width } = computeBlockSize();
    const maxWidth = width - styles.padding * 2; // inner content width

    // Setup canvas for measuring
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontFamilyOnly = styles.fontFamily.split(',')[0];
    ctx.font = `${styles.fontSize}px ${fontFamilyOnly}`;

    const words = (text || '').split(/\s+/);
    const lines = [];
    let current = '';
    for (let w of words) {
      const trial = current ? current + ' ' + w : w;
      const metrics = ctx.measureText(trial);
      if (metrics.width > maxWidth && current) {
        lines.push(current);
        current = w;
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);

    const lineHeightPx = Math.round(styles.fontSize * styles.lineHeight);
    const height = styles.padding * 2 + lines.length * lineHeightPx;

    // Build tspans
    const tspans = lines
      .map((line, i) => {
        const y = styles.padding + styles.fontSize + i * lineHeightPx;
        return `    <tspan x=\"${styles.padding}\" y=\"${y}\">${escapeHtml(line)}</tspan>`;
      })
      .join('\n');

    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\">\n  <defs>\n    ${fontUrl ? `<style><![CDATA[${buildFontFace()}]]></style>` : ''}\n  </defs>\n  <rect width=\"100%\" height=\"100%\" fill=\"${styles.backgroundColor}\" rx=\"4\" ry=\"4\"/>\n  <text fill=\"${styles.color}\" font-family=\"${styles.fontFamily.split(',')[0]}\" font-size=\"${styles.fontSize}\" letter-spacing=\"${styles.letterSpacing}\" >\n${tspans}\n  </text>\n</svg>`;

    triggerDownload(svg, 'typography_export_pure.svg');
  };

  const triggerDownload = (svgString, filename) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styles.backgroundColor}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Textfarbe:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.color}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styles.color}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
            {/* Preset-Farben */}
<div className="mt-3">
  <div className="flex flex-wrap gap-2">
    {bgPresets.map((c) => (
      <button
        key={c.value}
        type="button"
        onClick={() => updateStyle('backgroundColor', c.value)}
        title={c.label}
        aria-label={c.label}
        className={`w-8 h-8 rounded border border-gray-300 hover:opacity-80 focus:outline-none
                    ${styles.backgroundColor === c.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{ backgroundColor: c.value }}
      />
    ))}
  </div>
</div>


            {/* Schriftart */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Schriftart:</label>
              <select
                value={styles.fontFamily}
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {fonts.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional: eingebettete Webfont-URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Optional: WOFF/WOFF2-URL zum Einbetten (CORS erlaubt):</label>
              <input
                type="url"
                placeholder="https://example.com/fonts/Montserrat.woff2"
                value={fontUrl}
                onChange={(e) => setFontUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Hinweis: Für Google Fonts direkt ist CORS meist blockiert. Besser selbst hosten.</p>
            </div>

            {/* Block-Breite */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Block-Breite: {styles.width}px</label>
              <input
                type="range"
                min="200"
                max="800"
                value={styles.width}
                onChange={(e) => updateStyle('width', parseInt(e.target.value))}
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
                onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
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
                onChange={(e) => updateStyle('letterSpacing', parseFloat(e.target.value))}
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
                onChange={(e) => updateStyle('wordSpacing', parseFloat(e.target.value))}
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
                onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value))}
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
                onChange={(e) => updateStyle('padding', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() =>
                setStyles({
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  width: 600,
                  letterSpacing: 0,
                  wordSpacing: 0,
                  lineHeight: 1.5,
                  fontSize: 16,
                  textAlign: 'justify',
                  padding: 20,
                  fontFamily: 'Arial, sans-serif',
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
                Export SVG – HTML (fidelity)
              </button>
              <button
                onClick={exportSVGPure}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Export SVG – Pure SVG
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tipp: Für Druckvorstufe nutze "Pure SVG" (höchste Kompatibilität). Für 1:1-Layout inkl. Blocksatz nutze "HTML (fidelity)".
            </p>
          </div>

          {/* Vorschau */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Live-Vorschau</h2>

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
                  maxWidth: '100%',
                  letterSpacing: `${styles.letterSpacing}px`,
                  wordSpacing: `${styles.wordSpacing}px`,
                  lineHeight: styles.lineHeight,
                  fontSize: `${styles.fontSize}px`,
                  textAlign: styles.textAlign,
                  padding: `${styles.padding}px`,
                  fontFamily: styles.fontFamily,
                  borderRadius: '0px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                className="transition-all duration-200"
              >
                {text || 'Hier wird dein Text angezeigt...'}
              </div>
            </div>

            {/* CSS Code */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Generierter CSS Code:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto text-gray-800">
                {`.text-block {\n  background-color: ${styles.backgroundColor};\n  color: ${styles.color};\n  width: ${styles.width}px;\n  letter-spacing: ${styles.letterSpacing}px;\n  word-spacing: ${styles.wordSpacing}px;\n  line-height: ${styles.lineHeight};\n  font-size: ${styles.fontSize}px;\n  text-align: ${styles.textAlign};\n  padding: ${styles.padding}px;\n  font-family: ${styles.fontFamily};\n}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLCSSPlayground;