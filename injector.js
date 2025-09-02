// ==UserScript==
// @name         JS-OmniEye Inline Patch
// @namespace    http://tampermonkey.net/
// @version      2025-09-02
// @description  One file debugger, inline injected for max priority
// @author       JSaon
// @run-at       document-start
// @include      *
// @icon         https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThUUqw5jj4HYkQ56R0JOJZL9hztGN10jHmrA&s
// @grant        none
// ==/UserScript==

(() => {
    // Wstrzyknięcie kodu bezpośrednio w stronę
    const script = document.createElement('script');
    script.textContent = `
    (function(){
        if (window.JS_OMNIEYE_LOADED) return;
        window.JS_OMNIEYE_LOADED = true;

        const methods = [
            "log","info","warn","error","debug","trace",
            "group","groupCollapsed","groupEnd","table",
            "assert","clear","count","countReset",
            "time","timeEnd","timeLog"
        ];

        window.global_clones = {};
        window.global_saves = {};

        methods.forEach(method => {
            const orig = console[method];
            window.global_clones[method] = orig;

            // miejsce na logi
            if (["log","info","warn","error","debug","trace"].includes(method)) {
                window.global_saves[method + "_logs"] = [];
            }

            console[method] = function(...args){
                try {
                    if (window.global_saves[method + "_logs"]) {
                        window.global_saves[method + "_logs"].push(args);
                    }
                    const tag = "[JS-OmniEye " + method.toUpperCase() + "]";
                    return orig.apply(this, [tag, ...args]);
                } catch(e) {
                    return orig.apply(this, args);
                }
            };
        });

        // helper do podglądu wszystkiego
        window.global_saves.get_all_logs = function(){
            methods.forEach(m=>{
                if (window.global_saves[m + "_logs"]) {
                    window.global_clones.log("[SAVED " + m.toUpperCase() + "]:", window.global_saves[m + "_logs"]);
                }
            });
        };

        console.info("JS-OmniEye inline patch injected.");
    })();
    `;
    document.documentElement.prepend(script);
})();
