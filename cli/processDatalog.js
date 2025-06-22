const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScript(file) {
  const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const context = { console };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

const edfCtx = loadScript('EDFFile.js');
const flowCtx = loadScript('FlowLimits.js');

const parseEDFFile = edfCtx.parseEDFFile;
const {
  formDataArray,
  findMins,
  findInspirations,
  calcCycleBasedIndicators,
  inspirationAmplitude,
  prepIndices,
} = flowCtx;

function processFile(filePath) {
  const buf = fs.readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const fileData = parseEDFFile(ab);
  const dataArray = formDataArray(fileData);
  findMins(dataArray);
  const results = {};
  findInspirations(dataArray, results);
  calcCycleBasedIndicators(dataArray, results);
  inspirationAmplitude(dataArray, results);
  const indices = prepIndices(results);
  const date = fileData.startDateTime.toISOString().slice(0, 10);
  return { date, ...indices };
}

function findEdfFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findEdfFiles(p));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith('_brp.edf')
    ) {
      out.push(p);
    }
  }
  return out;
}

function printTable(rows) {
  const headers = [
    'date',
    'overall',
    'skew',
    'flatTop',
    'spike',
    'topHeavy',
    'multiPeak',
    'noPause',
    'inspirRate',
    'multiBreath',
    'ampVar',
  ];
  const colWidths = headers.map(h => Math.max(h.length, ...rows.map(r => String(r[h]).length)));
  const sep = headers.map((h, i) => '-'.repeat(colWidths[i])).join('  ');
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
  console.log(headerRow);
  console.log(sep);
  for (const row of rows) {
    const line = headers.map((h, i) => String(row[h]).padEnd(colWidths[i])).join('  ');
    console.log(line);
  }
}

function main() {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'DATALOG');
  const files = findEdfFiles(baseDir);
  if (files.length === 0) {
    console.log('No EDF files found in', baseDir);
    return;
  }
  const rows = files.map(processFile);
  printTable(rows);
}

if (require.main === module) {
  main();
}
