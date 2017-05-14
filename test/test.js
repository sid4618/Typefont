/**
 * @module Test
 * @author Vasile Pește <sirvasile@protonmail.ch>
*/

import {Typefont} from "../src/index.js";

(

    function (undefined)
    {
        // Test options.
        const _OPTIONS = {
            fontsIndex: "../storage/index.json",
            fontsDirectory: "../storage/fonts/"  
        };
        
        // Directory of the images to recognize.
        const _DIR = "images/";
        
        // List of the images to recognize.
        const _TESTS = [
            "book.png",
            "book1.png",
            "web.png"
        ];
        
        // Results to match.
        const _RESULTS = [
            ["Roboto", "Ubuntu", "Nunito Sans", "Aldrich", "Raleway", "Lora", "Times New Roman"],
            ["Lora", "Times New Roman", "Ubuntu", "Nunito Sans", "Roboto", "Raleway", "Aldrich"],
            ["Nunito Sans", "Roboto", "Raleway", "Ubuntu", "Aldrich", "Lora", "Times New Roman"]
        ];
        
        const _test = (res, j) => {
            let ex = 0;
            
            for (let i = 0, ll = _RESULTS[j].length; i < ll; ++i)
                if (_RESULTS[j][i] != res[i].name)
                {
                    ++ex;
                    console.warn(`Test ${j} at i => ${i} [expected: ${_RESULTS[j][i]} but recevied ${res[i].name}]`);
                }
            
            console.log(`Test ${j}`, res, ex == 0 ? "Passed" : "Not Passed");
        };
        
        for (let i = 0, ll = _TESTS.length; i < ll; ++i)
            Typefont(`${_DIR}${_TESTS[i]}`, _OPTIONS).then((res) => _test(res, i)).catch((ex) => console.log(ex));
    }

());