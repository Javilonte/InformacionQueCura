import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Download, FileSpreadsheet, Trash2, Wand2, Type, Eraser, CheckCircle2, Info, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { usePyodide } from '../hooks/usePyodide';

interface DataRow {
    [key: string]: string | number | boolean | null;
}

export const DataCleaner: React.FC = () => {
    const [data, setData] = useState<DataRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
    const [processing, setProcessing] = useState(false);

    // Python Engine Hook
    const { isReady: pythonReady, runPython, init: initPython, isLoading: pythonLoading } = usePyodide();
    const [engineStarted, setEngineStarted] = useState(false);

    const handleStartEngine = () => {
        setEngineStarted(true);
        initPython();
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
        setNotification({ message, type });
    };

    // ... (sanitizeHeaders and processFile functions remain same, omitted for brevity if unchanged logic, but keeping them if needed)
    // To ensure I don't delete them, I will target the specific blocks or keep the surrounding code.
    // Since this tool replaces a block, I should stick to the header/init part and the render part.

    // ... sanitizeHeaders ... processFile ... handleFileUpload ... drag handlers ...

    // I will replace the top part first to get the init logic in.

    // Actually, I can replace the logic and then the render.
    // Let's replace the top hook call first.

    // Splitting this into multiple ReplaceFileContent calls might be safer if the file is large.
    // But I can try to match the return block for the "Start" UI.

    // Let's start with the Hook destructuring.


    const sanitizeHeaders = (rawHeaders: string[]): string[] => {
        const seen: { [key: string]: number } = {};
        return rawHeaders.map(h => {
            const header = (h !== undefined && h !== null) ? String(h) : 'Untitled';
            const cleanHeader = header.trim() || 'Untitled';
            if (seen[cleanHeader]) {
                seen[cleanHeader]++;
                return `${cleanHeader}_${seen[cleanHeader]}`;
            }
            seen[cleanHeader] = 1;
            return cleanHeader;
        });
    };

    const processFile = (file: File) => {
        if (!file) return;
        const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setFileName(name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                if (jsonData.length > 0) {
                    const rawHeaders = jsonData[0] as string[];
                    const uniqueHeaders = sanitizeHeaders(rawHeaders);
                    setHeaders(uniqueHeaders);
                    const rows = jsonData.slice(1).map((row: any) => {
                        const rowData: DataRow = {};
                        uniqueHeaders.forEach((header, index) => {
                            rowData[header] = (row[index] !== undefined && row[index] !== null) ? row[index] : "";
                        });
                        return rowData;
                    });
                    setData(rows);
                    showNotification(`Loaded ${rows.length} rows successfully!`);
                }
            } catch (err) {
                console.error("Error reading file:", err);
                alert("Error reading file. Please try a valid Excel or CSV.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    // --------------------------------------------------------
    // PYTHON POWERED FUNCTIONS
    // --------------------------------------------------------

    const runDataOperation = async (operationName: string, pythonScript: string) => {
        if (!pythonReady) {
            showNotification("Python engine still loading...", "info");
            return;
        }

        setProcessing(true);
        try {
            // 1. Pass current data to Python context
            const resultJson = await runPython(`
import pandas as pd
import json
import io

# Load data from JS variable
data_str = ${'dataset_json'} 
df = pd.DataFrame(json.loads(data_str))

# --- OPERATION START ---
${pythonScript}
# --- OPERATION END ---

# Return result as JSON string list of records
df.to_json(orient='records')
            `, { dataset_json: data });

            // 2. Parse result back to JS
            const newData = JSON.parse(resultJson);
            setData(newData);
            showNotification(`${operationName} complete!`);

        } catch (err) {
            console.error("Python Error:", err);
            showNotification(`Error in ${operationName}`, "error");
        } finally {
            setProcessing(false);
        }
    };

    const deepClean = () => {
        // Pandas magic: strip whitespace from all string columns, remove duplicates, etc.
        const script = `
# Deep Clean with Pandas
# 1. Strip whitespace from all object (string) columns
df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)

# 2. Replace multiple spaces with single space in regex
df = df.replace(r'\\s+', ' ', regex=True)

# 3. Replace empty strings with NaN temporarily to drop truly empty rows if desired (optional)
# For now just standardizing empty strings
df = df.fillna("")
        `;
        runDataOperation("Deep Clean (Python)", script);
    };

    const removeDuplicates = () => {
        const script = `
count_before = len(df)
df = df.drop_duplicates()
count_after = len(df)
# We can't easily return the count separately without changing the return structure, 
# but the operation is done efficiently.
         `;
        runDataOperation("Deduplication (Python)", script);
    };

    const removeEmptyRows = () => {
        const script = `
# Convert empty strings to NaN to properly detect "empty"
df = df.replace(r'^\\s*$', float('nan'), regex=True)
# Drop rows where ALL elements are NaN
df = df.dropna(how='all')
# Fill remaining NaNs back to empty string for UI safety
df = df.fillna("")
        `;
        runDataOperation("Remove Empty Rows (Python)", script);
    };

    const standardizeCase = () => {
        const script = `
# Title Case for all string columns
for col in df.select_dtypes(include=['object']).columns:
    df[col] = df[col].astype(str).str.title()
        `;
        runDataOperation("Standardize Case (Python)", script);
    };


    const downloadFile = () => {
        try {
            if (!data.length) {
                showNotification("No data to export!", "info");
                return;
            }
            const exportData = [headers, ...data.map(row => headers.map(header => row[header]))];
            const ws = XLSX.utils.aoa_to_sheet(exportData);
            const colWidths = headers.map((key) => {
                let maxWidth = key.length;
                const sampleRows = data.slice(0, 100);
                sampleRows.forEach(row => {
                    const val = row[key];
                    const len = val ? String(val).length : 0;
                    if (len > maxWidth) maxWidth = len;
                });
                return { wch: Math.min(maxWidth + 2, 50) };
            });
            ws['!cols'] = colWidths;
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CleanedData");
            const safeName = fileName || `data_${new Date().getTime()}`;
            XLSX.writeFile(wb, `${safeName}_refined.xlsx`);
            showNotification("Data exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Check console for details.");
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center selection:bg-blue-500/30">

            {/* Background Grid */}
            <div className="fixed inset-0 modern-grid-bg opacity-20 pointer-events-none"></div>

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-4 py-3 border rounded-lg shadow-2xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-950/80 border-red-800' : 'bg-[#18181b] border-[#27272a]'
                        }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : notification.type === 'error' ? (
                            <X className="w-5 h-5 text-red-500" />
                        ) : (
                            <Info className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-[#e4e4e7]">{notification.message}</span>
                    </div>
                </div>
            )}

            <main className="relative w-full max-w-[1400px] px-6 py-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        Data Refinery
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-[#a1a1aa] text-lg font-light">
                        <span>Professional data cleaning with</span>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-mono transition-colors ${pythonReady
                            ? 'border-green-800 bg-green-950/30 text-green-400'
                            : 'border-yellow-800 bg-yellow-950/30 text-yellow-500'
                            }`}>
                            {pythonReady ? 'PYTHON READY' : 'PANDAS ENGINE'}
                        </div>
                    </div>
                </div>

                {/* Engine Starter Overlay */}
                {!engineStarted ? (
                    <div className="w-full max-w-lg text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="p-8 border border-[#27272a] bg-[#18181b]/50 rounded-2xl backdrop-blur-sm">
                            <Wand2 className="w-12 h-12 text-blue-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-semibold text-white mb-4">Initialize Python Engine</h2>
                            <p className="text-[#a1a1aa] mb-8">
                                To protect your bandwidth, we load the powerful Pandas data engine (~20MB) only when you need it.
                                All data processing happens locally in your browser.
                            </p>
                            <button
                                onClick={handleStartEngine}
                                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mx-auto w-full"
                            >
                                <Loader2 className={`w-5 h-5 ${pythonLoading ? 'animate-spin' : 'hidden'}`} />
                                {pythonLoading ? 'Initializing...' : 'Start Engine'}
                            </button>
                        </div>
                        <p className="text-xs text-[#52525b]">Powered by Pyodide WebAssembly</p>
                    </div>
                ) : (
                    <>
                        {/* Loading State during Init */}
                        {!pythonReady && (
                            <div className="w-full max-w-lg p-8 border border-[#27272a] bg-[#18181b]/50 rounded-2xl backdrop-blur-sm text-center animate-pulse">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Loading Pandas Resources...</h3>
                                <p className="text-[#a1a1aa] text-sm">This typically takes 5-10 seconds on the first run.</p>
                            </div>
                        )}

                        {/* Main Action Area */}
                        {pythonReady && (
                            data.length === 0 ? (
                                <div
                                    className={`
                            group w-full max-w-2xl border border-dashed rounded-xl p-16 text-center transition-all duration-300 cursor-pointer
                            ${isDragging
                                            ? 'border-blue-500 bg-blue-500/5 scale-[1.01]'
                                            : 'border-[#3f3f46] hover:border-[#71717a] hover:bg-[#27272a]/30'
                                        }
                        `}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .csv" />

                                    <div className="w-16 h-16 bg-[#18181b] rounded-2xl border border-[#27272a] flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-6 h-6 text-[#a1a1aa] group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-medium text-white mb-2">Upload Data File</h3>
                                    <p className="text-[#a1a1aa] text-sm">Drag & drop excel or csv</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Command Bar */}
                                    <div className="sticky top-6 z-40 w-full glass-panel rounded-xl p-2 flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-4 px-4">
                                            <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                                                <FileSpreadsheet className="w-5 h-5 text-[#fafafa]" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-sm text-white max-w-[200px] truncate" title={fileName || 'File'}>{fileName}</h3>
                                                <p className="text-xs text-[#a1a1aa] font-mono">{data.length} rows • {headers.length} cols</p>
                                            </div>
                                        </div>

                                        <div className="h-8 w-px bg-[#3f3f46]"></div>

                                        <div className="flex items-center gap-1">
                                            <ActionButton icon={Trash2} label="Dedupe" onClick={removeDuplicates} disabled={!pythonReady || processing} />
                                            <ActionButton icon={Eraser} label="No Empty" onClick={removeEmptyRows} disabled={!pythonReady || processing} />
                                            <ActionButton icon={Wand2} label="Deep Clean" onClick={deepClean} disabled={!pythonReady || processing} />
                                            <ActionButton icon={Type} label="Title Case" onClick={standardizeCase} disabled={!pythonReady || processing} />
                                        </div>

                                        <div className="h-8 w-px bg-[#3f3f46]"></div>

                                        <div className="flex items-center gap-2 px-2">
                                            <button
                                                onClick={downloadFile}
                                                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Export
                                            </button>
                                            <button
                                                onClick={() => setData([])}
                                                className="p-2 hover:bg-[#27272a] rounded-lg text-[#a1a1aa] hover:text-red-400 transition-colors"
                                                title="Close File"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Processing Overlay */}
                                    {processing && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                            <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                                <p className="text-lg font-medium text-white">Running Python Script...</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Data Grid */}
                                    <div className="w-full border border-[#27272a] rounded-xl overflow-hidden bg-[#09090b] shadow-sm">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                                <thead>
                                                    <tr className="border-b border-[#27272a] bg-[#18181b]">
                                                        <th className="p-4 w-16 text-center text-[#52525b] font-medium text-xs uppercase tracking-wider sticky left-0 bg-[#18181b] z-10 border-r border-[#27272a]">#</th>
                                                        {headers.map((header, i) => (
                                                            <th key={i} className="p-4 font-medium text-[#a1a1aa] text-xs uppercase tracking-wider border-r border-[#27272a] last:border-r-0 min-w-[150px]">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#27272a]">
                                                    {data.slice(0, 100).map((row, i) => (
                                                        <tr key={i} className="group hover:bg-[#18181b] transition-colors">
                                                            <td className="p-3 text-center text-[#52525b] font-mono text-xs border-r border-[#27272a] bg-[#09090b] group-hover:bg-[#18181b] sticky left-0 z-10">{i + 1}</td>
                                                            {headers.map((header, j) => (
                                                                <td key={j} className="p-3 text-[#e4e4e7] border-r border-[#27272a] last:border-r-0 max-w-[300px] truncate font-mono text-xs opacity-90">
                                                                    {String(row[header] !== null && row[header] !== undefined ? row[header] : '')}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 border-t border-[#27272a] bg-[#18181b] text-center text-xs text-[#71717a]">
                                            Only showing first 100 rows preview
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </>
                )}
            </main>
        </div>
    );
};

// Subcomponent for cleaner JSX
const ActionButton: React.FC<{ icon: any, label: string, onClick: () => void, disabled?: boolean }> = ({ icon: Icon, label, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${disabled
            ? 'text-[#3f3f46] cursor-not-allowed'
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);
