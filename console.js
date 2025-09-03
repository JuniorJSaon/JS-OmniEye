// ==UserScript==
// @name         Web Console Pro
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Console for executing JS code - for those who know what they are doing
// @author       JSaon
// @match        *://*/*
// @icon         https://cdn-icons-png.flaticon.com/512/686/686589.png
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        #web-console-pro {
            position: fixed;
            left: 5px;
            top: 5px;
            width: 300px;
            max-width: 95vw;
            height: 40px;
            background: #1a1a1a !important;
            border: 2px solid #00ff88 !important;
            border-radius: 8px !important;
            box-shadow: 0 5px 25px rgba(0, 255, 136, 0.4) !important;
            z-index: 2147483647 !important;
            overflow: hidden;
            transition: all 0.3s ease !important;
            font-family: 'Consolas', 'Monaco', monospace !important;
        }

        #console-header-pro {
            background: linear-gradient(90deg, #00ff88, #00ccff) !important;
            padding: 8px 12px !important;
            cursor: move !important;
            color: #000 !important;
            font-weight: bold !important;
            font-size: 12px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            user-select: none !important;
        }

        #console-toggle-pro {
            background: #000 !important;
            color: #00ff88 !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 3px 8px !important;
            cursor: pointer !important;
            font-family: inherit !important;
            font-weight: bold !important;
            font-size: 10px !important;
        }

        #console-content-pro {
            display: none;
            padding: 10px !important;
            height: calc(100% - 40px) !important;
            flex-direction: column !important;
            gap: 8px !important;
            background: #0a0a0a !important;
        }

        #console-input-pro {
            background: #000 !important;
            color: #00ff88 !important;
            border: 1px solid #00ff88 !important;
            border-radius: 4px !important;
            padding: 8px !important;
            font-family: inherit !important;
            font-size: 12px !important;
            resize: vertical !important;
            min-height: 50px !important;
            outline: none !important;
            max-width: 100% !important;
        }

        #console-execute-pro {
            background: linear-gradient(90deg, #00ff88, #00ccff) !important;
            color: #000 !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 8px !important;
            cursor: pointer !important;
            font-weight: bold !important;
            font-family: inherit !important;
            font-size: 12px !important;
            transition: transform 0.1s ease !important;
        }

        #console-execute-pro:hover {
            transform: translateY(-1px) !important;
        }

        #console-execute-pro:active {
            transform: translateY(0) !important;
        }

        #console-output-pro {
            background: #000 !important;
            color: #00ccff !important;
            border: 1px solid #00ff88 !important;
            border-radius: 4px !important;
            padding: 8px !important;
            font-family: inherit !important;
            font-size: 12px !important;
            min-height: 80px !important;
            max-height: 200px !important;
            overflow-y: auto !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            max-width: 100% !important;
        }

        .resize-handle {
            position: absolute !important;
            background: transparent !important;
            z-index: 2147483646 !important;
        }

        .resize-handle-top { top: -3px; left: 0; right: 0; height: 6px; cursor: ns-resize !important; }
        .resize-handle-right { top: 0; right: -3px; bottom: 0; width: 6px; cursor: ew-resize !important; }
        .resize-handle-bottom { bottom: -3px; left: 0; right: 0; height: 6px; cursor: ns-resize !important; }
        .resize-handle-left { top: 0; left: -3px; bottom: 0; width: 6px; cursor: ew-resize !important; }
        .resize-handle-tl { top: -3px; left: -3px; width: 10px; height: 10px; cursor: nwse-resize !important; }
        .resize-handle-tr { top: -3px; right: -3px; width: 10px; height: 10px; cursor: nesw-resize !important; }
        .resize-handle-bl { bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: nesw-resize !important; }
        .resize-handle-br { bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: nwse-resize !important; }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            #web-console-pro {
                width: 280px !important;
                left: 2px !important;
                top: 2px !important;
            }

            #console-header-pro {
                padding: 6px 10px !important;
                font-size: 11px !important;
            }

            #console-content-pro {
                padding: 8px !important;
            }

            #console-input-pro, #console-output-pro {
                font-size: 11px !important;
                padding: 6px !important;
            }

            .resize-handle-top,
            .resize-handle-bottom {
                height: 8px !important;
            }

            .resize-handle-left,
            .resize-handle-right {
                width: 8px !important;
            }
        }

        @media (max-width: 480px) {
            #web-console-pro {
                width: 260px !important;
                max-width: 92vw !important;
            }

            #console-header-pro {
                font-size: 10px !important;
                padding: 5px 8px !important;
            }

            #console-toggle-pro {
                padding: 2px 6px !important;
                font-size: 9px !important;
            }
        }
    `);

    // Load saved position or set default (left top corner)
    const savedPosition = GM_getValue('consolePosition', { left: 5, top: 5, right: 'auto', bottom: 'auto' });
    const savedSize = GM_getValue('consoleSize', { width: 300, height: 40 });
    const savedState = GM_getValue('consoleState', { expanded: false });

    const consoleContainer = document.createElement('div');
    consoleContainer.id = 'web-console-pro';

    consoleContainer.style.left = savedPosition.left + 'px';
    consoleContainer.style.top = savedPosition.top + 'px';
    consoleContainer.style.right = savedPosition.right;
    consoleContainer.style.bottom = savedPosition.bottom;
    consoleContainer.style.width = Math.min(savedSize.width, window.innerWidth - 10) + 'px';
    consoleContainer.style.height = savedState.expanded ? '350px' : '40px';

    const consoleHeader = document.createElement('div');
    consoleHeader.id = 'console-header-pro';
    consoleHeader.innerHTML = 'Web Console <button id="console-toggle-pro">' + (savedState.expanded ? '▼' : '▲') + '</button>';

    const consoleContent = document.createElement('div');
    consoleContent.id = 'console-content-pro';
    consoleContent.style.display = savedState.expanded ? 'flex' : 'none';

    const consoleInput = document.createElement('textarea');
    consoleInput.id = 'console-input-pro';
    consoleInput.placeholder = '// Enter code here...\n// Ctrl+Enter to run\n\nconsole.log("Hello!");';

    const consoleExecute = document.createElement('button');
    consoleExecute.id = 'console-execute-pro';
    consoleExecute.textContent = 'EXECUTE';

    const consoleOutput = document.createElement('div');
    consoleOutput.id = 'console-output-pro';
    consoleOutput.textContent = '> Output will appear here...';

    consoleContent.appendChild(consoleInput);
    consoleContent.appendChild(consoleExecute);
    consoleContent.appendChild(consoleOutput);
    consoleContainer.appendChild(consoleHeader);
    consoleContainer.appendChild(consoleContent);

    document.body.appendChild(consoleContainer);

    const createHandle = (className, cursor) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${className}`;
        handle.style.cursor = cursor;
        return handle;
    };

    ['top', 'right', 'bottom', 'left', 'tl', 'tr', 'bl', 'br'].forEach(pos => {
        consoleContainer.appendChild(createHandle(`resize-handle-${pos}`,
            pos.length === 2 ? 'nwse-resize' : pos === 'top' || pos === 'bottom' ? 'ns-resize' : 'ew-resize'));
    });

    // Variables for drag & resize
    let isDragging = false, isResizing = false, resizeDir = '';
    let startX, startY, startW, startH, startL, startT;

    // Save position function
    function saveConsolePosition() {
        const rect = consoleContainer.getBoundingClientRect();
        GM_setValue('consolePosition', {
            left: parseInt(consoleContainer.style.left) || 0,
            top: parseInt(consoleContainer.style.top) || 0,
            right: consoleContainer.style.right,
            bottom: consoleContainer.style.bottom
        });
        GM_setValue('consoleSize', {
            width: rect.width,
            height: rect.height
        });
        GM_setValue('consoleState', {
            expanded: consoleContent.style.display === 'flex'
        });
    }

    // Drag functionality
    consoleHeader.addEventListener('mousedown', (e) => {
        if (e.target.id !== 'console-toggle-pro') {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startL = parseInt(getComputedStyle(consoleContainer).left) || 0;
            startT = parseInt(getComputedStyle(consoleContainer).top) || 0;
        }
    });

    // Resize functionality
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizeDir = handle.className.split(' ')[1];
            startX = e.clientX;
            startY = e.clientY;
            startW = parseInt(getComputedStyle(consoleContainer).width);
            startH = parseInt(getComputedStyle(consoleContainer).height);
            startL = parseInt(getComputedStyle(consoleContainer).left) || 0;
            startT = parseInt(getComputedStyle(consoleContainer).top) || 0;
            e.preventDefault();
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = startL + dx;
            let newTop = startT + dy;

            // Limit to window edges
            const maxLeft = window.innerWidth - consoleContainer.offsetWidth;
            const maxTop = window.innerHeight - consoleContainer.offsetHeight;

            consoleContainer.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
            consoleContainer.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
            consoleContainer.style.right = 'auto';
            consoleContainer.style.bottom = 'auto';
        }

        if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newWidth = startW, newHeight = startH, newLeft = startL, newTop = startT;

            switch(resizeDir) {
                case 'resize-handle-right': newWidth = Math.max(250, startW + dx); break;
                case 'resize-handle-bottom': newHeight = Math.max(120, startH + dy); break;
                case 'resize-handle-left':
                    newWidth = Math.max(250, startW - dx);
                    newLeft = startL + dx;
                    break;
                case 'resize-handle-top':
                    newHeight = Math.max(120, startH - dy);
                    newTop = startT + dy;
                    break;
                case 'resize-handle-tl':
                    newWidth = Math.max(250, startW - dx);
                    newHeight = Math.max(120, startH - dy);
                    newLeft = startL + dx;
                    newTop = startT + dy;
                    break;
                case 'resize-handle-tr':
                    newWidth = Math.max(250, startW + dx);
                    newHeight = Math.max(120, startH - dy);
                    newTop = startT + dy;
                    break;
                case 'resize-handle-bl':
                    newWidth = Math.max(250, startW - dx);
                    newHeight = Math.max(120, startH + dy);
                    newLeft = startL + dx;
                    break;
                case 'resize-handle-br':
                    newWidth = Math.max(250, startW + dx);
                    newHeight = Math.max(120, startH + dy);
                    break;
            }

            // Apply limits - stricter for mobile
            const maxWidth = window.innerWidth - 10;
            const maxHeight = window.innerHeight - 10;

            if (resizeDir.includes('left')) newLeft = Math.max(0, newLeft);
            if (resizeDir.includes('top')) newTop = Math.max(0, newTop);
            if (resizeDir.includes('right')) newWidth = Math.min(newWidth, maxWidth - newLeft);
            if (resizeDir.includes('bottom')) newHeight = Math.min(newHeight, maxHeight - newTop);

            consoleContainer.style.width = newWidth + 'px';
            consoleContainer.style.height = newHeight + 'px';
            consoleContainer.style.left = newLeft + 'px';
            consoleContainer.style.top = newTop + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            saveConsolePosition();
        }
        isDragging = false;
        isResizing = false;
    });

    // Toggle functionality
    consoleHeader.querySelector('#console-toggle-pro').addEventListener('click', () => {
        const isVisible = consoleContent.style.display === 'flex';
        consoleContent.style.display = isVisible ? 'none' : 'flex';
        consoleContainer.style.height = isVisible ? '40px' : '350px';
        consoleHeader.querySelector('#console-toggle-pro').textContent = isVisible ? '▲' : '▼';
        saveConsolePosition();
    });

    // Execute code with toast notification
    function executeCode() {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '15px';
        toast.style.right = '15px';
        toast.style.background = '#00ff88';
        toast.style.color = '#000';
        toast.style.padding = '8px 16px';
        toast.style.borderRadius = '4px';
        toast.style.fontFamily = 'Consolas, Monaco, monospace';
        toast.style.fontWeight = 'bold';
        toast.style.zIndex = '2147483647';
        toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.fontSize = '12px';
        toast.textContent = '✅ Executed!';

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Hide toast after 2 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);

        try {
            const code = consoleInput.value;
            const result = eval(code);

            let output;
            if (result === undefined) {
                output = 'undefined';
            } else if (result === null) {
                output = 'null';
            } else if (typeof result === 'object') {
                try {
                    output = JSON.stringify(result, null, 2);
                } catch (e) {
                    output = formatComplexObject(result);
                }
            } else if (typeof result === 'function') {
                output = result.toString();
            } else {
                output = result.toString();
            }

            consoleOutput.innerHTML = `<div style="color: #00ff88">> ${escapeHtml(output)}</div>`;
        } catch (error) {
            consoleOutput.innerHTML = `<div style="color: #ff4444">> ERROR: ${escapeHtml(error.message)}</div>`;
        }
    }

    function formatComplexObject(obj) {
        if (obj instanceof Node) {
            return `[${obj.constructor.name}] ${obj.nodeName}${obj.id ? '#' + obj.id : ''}${obj.className ? '.' + obj.className.split(' ').join('.') : ''}`;
        }

        if (obj instanceof Window) return '[Window]';
        if (obj instanceof Document) return '[Document]';

        if (obj instanceof HTMLElement) {
            return `[HTMLElement] <${obj.tagName.toLowerCase()}${obj.id ? '#' + obj.id : ''}${obj.className ? '.' + obj.className.split(' ').join('.') : ''}>`;
        }

        try {
            const keys = Object.keys(obj).slice(0, 3);
            return `[Object ${obj.constructor.name}] { ${keys.join(', ')}${Object.keys(obj).length > 3 ? ', ...' : ''} }`;
        } catch (e) {
            return `[Object ${obj.constructor.name}]`;
        }
    }

    function escapeHtml(text) {
        return text.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    consoleExecute.addEventListener('click', executeCode);

    consoleInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            executeCode();
            e.preventDefault();
        }
    });

    // HOTKEY (Ctrl+Shift+C) to toggle expand/collapse
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            const isVisible = consoleContent.style.display === 'flex';
            consoleContent.style.display = isVisible ? 'none' : 'flex';
            consoleContainer.style.height = isVisible ? '40px' : '350px';
            consoleHeader.querySelector('#console-toggle-pro').textContent = isVisible ? '▲' : '▼';
            saveConsolePosition();
            e.preventDefault();
        }

        // ESC to collapse
        if (e.key === 'Escape' && consoleContent.style.display === 'flex') {
            consoleContent.style.display = 'none';
            consoleContainer.style.height = '40px';
            consoleHeader.querySelector('#console-toggle-pro').textContent = '▲';
            saveConsolePosition();
            e.preventDefault();
        }
    });

    // Menu command in Tampermonkey
    if (typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand('Toggle Web Console', () => {
            const isVisible = consoleContent.style.display === 'flex';
            consoleContent.style.display = isVisible ? 'none' : 'flex';
            consoleContainer.style.height = isVisible ? '40px' : '350px';
            consoleHeader.querySelector('#console-toggle-pro').textContent = isVisible ? '▲' : '▼';
            saveConsolePosition();
        });

        GM_registerMenuCommand('Reset Console Position', () => {
            consoleContainer.style.left = '5px';
            consoleContainer.style.top = '5px';
            consoleContainer.style.right = 'auto';
            consoleContainer.style.bottom = 'auto';
            consoleContainer.style.width = '300px';
            consoleContainer.style.height = '40px';
            saveConsolePosition();
        });
    }

})();