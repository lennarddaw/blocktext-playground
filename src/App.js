import React, { useState } from 'react';

const HTMLCSSPlayground = () => {
  const [text, setText] = useState('Hier ist dein Beispieltext. Du kannst diesen Text bearbeiten und verschiedene Typografie-Einstellungen ausprobieren. Der Text wird als Blocksatz dargestellt und du kannst alle wichtigen Parameter anpassen.');
  
  const [styles, setStyles] = useState({
    backgroundColor: '#ffffff',
    color: '#000000',
    width: 600,
    letterSpacing: 0,
    wordSpacing: 0,
    lineHeight: 1.5,
    fontSize: 16,
    textAlign: 'justify',
    padding: 20,
    fontFamily: 'Montserrat, sans-serif'
  });

  const updateStyle = (property, value) => {
    setStyles(prev => ({ ...prev, [property]: value }));
  };

  const fonts = [
    'Montserrat, sans-serif',
    'Helvetica, sans-serif', 
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Trebuchet MS, sans-serif'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          HTML/CSS Typography Playground
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kontrollelemente */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Einstellungen</h2>
            
            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text eingeben:
              </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hintergrundfarbe:
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Textfarbe:
                </label>
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

            {/* Schriftart */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schriftart:
              </label>
              <select
                value={styles.fontFamily}
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {fonts.map(font => (
                  <option key={font} value={font} style={{fontFamily: font}}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Block-Breite */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block-Breite: {styles.width}px
              </label>
              <input
                type="range"
                min="300"
                max="800"
                value={styles.width}
                onChange={(e) => updateStyle('width', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Schriftgröße */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schriftgröße: {styles.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={styles.fontSize}
                onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Letter Spacing */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buchstabenabstand: {styles.letterSpacing}px
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wortabstand: {styles.wordSpacing}px
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zeilenhöhe: {styles.lineHeight}
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Innenabstand: {styles.padding}px
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={styles.padding}
                onChange={(e) => updateStyle('padding', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setStyles({
                backgroundColor: '#ffffff',
                color: '#000000',
                width: 600,
                letterSpacing: 0,
                wordSpacing: 0,
                lineHeight: 1.5,
                fontSize: 16,
                textAlign: 'justify',
                padding: 20,
                fontFamily: 'Arial, sans-serif'
              })}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Zurücksetzen
            </button>
          </div>

          {/* Vorschau */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Live-Vorschau</h2>
            
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-96 flex items-start justify-center">
              <div
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
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
{`.text-block {
  background-color: ${styles.backgroundColor};
  color: ${styles.color};
  width: ${styles.width}px;
  letter-spacing: ${styles.letterSpacing}px;
  word-spacing: ${styles.wordSpacing}px;
  line-height: ${styles.lineHeight};
  font-size: ${styles.fontSize}px;
  text-align: ${styles.textAlign};
  padding: ${styles.padding}px;
  font-family: ${styles.fontFamily};
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLCSSPlayground;