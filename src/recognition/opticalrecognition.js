/**
 * @module OpticalRecognition Used to recognize the text in a image.
 * @author Vasile Pește <sirvasile@protonmail.ch>
*/

export const OpticalRecognition = (

    function (undefined)
    {
        // Used as global options.
        const _OPTIONS = {
            lang: "eng",
            tessedit_char_whitelist: "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789"
        };
        
        /**
         * _recognize Recognize the text in a image.
         * @param {String} url The URL of the image to recognize.
         * @param {Object} [options = {}]
         * @return {Promise}
        */
        
        const _recognize = (url, options = {}) => {
            for (const option in options)
                _OPTIONS[option] = options[option];
            
            return Tesseract.recognize(url, _OPTIONS);
        };
        
        // Return the public context.
        return (url, options) => _recognize(url, options);
    }

());