/**
 * @module ShapePerception Used to compare images using a method that considers human perception.
 * @author Vasile Pește <sirvasile@protonmail.ch>
*/

import ImageDrawing from "./imagedrawing";

const ShapePerception = (

    function (undefined)
    {
        "use strict";
        
        // Used as dimension for resizing the images.
        const _PRECISION = 48;
        
        /**
         * _prepareImages Load and binarize two images as ImageDrawing instances.
         * @param {String} first The URL of the first image.
         * @param {String} second The URL of the second image.
         * @return {Promise}
        */
        
        const _prepareImages = (first, second) => {
            return new Promise((resolve, reject) => {
                const todo = 2;
                const img = new ImageDrawing();
                const img1 = new ImageDrawing();
                const precision = _PRECISION;
                const finalize = () => {
                    ++done;
                    
                    if (done == todo)
                        resolve([img, img1]);  
                };
                let done = 0;
                
                img.draw(first, 1, precision, precision).then(() => {
                    img.binarize(200);
                    finalize();
                }).catch(reject);
                img1.draw(second, 1, precision, precision).then(() => {
                    img1.binarize(200);
                    finalize();
                }).catch(reject); 
            });
        };
        
        /**
         * _getBinarizedPixelsMatrix Put the pixels of a binarized ImageDrawing instance in a matrix.
         * @param {ImageDrawing} img
         * @return {Array}
        */
        
        const _getBinarizedPixelsMatrix = (img) => {
            const width = img.canvas.width;
            const data = img.context.getImageData(0, 0, width, img.canvas.height).data;
            const matrix = [];
            let w = 0;
            let j = 0;
            
            for (let i = 0, ll = data.length; i < ll; i += 4)
            {
                if (w == width)
                {
                    w = 0;
                    ++j;
                }
                
                if (w == 0)
                    matrix.push([]);
                
                matrix[j].push(data[i] == 255 ? 1 : 0);
                ++w;
            }
            
            return matrix;
        };
        
        /**
         * _compare Compare two images using a method based on human perception (Hamming distance).
         * @param {String} first The URL of the first image.
         * @param {String} second The URL of the second image.
         * @return {Promise}
        */
        
        const _compare = (first, second) => {
            return new Promise((resolve, reject) => {
                _prepareImages(first, second).then((res) => {
                    const matrix = _getBinarizedPixelsMatrix(res[0]);
                    const matrix1 = _getBinarizedPixelsMatrix(res[1]);
                    const r = matrix.length;
                    const c = matrix[0].length;
                    let dist = 0;
                    
                    for (let i = 0; i < r; ++i)
                        for (let j = 0; j < c; ++j)
                            if (matrix[i][j] != matrix1[i][j])
                                ++dist;
                    
                    resolve(100 - (dist / (r * c) * 100));
                }).catch(reject); 
            });
    	};
        
        // Return the public context.
        return (first, second) => _compare(first, second);
    }

());

export default ShapePerception;