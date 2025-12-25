import { useState, useEffect, useRef } from 'react';

declare global {
    interface Window {
        loadPyodide: any;
    }
}

export const usePyodide = () => {
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pyodideRef = useRef<any>(null);

    const init = async () => {
        setIsLoading(true);
        try {
            if (!window.loadPyodide) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Pyodide'));
                    document.head.appendChild(script);
                });
            }

            if (window.loadPyodide && !pyodideRef.current) {
                console.log("Initializing Pyodide...");
                const pyodide = await window.loadPyodide();
                await pyodide.loadPackage("pandas");
                pyodideRef.current = pyodide;
                setIsReady(true);
                console.log("Pyodide + Pandas Ready");
            }
        } catch (err) {
            console.error("Pyodide Init Failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const runPython = async (code: string, context: any = {}) => {
        if (!pyodideRef.current) throw new Error("Pyodide not ready");

        // Expose variables to Python scope
        for (const [key, value] of Object.entries(context)) {
            pyodideRef.current.globals.set(key, JSON.stringify(value));
        }

        return await pyodideRef.current.runPythonAsync(code);
    };

    return { isReady, isLoading, runPython, init };
};
