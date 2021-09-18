# Outliner

![outliner logo](https://raw.githubusercontent.com/davestewart/outliner/master/assets/artwork/outliner-logo.png)

## Intro

Outliner is a Node package that converts SVG strokes to outlined fills as a *post-export* process:

![process](https://raw.githubusercontent.com/davestewart/outliner/master/assets/artwork/process.png)

There are several reasons why retaining strokes within software such as [Figma](https://twitter.com/figmadesign) or [Sketch](https://twitter.com/sketch) is preferable:

- strokes allow you to adjust widths and corner radii on the fly
- outlined objects cannot be changed once outlined
- union operators close open paths (Sketch) or create heavy exports (Figma)

This tool is designed for:

- icon creators; no more locking in those curves and losing your vector tweaks!
- developers; work with clean SVG conversions and manipulate attributes in code

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
- To remove `width` and `height` information (so they resize nicely) pass the `--autosize` flag:

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

Then, add a script entry to your project's `package.json`, e.g.:

```json
{
  "scripts": {
    "outline-icons": "node outliner <source> <target> --autosize"
  }
}
```

You can then run the Outliner service like so:

```bash
npm run outline-icons
```

Outliner will start and watch the folder you specify in `<source>` and output to `<target>`.

### Logging

Once the service is running, Outliner will start converting files and logging results:

```
┌──────────────────────┬───────────┬───────┬──────────┐
│ files (9)            │ state     │ paths │ autosize │
├──────────────────────┼───────────┼───────┼──────────┤
│ icon-file-import     │ updated   │ 2     │ true     │
│ icon-folder-bookmark │ updated   │ 2     │ true     │
│ icon-folder          │ updated   │ 1     │ true     │
│ icon-remove-window   │ updated   │ 2     │ true     │
│ joints/star-bevel    │ no change │ 1     │ true     │
│ joints/star-mitre    │ no change │ 1     │ true     │
│ joints/star-rounded  │ no change │ 1     │ true     │
│ fills/logo-bad       │ copied    │ 0     │ true     │
│ fills/logo-good      │ copied    │ 1     │ true     │
└──────────────────────┴───────────┴───────┴──────────┘
```

The service will continue to watch the `source` folder, and any further exports will be detected, converted and logged automatically.

The available states are:

```
no file       -> the source file did not exist
no input      -> the source file contained no data
no write      -> no target file was written, only the output returned
no change     -> no change between output and target, so no file are updated
updated       -> the new output was different from the old, so the target was updated
copied        -> the source file did not exist in the target folder, so was copied
```

Note:

- files *without* stroked paths are skipped, or copied to `target` without changes
- to stop the service, press `Ctrl+C`

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

// get the converted output but don't save
const output = outlineFile('./assets/src/star.svg', false)

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
  autosize: true,
  state: 'updated'
}
```

Note that you can also pass custom functions as `tasks`:

```js
function replaceColor (svg, log) {
  log.replaceColor = true
  return svg.replace(/#000000/g, 'currentColor')
}

outlineSvg(svg, ['outline', replaceColor], log)
```

Check the `tests/index.js` file for working code.

## API

#### Outline File

> Outlines a source file and overwrites or writes the results to a new file

Signature:

```ts
outlineFile(src: string, trg?: string | false | null, tasks?: Array<string | Function>, log?: object)
```

Parameters:

- `src`: a relative or absolute path to a source folder
- `trg`: an optional relative or absolute path to a target folder
  - pass `undefined` to use the same `src` 
  - Pass `false` or `null` to skip writing and just return the output 
- `tasks`: an array of tasks to run, defaults to `['outline', 'autosize']`
  - string tasks should be one of `'outline'` or`'autosize'`
  - functions should be of the format `(svg: string, log: object) => {}: string`  
- `log`: an optional `{}` object to receive logging information

#### Outline SVG

> Outlines SVG text and returns the result

Signature:

```js
outlineSvg(svg: string, tasks?: Array<string | Function>, log?: object)
```

Parameters:

- `svg`: valid SVG text
- `tasks`: an array of tasks to run, defaults to `['outline', 'autosize']`
  - string tasks should be one of `'outline'` or`'autosize'`
  - functions should be of the format `(svg: string, log: object) => {}: string` 
- `log`: an optional `{}` object to receive logging information

#### State

> An object of constants to compare against

The `log.state` for each file operation will contain one of these values:

```js
State.NO_FILE   = 'no file' 
State.NO_DATA   = 'no data' 
State.NO_WRITE  = 'no write' 
State.NO_CHANGE = 'no change' 
State.UPDATED   = 'updated' 
State.COPIED    = 'copied'
```

## Demos

> If you clone the repo, you will be able to play with the demo.

Run the demo with:

```
npm run demo
```

You can compare the `source` and `target` output in Figma, Sketch, or a text editor.

If you want to tweak and re-export the source files, Outliner will pick up any changes and update the target folder each time you export.
