# GlasgowIndex CLI

This repository includes a script for summarising EDF files in a `DATALOG` directory.

## Usage

Place your EDF files under a folder named `DATALOG` at the project root. Files can be
inside subfolders. Run the CLI with Node:

```bash
node cli/processDatalog.js
```

The script searches recursively for `*.edf` files, analyses each file and prints a
table containing breathing indices for every recording.
