// Kopiert die PDF.js-Laufzeit in die Weboberfläche.
// Dadurch importieren Browser und Tauri auch ohne Netzwerkverbindung PDF-Dateien.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'node_modules', 'pdfjs-dist', 'build');
const target = path.join(root, 'dist', 'vendor');
fs.mkdirSync(target, {recursive:true});
for (const name of ['pdf.min.js','pdf.worker.min.js']) {
  const from = path.join(source,name);
  if (!fs.existsSync(from)) {
    console.error('PDF.js fehlt. Zuerst im Projektordner npm install ausführen.');
    process.exit(1);
  }
  fs.copyFileSync(from, path.join(target,name));
}
console.log('PDF.js ist lokal verfügbar. PDFs benötigen beim Lernen keine CDN-Verbindung.');
