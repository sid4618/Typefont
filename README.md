# Typefont
Here I’m working on this algorithm that tries to recognize the font of a text in a photo. My goal is to obtain accurate results with the image as only input avoiding other manual processes.

## Usage
Import the compiled module then call the main function like in the following script.
The first argument can be: a string with the path of the image, a string with the base64 data of the image, the instance of a canvas or the instance of a image.
```javascript
import Typefont from "app";

Typefont("path/image.png")
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
```

You can build the project by using webpack.
```shell
webpack src/app.js build/app.js
```

## Preview
Text on the cover of a book (texts are in italian because I live in Italy).
![](http://i.imgur.com/BJU8Rtc.jpg)

Text on the cover of another book.
![](http://i.imgur.com/OklNkC6.png)

Screenshot of a text on a video from the web.
![](http://i.imgur.com/8ZEclQE.png)

Each font in the result has a percentage of similarity with the input image and a piece of information about the font.

## Why
I had just discovered the version of [Tesseract](http://tesseract.projectnaptha.com/) written in JavaScript and I noticed that he was also trying to identify the font, I wondered how to improve this process then I used Tesseract to
extract the letters from the input image, I created a new system that uses the [Jimp](https://github.com/oliver-moran/jimp) image processing library to compare the extracted letters with the fonts stored in a dedicated library.

## How it works?
The input image is passed to the optical character recognition after some filters based on its brightness. Then the symbols (letters) are extracted from the input image and compared with the symbols of the fonts in the database using a perceptual (Hamming distance) comparison and a pixel based comparison in order to obtain a percentage of similarity.

The symbols of fonts are just a JSON structure with letters as keys and the base64 of the image of the letter as value.
If you want to add a new font you must follow this structure.
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
Each key of the meta object is included in the final result.

## License
MIT License.