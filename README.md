# GlasgowIndex CLI

This repository includes a script for summarising EDF files in a `DATALOG` directory.

## Usage

Run the CLI passing the path to your `DATALOG` directory. The script searches
recursively for `*_BRP.edf` files. Files are processed from newest to oldest and
a row is printed as soon as each file finishes:

```bash
node cli/processDatalog.js /path/to/DATALOG
```

If a file cannot be parsed it will be skipped and an error reported.

Example output:

```
date          overall    skew    flatTop    spike    topHeavy    multiPeak    noPause    inspirRate    multiBreath    ampVar
----------  ---------  ------  ---------  -------  ----------  -----------  ---------  ------------  -------------  --------
2025-06-10  0.23       0.10    0.05       0.00     0.02        0.03         0.01       12            0.00           0.02
```
