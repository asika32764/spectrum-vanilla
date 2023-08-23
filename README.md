# Spectrum Vanilla

![alt text](https://github.com/asika32764/spectrum-vanilla/blob/master/docs/spectrum.png?raw=true "Preview")

Based on popular <a href="http://seballot.github.com/spectrum">Spectrum2</a> package. 
This version rewrote with TypeScript and drop IE support.

Created by @bgrins and @seballot, modified by @asika32764

### Basic Usage

Head over to the [Documentation Website](https://about.asika.tw/spectrum-vanilla/) for more information.

```html
<script src='dist/spectrum.js'></script>
<link rel='stylesheet' href='dist/spectrum.css' />

<input id='colorpicker' />

<script>
    Spectrum.create("#colorpicker", {
        color: "#f00"
    });
</script>
```

### npm

Spectrum is registered as package with npm. It can be installed with:

```shell
npm install spectrum-vanilla
```

### Using spectrum with a CDN

```html
<script src="https://unpkg.com/spectrum-vanilla/dist/spectrum.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://unpkg.com/spectrum-vanilla/dist/spectrum.min.css">

<!-- Dark theme -->
<link rel="stylesheet" type="text/css" href="https://unpkg.com/spectrum-vanilla/dist/spectrum-dark.min.css">
```

### Download

[Download latest version](https://github.com/asika32764/spectrum-vanilla/releases)

### Internationalization

If you are able to translate the text in the UI to another language, please do!  You can do so by either [filing a pull request](https://github.com/asika32764/spectrum-vanilla/pulls) or [opening an issue]( https://github.com/asika32764/spectrum-vanilla/issues) with the translation. The existing languages are listed at: https://github.com/asika32764/spectrum-vanilla/tree/master/src/i18n

## Contribution

I'm just a maintainer, if you need some new features or found a bug, feel free to open a Pull-Request.

## Building

```shell
yarn build # build uncompressed JS
yarn watch # build and watch
yarn build:css # build css files
```

More actions please see `package.json`

## Test

Modify `test/tests.js` and open `test/index.html` to check the test result.
