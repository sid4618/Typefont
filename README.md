# Typefont
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/sirvasile)

Typefont allows you to recognize the font of a text in a photo using a set of algorithms and libraries with the goal to obtain accurate results with the image as only input avoiding other manual processes. This is the only open source project of its kind.

## Usage
Import the main function and invoke it like in the following script.
```javascript
import {Typefont} from "./src/index.js";

Typefont("path/image.png").then((res) => console.table(res));
```
The first argument can be the `path` or the `base64` of the image. The function returns a Promise which when is resolved returns an array (containing each font compared) which is ordered in descending order (considering the similarity percentage).

## Preview
Text on the cover of a book (texts are in italian because I live in Italy).
![](http://i.imgur.com/1JnyIC3.jpg)

Text on the cover of another book.
![](http://i.imgur.com/smfr0Kn.jpg)

## Why
I had just discovered the version of [Tesseract](http://tesseract.projectnaptha.com/) written in JavaScript and I noticed that he was also trying to identify the font, I wondered how to improve this process then I used Tesseract to
extract the letters from the input image, created a new system that uses the [Jimp](https://github.com/oliver-moran/jimp) image processing library to compare the extracted letters with the fonts stored in a dedicated library and wrote a dedicated algorithm for comparison in order to obtain more accurate results.

## Options
You can pass an object with options as second argument.

Option | Type | Description | Default
--- | --- | --- | ---
`progress` | `Function` | A function which is called every time the comparison with a font is completed. | `undefined`
`minSymbolConfidence` | `Number` | The minimum confidence that a symbol must have to be accepted in the comparison queue (the confidence value is assigned by the OCR engine). | `15`
`analyticComparisonThreshold` | `Number` | The threshold of the analytic comparison. | `0.5`
`analyticComparisonScaleToSameSize` | `Boolean` | Scale the symbols to the same size before the analytic comparison? | `false`
`analyticComparisonSize` | `Number` | Used as dimension when resizing the images to the same size during the analytic comparison. | `128`
`perceptualComparisonSize` | `Number` | Used as dimension when resizing the images to the same size during the perceptual comparison. | `64`
`fontsDirectory` | `String` | The URL of the directory containing the fonts. | `storage/fonts/`
`fontsData` | `String` | The name of the file containing the JSON data of a font. | `data.json`
`fontsIndex` | `String` | The URL of the fonts index JSON file. | `storage/index.json`
`fontRequestTimeout` | `Number` | Font request timeout [ms]. | `2000`
`textRecognitionTimeout` | `Number` | Text recognition timeout [s]. | `60`
`textRecognitionBinarization` | `Boolean` | Binarize the image before the recognition? | `true`

### Example
Example with options.
```javascript
Typefont("path/image.png", {
    minSymbolConfidence: 50,
    analyticComparisonScaleToSameSize: true,
    analyticComparisonSize: 256
}).then((res) => console.table(res));
```

## How it works?
Short summary: the input image is passed to the optical character recognition after some filters based on its brightness. The symbols (letters) are extracted from the input image and compared with the symbols of the fonts in the database using a perceptual comparison and a pixel based comparison in order to obtain a percentage of similarity.

## How to add a font
The fonts stored in this database are just a JSON structure with letters as keys and the base64 of the image of the letter of the font as value. If you want to add a new font you must follow this structure.
```javascript
{
    "meta": {
        "name": "name",
        "author": "author",
        "uri": "uri",
        "license": "license",
        "key": "value",
        ...
    },
    "alpha": {
        "a": "base64",
        "b": "base64",
        "c": "base64",
        ...
    }
}
```
Then you have to include your font in the index of fonts by adding the font name to the array.
I'm working on a system that automatically generates the JSON structure starting from a `.ttf` font file.

## Author
[Vasile Pește](https://twitter.com/Sirvasile_).

## License
[MIT License](LICENSE).