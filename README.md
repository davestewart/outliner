# Outliner

![outliner logo](https://raw.githubusercontent.com/davestewart/outliner/master/assets/artwork/outliner-logo.png)

> A node script to post-process the outlining of SVG paths

## Intro

Outliner lets you maintain flexibility with strokes in [@Figma](https://twitter.com/figma), [@Sketch](https://twitter.com/sketch) or other drawing packages, as it generates outlines as a post-export step.

Ideal for icon creators; no more locking in those curves and losing your vector tweaks!

## Installation

Download this repo and run locally (proper package install coming at some point).

## Usage

Run the following script to watch a `source` folder for updates, and copy updated SVGs to a `target` folder:

```
npm run watch <source> <target>
```

If you omit `target` source files will overwritten in place.

Note that files *without* stroked paths are simply copied (or skipped if source and target are the same).

## Demo

Run the demo with:

```
npm run watch demo/source demo/target
```

