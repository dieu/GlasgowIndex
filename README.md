# GlasgowIndex CLI

This repository includes a script for summarising EDF files in a `DATALOG` directory.

## Usage

Run the CLI passing the path to your `DATALOG` directory. The script will search
recursively for `*_BRP.edf` files, analyse each one and print a table of
breathing indices:

```bash
node cli/processDatalog.js /path/to/DATALOG
```
