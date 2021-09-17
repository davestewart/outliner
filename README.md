# Outliner

![outliner logo](https://raw.githubusercontent.com/davestewart/outliner/master/assets/artwork/outliner-logo.png)

## Intro

Outliner is a Node package that converts SVG strokes to outlined fills:

![process](https://raw.githubusercontent.com/davestewart/outliner/master/assets/artwork/process.png)

Converting strokes to fills *after* exporting from packages such as  [Figma](https://twitter.com/figmadesign) or [Sketch](https://twitter.com/sketch) lets you retain the flexibility of useful features such as corner radii within the authoring application.

This is ideal for icon creators; no more locking in those curves and losing your vector tweaks!

## Getting started

To use Outliner, you will need [Node](https://nodejs.org/en/) and NPM installed.

Once installed, there are two ways to use Outliner:

- as a **[service](#running-as-a-service)**, where you watch a source folder and convert files as you export them
- as a **[dependency](#running-as-a-dependency)**, where you use the conversion functions Outliner exposes in your own project

If you want to run Outliner from anywhere on your machine, install **globally** and run as a **service**.

## Running as a service

### As a global service

> Best for designers working alone

Open a terminal prompt and install the package globally:

```bash
npm install @davestewart/outliner --global
```

To start converting, call the `outliner` service passing `source` and (optional) `target` paths:

```
node outliner <source> <target>
```

Note:

- paths can be relative or absolute
- if you omit `target`, your `source` files will overwritten in place

Outliner will immediately run and start converting files:

```
┌──────────────────────┬─────────┬───────┬──────────┐
│ files (9)            │ state   │ paths │ autosize │
├──────────────────────┼─────────┼───────┼──────────┤
│ icon-file-import     │ updated │ 2     │ true     │
│ icon-folder-bookmark │ updated │ 2     │ true     │
│ icon-folder          │ updated │ 1     │ true     │
│ icon-remove-window   │ updated │ 2     │ true     │
│ logo-bad             │ updated │ 0     │ true     │
│ logo-good            │ updated │ 1     │ true     │
│ star-bevel           │ updated │ 1     │ true     │
│ star-mitre           │ updated │ 1     │ true     │
│ star-rounded         │ updated │ 1     │ true     │
└──────────────────────┴─────────┴───────┴──────────┘
```

The service will continue to watch the folder, and any further exports will be detected and converted automatically.

Note:

- to stop the service, press `Ctrl+C`
- files *without* stroked paths are skipped, or copied to `target` without changes 
- to optionally remove `width` and `height` information (so they resize nicely) pass the `--autosize` flag:

```
node outliner <source> <target> --autosize
```

### As a project service

> Best for designers working in teams

You can also run Outliner as a service **within** a JavaScript project.

This makes it simple for *anyone* who is working with the project source to update assets.

This time, install Outliner *locally*:

```bash
npm install @davestewart/outliner --save-dev
```

Then, add an entry to your project's `package.json` scripts, e.g.:

```json
{
  "scripts": {
    "outline-icons": "node outliner <source> <target> --watch --unsize"
  }
}
```

You can then run the script like so:

```bash
npm run outline-icons
```

Outliner will start and watch the folder you specify in `<source>` and `<target>`.

## Running as a dependency

> Best for developers who need to manipulate SVGs

Outliner is a typical dependency that you install and use like any other package.

Install as usual:

```bash
npm i @davestewart/outliner --save-dev
```

There are two functions exposed:

- `outlineFile()` - loads a file, outlines it, and returns or saves the result
- `outlineSvg()` - outlines SVG text only

Converting files should be straightforward:

```js
// import dependencies
import { outlineFile, outlineSvg } from '@davestewart/outliner'

// convert a file and save a copy
outlineFile('./assets/src/star.svg', './assets/trg/star.svg')

// convert a file and save in place
outlineFile('./assets/src/star.svg')

// convert existing SVG text
const output = outlineSvg(input)
```

Note that you can also pass a couple of extra arguments to:

- change how Outliner behaves
- log task information

For example:

```js
// variables
const tasks = ['outline'] // outline but don't strip width and height
const log = {}            // object to collect logging info

// convert
outlineFile('./assets/src/star.svg', './assets/trg/star.svg', tasks, log)

// debug
console.log(log)
```

The log object will be populated by each of the tasks that ran:

```
{
  paths: 1,
  autosize: true
}
```

Note that the `tasks` array also accepts custom functions:

```js
function replaceColor (svg, log) {
  log.replaceColor = true
  return svg.replace(/#000000/g, '#FF0000')
}
outlineSvg(svg, ['outline', replaceColor], log)
```

Check the `tests/index.js` file for working code.

## API

#### Outline File

> Outlines a source file and overwrites or writes the results to a new file

Signature:

```ts
outlineFile(srcPath: string, trgPath?: string, tasks?: string[], log?: object)
```

Parameters:

- `srcPath`: a relative or absolute path to a source folder
- `trgPath`: an optional relative or absolute path to a target folder
- `tasks`: an array of task names to run; defaults to `['outline', 'autosize']`
- `log`: an optional `{}` object to receive logging information

#### Outline SVG

> Outlines SVG text and returns the result

Signature:

```js
outlineSvg(svg: string, tasks?: string[], log?: object)
```

Parameters:

- `svg`: valid SVG text
- `tasks`: an array of task names  to run; defaults to `['outline', 'autosize']`
- `log`: an optional `{}` object to receive logging information

## Demos

> If you clone the repo, you will be able to play with the demo.

Run the demo with:

```
npm run demo
```

You can compare the `source` and `target` output in Figma, Sketch, or a text editor.

If you want to tweak and re-export the source files, Outliner will pick up any changes and update the target folder each time you export.
