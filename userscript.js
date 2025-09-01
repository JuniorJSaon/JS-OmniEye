// ==UserScript==
// @name         JS-OmniEye Full Console
// @namespace    http://tampermonkey.net/
// @version      2025-09-01
// @description  One file debugger, made with much love
// @author       JSaon
// @run-at       document-start
// @include      *
// @match        *://*/*
// @grant        unsafeWindow
// ==/UserScript==

console.info("JS-OmniEye is loading...");

(() => {
    const w = unsafeWindow;

    if (window.JS_OMNIEYE_LOADED) return;
    window.JS_OMNIEYE_LOADED = true;

    const methodList = [
        "log", "info", "warn", "error", "debug", "trace",
        "group", "groupCollapsed", "groupEnd", "table",
        "assert", "clear", "count", "countReset", 
        "time", "timeEnd", "timeLog"
    ];

    const global_clones = {};
    const global_saves = {};

    methodList.forEach(method => {
        global_clones[method] = w.console[method];

        // initialize saves arrays
        if (["log","info","warn","error","debug","trace"].includes(method)) {
            global_saves[method+"_logs"] = [];
        }

        // wrapper
        w.console[method] = function(...args) {
            try {
                if (global_saves[method+"_logs"]) {
                    global_saves[method+"_logs"].push(args);
                }
                const tag = method.toUpperCase();
                return global_clones[method].apply(this, [`[${tag}]`, ...args]);
            } catch(e) {
                return global_clones[method].apply(this, args);
            }
        };
    });

    // helper getters
    global_saves.get_all_logs = function() {
        methodList.forEach(method => {
            if (global_saves[method+"_logs"]) {
                global_clones.log(`[SAVED ${method.toUpperCase()}]:`, global_saves[method+"_logs"]);
            }
        });
    };

    w.global_saves = global_saves;

})();
