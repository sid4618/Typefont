/**
 * @module FontStorage Used to fetch fonts from the database.
 * @author Vasile Pește <sirvasile@protonmail.ch>
*/

export const FontStorage = (

    function (undefined)
    {
        // Used as request timeout [ms].
        const _TIMEOUT = 2000;
        
        /**
         * _fetch Retrieve and deserialize a JSON structure stored in a file.
         * @param {String} url The URL of the file to fetch.
         * @param {Number} [timeout = _TIMEOUT] The timeout of the request [ms].
         * @return {Promise}
        */
        
        const _fetch = (url, timeout = _TIMEOUT) => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.open("GET", url);
                xhr.timeout = timeout;
                xhr.onload = (e) => {
                    const result = {};
                    
                    result.exists = e.target.status != 404;
                    
                    if (result.exists) {
                        try {
                            result.content = JSON.parse(e.target.responseText);
                        }
                        catch (ex) {
                            reject(`Unable to parse ${url} content`);
                        }
                    }
                    
                    resolve(result);
                };
                xhr.onerror = xhr.onabort = () => reject(`Unable to open ${url}`);
                xhr.send();
            });
        };
        
        /**
         * _prepareFontsIndex Request a file containing the index of the fonts.
         * Established the following JSON structure for a fonts index file.
         * {
         *     "index": [
         *         "font-name",
         *         "font-name-1",
         *         "font-name-2",
         *         ...
         *     ]
         * }
         * @param {String} url The URL of the fonts index JSON file.
         * @return {Promise}
        */
        
        const _prepareFontsIndex = (url) => {
            return new Promise((resolve, reject) => {
                _fetch(url).then((res) => {
                    const content = res.content;
                    
                    if (Array.isArray(content.index))
                        resolve(content);
                    else
                        reject(`The JSON structure of ${url} does not meet the established format for the fonts index`);
                }).catch(reject);
            });
        };
        
        /**
         * _prepareFont Request a font.
         * Established the following JSON structure for a font file.
         * {
         *     "meta": {
         *         "name": "...,
         *         "author": "...",
         *         "uri": "...",
         *         "key": "value",
         *         ...
         *     },
         *     "alpha": {
         *         "a": "base64",
         *         "b": "base64",
         *         "c": "base64",
         *         ...
         *     }
         * }
         * Each key and value of the meta object will be included in the final result.
         * @param {String} url The URL of the directory containing the fonts.
         * @return {Promise}
        */
        
        const _prepareFont = (url) => {
            return new Promise((resolve, reject) => {
                _fetch(url).then((res) => {
                    const alpha = res.content.alpha;
                    
                    if (alpha)
                    {
                        for (const symbol in alpha)
                            alpha[symbol] = `data:image/png;base64,${alpha[symbol]}`;
                        
                        resolve(res.content);
                    }
                    else {
                        reject(`The JSON structure of ${url} does not meet the established format for a font data file`);
                    }
                }).catch(reject);
            });
        };
        
        // Return the public context.
        return {
            prepareFontsIndex: (url) => _prepareFontsIndex(url),
            prepareFont: (url) => _prepareFont(url)     
        };
    }

());