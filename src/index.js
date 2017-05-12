/**
 * @module Typefont Used to recognize the font of a text in a image.
 * @author Vasile Pește <sirvasile@protonmail.ch>
 * @version 0.1-beta.0
*/

import {FontStorage} from "./font/fontstorage";
import {ImageDrawing} from "./image/imagedrawing";
import {OpticalRecognition} from "./recognition/opticalrecognition";
import {AnalyticPerception} from "./comparison/analytic";
import {ShapePerception} from "./comparison/shape";

export const Typefont = (

    function (undefined)
    {
        // Used as global options.
        const _OPTIONS = {
            // The minimum confidence that a symbol must have to be accepted in the comparison queue.
            // The confidence value is assigned by the OCR engine.
            minSymbolConfidence: 15,
            
            // Used as pixel based image comparison threshold.
            analyticComparisonThreshold: 0.5,
            
            // Scale the images to the same size before comparison?
            sameSizeComparison: false,
            
            // Recognition timeout [s].
            recognitionTimeout: 60,
            
            // The URL of the directory containing the fonts.
            fontsDirectory: "storage/fonts/",
            
            // The name of the file containing the JSON data of a font.
            fontsData: "data.json",
            
            // The URL of the fonts index JSON file.
            fontsIndex: "storage/index.json"
        };
        
        /**
         * _symbolsToBase64 Get the base64 data image/png of the symbols recognized in a image.
         * @param {ImageDrawing} img The ImageDrawing instance of the recognized image.
         * @param {Object} res The result of the recognition process.
         * @return {Object}
        */
        
        const _symbolsToBase64 = (img, res) => {
            const data = {};
            const symbols = res.symbols;
            
            // This will skip double letters!
            // Note the confidence condition.
            for (const symbol of symbols)
                if (symbol.confidence >= _OPTIONS.minSymbolConfidence)
                    data[symbol.text] = img.crop(symbol.bbox.x0, symbol.bbox.y0, symbol.bbox.x1, symbol.bbox.y1);
            
            return data;
        };
        
        /**
         * _needReverse Check if a binarized ImageDrawing instance must be reversed (necessary for the comparison).
         * @param {Array} data The data of the ImageDrawing instance.
         * @return {Boolean}
        */
        
        const _needReverse = (data) => {
            let black = 0;
            let white = 0;
            
            for (let i = 0, ll = data.length; i < ll; i += 4)
                if (!data[i])
                    ++black;
                else
                    ++white;
            
            return black > white;
        };
        
        /**
         * _symbolsToDomain Remove the single symbols from two lists of symbols.
         * @param {Object} first The first list of symbols.
         * @param {Object} second The second list of symbols.
        */
        
        const _symbolsToDomain = (first, second) => {
            for (let key in first)
                if (!second[key])
                    delete first[key];
            
            for (let key in second)
                if (!first[key])
                    delete second[key]; 
        };
        
        /**
         * _prepareImageRecognition Load and recognize the symbols and text in a image.
         * @param {String} url The URL of the image to recognize.
         * @return {Promise}
        */
        
        const _prepareImageRecognition = (url) => {
            return new Promise((resolve, reject) => {
                const image = new ImageDrawing();
                
                image.draw(url).then(() => {
                    image.binarize();
                    
                    if (_needReverse(image.data))
                        image.reverse();
                    
                    const timeout = setTimeout(() => reject(`Unable to recognize ${url}`), _OPTIONS.recognitionTimeout * 1000);
                    
                    OpticalRecognition(image.toDataURL()).then((res) => {
                        clearTimeout(timeout);
                        res.symbolsBase64 = _symbolsToBase64(image, res);
                        res.pivot = image;
                        resolve(res);
                    }).catch(reject);
                }).catch(reject);
            });
        };
        
        /**
         * _prepare Load the font index and the image recognition process by calling _prepareFontsIndex and _prepareImageRecognition.
         * @param {String} url The URL of the image to recognize.
         * @return {Promise}
        */
        
        const _prepare = (url) => {
            return new Promise((resolve, reject) => {
                Promise.all([
                    _prepareImageRecognition(url),
                    FontStorage.prepareFontsIndex(_OPTIONS.fontsIndex)
                ]).then((res) => {
                    resolve({
                        recognition: res[0],
                        fonts: res[1]
                    });
                }).catch(reject);
            });
        };
        
        /**
         * _compare Compare two lists of symbols using a perceptual and a pixel based image comparison.
         * @param {Object} first The first list of symbols.
         * @param {Object} second The second list of symbols.
         * @return {Promise}
        */
        
        const _compare = (first, second) => {
            return new Promise((resolve, reject) => {
                const todo = Object.keys(first).length;
                const result = {};
                const finalize = (symbol, res) => {
                    ++done;
                    
                    result[symbol] = res;
                    
                    if (done == todo)
                        resolve(result);
                };
                let done = 0;
                
                for (const symbol in first)
                {
                    Promise.all([
                        AnalyticPerception(first[symbol], second[symbol], _OPTIONS.analyticComparisonThreshold, _OPTIONS.sameSizeComparison),
                        ShapePerception(first[symbol], second[symbol])
                    ]).then((res) => {
                        finalize(symbol, {
                            analytic: res[0],
                            shape: res[1]
                        });
                    }).catch(reject);
                }
            });
        };
        
        /**
         * _average Used to compute the average similarity of a given font comparison result of the _recognize process.
         * @param {Object} res
         * @return {Number}
        */
        
        const _average = (res) => {
            let calc = 0;
            let ll = 0;
            
            for (const symbol in res)
            {
                calc += (res[symbol].analytic + res[symbol].shape) / 2;
                ++ll;
            }
            
            return calc / ll;
        };
        
        /**
         * _recognize Start the process to recognize the font of a text in a image.
         * @param {String} url The URL of the image.
         * @param {Object} [options = {}]
         * @return {Promise}
        */
        
        const _recognize = (url, options = {}) => {
            for (const option in options)
                _OPTIONS[option] = options[option];
            
            return new Promise((resolve, reject) => {
                _prepare(url).then((res) => {
                    const fonts = res.fonts.index;
                    const todo = fonts.length;
                    const result = [];
                    const progress = _OPTIONS.progress;
                    const recognition = res.recognition.symbolsBase64;
                    const finalize = (name, val, font) => {
                        const meta = font.meta || {};
                        
                        meta.similarity = _average(val);
                        meta.name = meta.name || name;
                        result.push(meta);
                        
                        if (progress)
                            progress(name, val, done / todo);
                        
                        if (++done == todo) {
                            result.sort((a, b) => b.similarity - a.similarity);
                            resolve(result);
                        }
                    };
                    let done = 0;
                    
                    for (const name of fonts)
                    {
                        FontStorage.prepareFont(`${_OPTIONS.fontsDirectory}${name}/${_OPTIONS.fontsData}`).then((font) => {
                            _symbolsToDomain(recognition, font.alpha);
                            _compare(recognition, font.alpha).then((fin) => finalize(name, fin, font)).catch(reject);
                        }).catch(reject);
                    }
                }).catch(reject); 
            });
        };
        
        // Return the public context.
        return (url, options) => _recognize(url, options);
    }

());