import React, { useMemo, useRef, useState, useEffect } from "react";
import opentype from 'opentype.js';

// Font Data URI - replace with actual base64-encoded WOFF2 data if available
const MONTSERRAT_WOFF2_DATA = ""; // Placeholder - add actual base64 WOFF2 data here

// Font cache to avoid reloading
const fontCache = new Map();

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

  // ---------- Font loading for outline export ----------
// ---------- Font loading for outline export (robust) ----------
const loadFont = async () => {
  // nur den Primärnamen ohne Fallbacks nehmen
  const fontName = (styles.fontFamily || '').split(',')[0].trim();

  // Wir unterstützen im Outlines-Export explizit Montserrat
  // (andere Web-/Systemfonts werden NICHT aus /public geladen)
  const isMontserrat = /^montserrat$/i.test(fontName);

  // Cache-Hit?
  if (fontCache.has(fontName)) return fontCache.get(fontName);

  try {
    let fontUrl = null;

    // 1) Bevorzugt: eingebettete Data-URI aus autoEmbed (TTF)
    if (isMontserrat && fontDataUrl && fontDataUrl.startsWith('data:font/ttf')) {
      fontUrl = fontDataUrl; // z. B. "data:font/ttf;base64,AAAA..."
    }

    // 2) Lokale TTF unter /public (funktioniert out-of-the-box mit CRA/Vite)
    if (!fontUrl && isMontserrat) {
      fontUrl = '/fonts/montserrat/Montserrat-VariableFont_wght.ttf';
    }

    // 3) Optionaler WOFF2-Fallback, falls vorhanden
    if (!fontUrl && isMontserrat) {
      fontUrl = '/fonts/montserrat/Montserrat.woff2';
    }

    // 4) Wenn kein Montserrat gewählt ist: Fall back auf Montserrat TTF,
    //    damit der Export verlässlich eine echte Datei hat.
    if (!fontUrl) {
      console.warn('Nicht unterstützte Schrift im Outlines-Export; fallback auf Montserrat.');
      fontUrl = '/fonts/montserrat/Montserrat-VariableFont_wght.ttf';
    }

    const font = await opentype.load(fontUrl);
    fontCache.set(fontName, font);
    return font;
  } catch (err) {
    console.error('opentype.load failed:', err);
    return null; // exportSVGOutlines zeigt bereits eine nutzerfreundliche Meldung
  }
};

  // ---------- Text tokenization ----------
  const tokenizeText = (text) => {
    const tokens = [];
    const paragraphs = text.split(/\n\s*\n/);
    
    paragraphs.forEach((paragraph, pIndex) => {
      if (pIndex > 0) {
        tokens.push({ type: 'paragraph', text: '', width: 0 });
      }
      
      const lines = paragraph.split('\n');
      lines.forEach((line, lIndex) => {
        if (lIndex > 0) {
          tokens.push({ type: 'newline', text: '', width: 0 });
        }
        
        // Split by spaces but preserve them
        const parts = line.split(/(\s+)/);
        parts.forEach(part => {
          if (!part) return;
          
          if (/^\s+$/.test(part)) {
            // Space token
            if (part === ' ') {
              tokens.push({ type: 'space', text: ' ', width: 0 });
            } else if (part === '\u00A0') {
              tokens.push({ type: 'nbsp', text: '\u00A0', width: 0 });
            } else {
              // Multiple spaces - treat as individual spaces
              for (let i = 0; i < part.length; i++) {
                tokens.push({ type: 'space', text: ' ', width: 0 });
              }
            }
          } else {
            // Word token - may contain soft hyphens
            tokens.push({ type: 'word', text: part, width: 0 });
          }
        });
      });
    });
    
    return tokens;
  };

  // ---------- Token width measurement ----------
  const measureTokenWidth = (font, token, fontSize, letterSpacing, wordSpacing) => {
    if (!font) return 0;
    
    if (token.type === 'space') {
      const spaceWidth = font.getAdvanceWidth(' ', fontSize);
      return spaceWidth + wordSpacing;
    }
    
    if (token.type === 'nbsp') {
      const spaceWidth = font.getAdvanceWidth('\u00A0', fontSize);
      return spaceWidth + wordSpacing;
    }
    
    if (token.type === 'word') {
      let totalWidth = 0;
      const text = token.text.replace(/\u00AD/g, ''); // Remove soft hyphens for width calculation
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const glyph = font.charToGlyph(char);
        if (glyph) {
          totalWidth += glyph.advanceWidth / font.unitsPerEm * fontSize;
        }
        if (i < text.length - 1) {
          totalWidth += letterSpacing;
        }
      }
      
      return totalWidth;
    }
    
    return 0;
  };

  // ---------- Line layout algorithm ----------
  const layoutLines = (tokens, font, params) => {
    const lines = [];
    let currentLine = [];
    let currentWidth = 0;
    let currentLineSpaces = 0;
    
    const { width: blockWidth, fontSize, letterSpacing, wordSpacing } = params;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (token.type === 'paragraph' || token.type === 'newline') {
        // End current line
        if (currentLine.length > 0) {
          lines.push({
            tokens: currentLine,
            naturalWidth: currentWidth,
            numSpaces: currentLineSpaces,
            endsWithHyphen: false
          });
        }
        currentLine = [];
        currentWidth = 0;
        currentLineSpaces = 0;
        continue;
      }
      
      const tokenWidth = measureTokenWidth(font, token, fontSize, letterSpacing, wordSpacing);
      token.width = tokenWidth;
      
      // Check if token fits in current line
      if (currentWidth + tokenWidth <= blockWidth || currentLine.length === 0) {
        currentLine.push(token);
        currentWidth += tokenWidth;
        if (token.type === 'space') {
          currentLineSpaces++;
        }
      } else {
        // Token doesn't fit - handle word breaking for long words
        if (token.type === 'word' && token.text.includes('\u00AD')) {
          // Try to break at soft hyphen
          const parts = token.text.split('\u00AD');
          let bestBreakIndex = -1;
          let testWidth = currentWidth;
          
          for (let j = 0; j < parts.length - 1; j++) {
            const partText = parts.slice(0, j + 1).join('');
            const partWidth = measureTokenWidth(font, { type: 'word', text: partText }, fontSize, letterSpacing, wordSpacing);
            const hyphenWidth = measureTokenWidth(font, { type: 'word', text: '-' }, fontSize, letterSpacing, wordSpacing);
            
            if (testWidth + partWidth + hyphenWidth <= blockWidth) {
              bestBreakIndex = j;
            } else {
              break;
            }
          }
          
          if (bestBreakIndex >= 0) {
            // Break at soft hyphen
            const beforeHyphen = parts.slice(0, bestBreakIndex + 1).join('');
            const afterHyphen = parts.slice(bestBreakIndex + 1).join('\u00AD');
            
            // Add first part with hyphen to current line
            const firstPart = { type: 'word', text: beforeHyphen, width: 0 };
            firstPart.width = measureTokenWidth(font, firstPart, fontSize, letterSpacing, wordSpacing);
            const hyphenToken = { type: 'word', text: '-', width: 0 };
            hyphenToken.width = measureTokenWidth(font, hyphenToken, fontSize, letterSpacing, wordSpacing);
            
            currentLine.push(firstPart, hyphenToken);
            lines.push({
              tokens: currentLine,
              naturalWidth: currentWidth + firstPart.width + hyphenToken.width,
              numSpaces: currentLineSpaces,
              endsWithHyphen: true
            });
            
            // Start new line with remaining part
            const remainingToken = { type: 'word', text: afterHyphen, width: tokenWidth };
            currentLine = [remainingToken];
            currentWidth = remainingToken.width;
            currentLineSpaces = 0;
            continue;
          }
        }
        
        // No break possible or regular line break
        if (currentLine.length > 0) {
          lines.push({
            tokens: currentLine,
            naturalWidth: currentWidth,
            numSpaces: currentLineSpaces,
            endsWithHyphen: false
          });
        }
        
        currentLine = [token];
        currentWidth = tokenWidth;
        currentLineSpaces = token.type === 'space' ? 1 : 0;
      }
    }
    
    // Add final line
    if (currentLine.length > 0) {
      lines.push({
        tokens: currentLine,
        naturalWidth: currentWidth,
        numSpaces: currentLineSpaces,
        endsWithHyphen: false
      });
    }
    
    return lines;
  };

  // ---------- Path generation ----------
  const buildPathData = (font, lines, params) => {
    if (!font || !lines.length) return '';
    
    const {
      fontSize,
      lineHeight,
      letterSpacing,
      wordSpacing,
      textAlign,
      textAlignLast,
      paddingLeft,
      paddingTop,
      width: blockWidth
    } = params;
    
    const ascent = font.ascender / font.unitsPerEm * fontSize;
    const lineAdvance = Math.round(fontSize * lineHeight);
    let allPaths = [];
    
    lines.forEach((line, lineIndex) => {
      const y = paddingTop + ascent + lineIndex * lineAdvance;
      let x = paddingLeft;
      
      // Determine alignment for this line
      const isLastLineOfParagraph = lineIndex === lines.length - 1 || 
        (lineIndex < lines.length - 1 && lines[lineIndex + 1].tokens[0]?.type === 'paragraph');
      
      const currentAlign = isLastLineOfParagraph ? 
        (textAlignLast === 'auto' ? textAlign : textAlignLast) : textAlign;
      
      let offsetX = 0;
      let extraSpacePerWord = 0;
      
      if (currentAlign === 'center') {
        offsetX = (blockWidth - line.naturalWidth) / 2;
      } else if (currentAlign === 'right') {
        offsetX = blockWidth - line.naturalWidth;
      } else if (currentAlign === 'justify' && line.numSpaces > 0 && !isLastLineOfParagraph) {
        const extraSpace = blockWidth - line.naturalWidth;
        extraSpacePerWord = extraSpace / line.numSpaces;
      }
      
      x += offsetX;
      
      line.tokens.forEach(token => {
        if (token.type === 'word') {
          // Generate path for each character
          const text = token.text.replace(/\u00AD/g, ''); // Remove soft hyphens
          let charX = x;
          
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const glyph = font.charToGlyph(char);
            
            if (glyph && glyph.path) {
              const glyphPath = glyph.getPath(charX, y, fontSize);
              if (glyphPath) {
                allPaths.push(glyphPath.toPathData());
              }
            }
            
            if (glyph) {
              charX += glyph.advanceWidth / font.unitsPerEm * fontSize;
            }
            if (i < text.length - 1) {
              charX += letterSpacing;
            }
          }
          
          x = charX;
        } else if (token.type === 'space') {
          const spaceWidth = font.getAdvanceWidth(' ', fontSize);
          x += spaceWidth + wordSpacing + extraSpacePerWord;
        } else if (token.type === 'nbsp') {
          const spaceWidth = font.getAdvanceWidth('\u00A0', fontSize);
          x += spaceWidth + wordSpacing;
        }
      });
    });
    
    return allPaths.join(' ');
  };

  // ---------- Main outline export function ----------
  const exportSVGOutlines = async () => {
    try {
      const font = await loadFont();
      if (!font) {
        alert('Font konnte nicht geladen werden. Bitte überprüfen Sie, ob die Schriftdatei verfügbar ist.');
        return;
      }
      
      const tokens = tokenizeText(text);
      
      const layoutParams = {
        width: styles.width,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        wordSpacing: styles.wordSpacing,
        textAlign: styles.textAlign,
        textAlignLast: styles.alignLast,
        paddingLeft: styles.paddingLeft,
        paddingTop: styles.padding
      };
      
      const lines = layoutLines(tokens, font, layoutParams);
      const pathData = buildPathData(font, lines, layoutParams);
      
      // Calculate SVG dimensions
      const svgWidth = styles.paddingLeft + styles.width + styles.paddingRight;
      const lineAdvance = Math.round(styles.fontSize * styles.lineHeight);
      const svgHeight = styles.padding + 
        (lines.length > 0 ? lines.length * lineAdvance - (lineAdvance - styles.fontSize) : styles.fontSize) + 
        styles.padding;
      
      // Build SVG
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <desc>${escapedText}</desc>
  <rect width="100%" height="100%" fill="${styles.backgroundColor}"/>
  ${pathData ? `<path d="${pathData}" fill="${styles.color}"/>` : ''}
</svg>`;

      triggerDownload(svg, "blocktext_outlines.svg");
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export fehlgeschlagen: ' + error.message);
    }
  };

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
            <div className="mt-6 space-y-3">
              <button
                onClick={exportSVGForeignObject}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Export SVG – 1:1 (embedded Montserrat)
              </button>
              
              <button
                onClick={exportSVGOutlines}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Export SVG – Outlines (Full Path)
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