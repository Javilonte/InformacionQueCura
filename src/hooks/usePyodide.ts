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

    useEffect(() => {
        const load = async () => {
            try {
                // Check if already loaded globally (singleton to avoid re-init errors)
                if (!window.loadPyodide) {
                    // Wait for script to inject (if slightly delayed) or assume it's there
                    await new Promise(r => setTimeout(r, 500));
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

        if (window.loadPyodide) { // Script tag ensures this should be available
            load();
        } else {
            // Fallback polling if script loads async
            const interval = setInterval(() => {
                if (window.loadPyodide) {
                    clearInterval(interval);
                    load();
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);

    const runPython = async (code: string, context: any = {}) => {
        if (!pyodideRef.current) throw new Error("Pyodide not ready");

        // Expose variables to Python scope
        for (const [key, value] of Object.entries(context)) {
            // Convert JS objects to Python proxy if needed, or let Pyodide handle basic types
            // For data arrays, it's best to convert inside Python using pyodide.to_py if simple conversion isn't enough
            // But simple arrays of objects usually need JSON serialization for robust transfer
            pyodideRef.current.globals.set(key, JSON.stringify(value));
        }

        return await pyodideRef.current.runPythonAsync(code);
    };

    return { isReady, isLoading, runPython, pyodide: pyodideRef.current };
};
