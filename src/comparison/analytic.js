/**
 * @module AnalyticPerception Used to compare two images analytically.
 * @author Vasile Pește <sirvasile@protonmail.ch>
*/

import {ImageDrawing} from "../image/imagedrawing";

export const AnalyticPerception = (

    function (undefined)
    {
        // Used as dimension when resizing the images to the same size.
        const _SIZE = 64;
        
        /**
         * _compare Compare two images using a pixel based method.
         * @param {String} first The URL of the first image.
         * @param {String} second The URL of the second image.
         * @param {Number} [threshold = 0.1] Comparison threshold.
         * @param {Boolean} [scaleToSameSize = false] Scale the first and the second image to the same size before comparison?
         * @return {Promise}
        */
        
        const _compare = (first, second, threshold = 0.1, scaleToSameSize = false) => {
            return new Promise((resolve, reject) => {
                if (!first.indexOf("data:image/png"))
                    first = ImageDrawing.base64ToBuffer(first.substr(22));
                
                if (!second.indexOf("data:image/png"))
                    second = ImageDrawing.base64ToBuffer(second.substr(22));
                
                Promise.all([Jimp.read(first), Jimp.read(second)]).then(res => {
                    const img = res[0];
                    const img1 = res[1];
                    const size = _SIZE;
                    
                    if (scaleToSameSize) {
                        img.resize(size, size);
                        img1.resize(size, size);
                    }
                    
                    // Return the similarity percentage.
                    resolve(100 - (Jimp.diff(img, img1, threshold).percent * 100));
                }).catch(reject);
            });
        };
        
        // Return the public context.
        return (first, second, threshold, scaleToSameSize) => _compare(first, second, threshold, scaleToSameSize);
    }

());