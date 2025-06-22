#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const { parseEDFFile } = require('../EDFFile');
const {
  formDataArray,
  findMins,
  findInspirations,
  calcCycleBasedIndicators,
  inspirationAmplitude,
  prepIndices,
} = require('../FlowLimits');

async function readFileBuffer(filePath, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fs.promises.readFile(filePath);
    } catch (err) {
      if (i === attempts - 1) throw err;
    }
  }
}

async function processFile(filePath) {
  const buf = await readFileBuffer(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const fileData = parseEDFFile(ab);
  if (!fileData.signals || fileData.signals.length === 0) {
    throw new Error('Invalid or empty EDF file');
  }
  const dataArray = formDataArray(fileData);
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw new Error('No flow data found');
  }
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


function printHeader(headers, colWidths) {
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
  const sep = headers.map((h, i) => '-'.repeat(colWidths[i])).join('  ');
  console.log(headerRow);
  console.log(sep);
}

function printRow(row, headers, colWidths) {
  const line = headers
    .map((h, i) => String(row[h]).padEnd(colWidths[i]))
    .join('  ');
  console.log(line);
}

async function main() {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'DATALOG');
  const files = findEdfFiles(baseDir);
  if (files.length === 0) {
    console.log('No EDF files found in', baseDir);
    return;
  }

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
  const colWidths = headers.map(h => h.length);
  printHeader(headers, colWidths);

  for (const file of files) {
    try {
      const row = await processFile(file);
      printRow(row, headers, colWidths);
    } catch (err) {
      console.error('Failed to process', file, '-', err.message);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
