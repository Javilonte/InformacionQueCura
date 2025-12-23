import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Download, FileSpreadsheet, Trash2, Wand2, Type, Eraser } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataRow {
    [key: string]: string | number | boolean | null;
}

export const DataCleaner: React.FC = () => {
    const [data, setData] = useState<DataRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
        setNotification({ message, type });
    };

    // Helper to ensure unique headers
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

        // Clean filename
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

    // 1. Improved Deduplication with Feedback
    const removeDuplicates = () => {
        if (!data.length) return;
        const seen = new Set();
        const initialCount = data.length;

        const uniqueData = data.filter(row => {
            // Create a signature of the row content
            const serialized = JSON.stringify(headers.map(h => row[h]));
            if (seen.has(serialized)) return false;
            seen.add(serialized);
            return true;
        });

        const removedCount = initialCount - uniqueData.length;
        setData(uniqueData);

        if (removedCount > 0) {
            showNotification(`Removed ${removedCount} duplicate rows.`);
        } else {
            showNotification("No duplicates found.", "info");
        }
    };

    // 2. Enhanced "Deep Clean" Logic
    const deepClean = () => {
        if (!data.length) return;
        let changeCount = 0;

        const cleanedData = data.map(row => {
            const newRow: DataRow = {};
            let hasChanged = false;

            headers.forEach(key => {
                const value = row[key];
                if (typeof value === 'string') {
                    // Replace non-breaking spaces and multiple spaces with a single space, then trim
                    const cleanValue = value.replace(/[\u00A0\s]+/g, ' ').trim();
                    newRow[key] = cleanValue;
                    if (cleanValue !== value) hasChanged = true;
                } else {
                    newRow[key] = value;
                }
            });

            if (hasChanged) changeCount++;
            return newRow;
        });

        setData(cleanedData);
        if (changeCount > 0) {
            showNotification(`Deep cleaned ${changeCount} rows.`);
        } else {
            showNotification("Data is already clean.", "info");
        }
    };

    // 3. Remove Empty Rows
    const removeEmptyRows = () => {
        if (!data.length) return;
        const initialCount = data.length;

        const nonEmptyData = data.filter(row => {
            // Check if every value in the row is empty/null/undefined
            return headers.some(key => {
                const val = row[key];
                return val !== null && val !== undefined && String(val).trim() !== "";
            });
        });

        const removedCount = initialCount - nonEmptyData.length;
        setData(nonEmptyData);

        if (removedCount > 0) {
            showNotification(`Removed ${removedCount} empty rows.`);
        } else {
            showNotification("No empty rows found.", "info");
        }
    };

    // 4. Case Normalization (Title Case)
    const standardizeCase = () => {
        if (!data.length) return;

        const toTitleCase = (str: string) => {
            return str.replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        };

        const standardizedData = data.map(row => {
            const newRow: DataRow = {};
            headers.forEach(key => {
                const value = row[key];
                newRow[key] = typeof value === 'string' ? toTitleCase(value) : value;
            });
            return newRow;
        });

        setData(standardizedData);
        showNotification("Standardized text case (Title Case).");
    };

    const downloadFile = () => {
        try {
            if (!data.length) {
                showNotification("No data to export!", "info");
                return;
            }

            // AoA Export Strategy
            const exportData = [
                headers,
                ...data.map(row => headers.map(header => row[header]))
            ];

            const ws = XLSX.utils.aoa_to_sheet(exportData);

            // Improved Auto-width: Check content length too
            const colWidths = headers.map((key, i) => {
                let maxWidth = key.length;
                // Check first 100 rows for content length estimation
                const sampleRows = data.slice(0, 100);
                sampleRows.forEach(row => {
                    const val = row[key];
                    const len = val ? String(val).length : 0;
                    if (len > maxWidth) maxWidth = len;
                });
                return { wch: Math.min(maxWidth + 2, 50) }; // Cap at 50 chars
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
        <div className="w-full max-w-7xl mx-auto px-8 py-16 space-y-16 flex flex-col items-center">

            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right duration-300">
                    <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 ${notification.type === 'success' ? 'bg-cyan-950/80 text-cyan-200' : 'bg-gray-900/80 text-gray-300'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-cyan-400' : 'bg-gray-400'}`}></div>
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="text-center space-y-6 pt-12">
                <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-400/50 bg-cyan-500/10 text-cyan-300 text-sm font-bold tracking-[0.2em] mb-4 animate-[pulse_3s_infinite] shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    V 3.1 // REFINERY CORE
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                    Data Refinery <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">Pro</span>
                </h2>
                <p className="text-gray-400 max-w-3xl mx-auto text-xl leading-relaxed font-light tracking-wide">
                    Transform your chaotic data into liquid gold.
                    <span className="text-cyan-400/80"> Drag, refine, export.</span>
                </p>
            </div>

            {/* Upload Area - Neon Glow */}
            {!data.length && (
                <div
                    className={`relative group w-full max-w-3xl rounded-[2.5rem] p-24 text-center transition-all duration-500 cursor-pointer overflow-hidden ${isDragging
                        ? 'bg-black/80 ring-4 ring-cyan-500 shadow-[0_0_100px_rgba(34,211,238,0.3)] scale-[1.02]'
                        : 'bg-black/40 border border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(34,211,238,0.15)] hover:bg-black/60'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}
                    />

                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .csv" />

                    <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 transition-all duration-500 border-2 ${isDragging ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_40px_rgba(34,211,238,0.5)] rotate-12 scale-110' : 'border-white/10 bg-white/5 group-hover:border-cyan-500/50 group-hover:scale-110 group-hover:bg-cyan-950/30'
                        }`}>
                        <Upload className={`w-16 h-16 transition-colors duration-300 ${isDragging ? 'text-cyan-300' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                    </div>
                    <h3 className="relative z-10 text-4xl font-bold text-white mb-5 tracking-tight group-hover:text-cyan-200 transition-colors">
                        {isDragging ? 'RELEASE TO UPLOAD' : 'Drop Excel or CSV'}
                    </h3>
                    <p className="relative z-10 text-gray-500 text-lg group-hover:text-gray-400 transition-colors">Click to browse your local machine</p>
                </div>
            )}

            {/* Workspace */}
            {data.length > 0 && (
                <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-16 duration-700 flex flex-col items-center">

                    {/* Toolbar - Cyberpunk Style */}
                    <div className="relative w-full overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8 bg-black/60 p-8 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 group hover:border-white/20 transition-all duration-500">
                        {/* Glow Effect behind toolbar */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

                        {/* File Info */}
                        <div className="relative z-10 flex items-center gap-8 w-full xl:w-auto justify-center xl:justify-start">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-[inner_0_0_20px_rgba(255,255,255,0.05)]">
                                <FileSpreadsheet className="w-10 h-10 text-cyan-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white truncate max-w-[300px] text-2xl tracking-tight leading-tight drop-shadow-md" title={fileName || 'Data'}>{fileName}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-3 py-1 rounded-md bg-white/5 text-cyan-300/80 text-xs font-bold font-mono tracking-wider border border-white/10 uppercase">{data.length} rows</span>
                                    <span className="px-3 py-1 rounded-md bg-white/5 text-purple-300/80 text-xs font-bold font-mono tracking-wider border border-white/10 uppercase">{headers.length} cols</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions - Neon Buttons */}
                        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 xl:gap-4 w-full xl:w-auto">

                            <div className="flex flex-wrap gap-2 justify-center">
                                <button
                                    onClick={removeDuplicates}
                                    className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] font-semibold active:scale-95 min-w-[100px]"
                                >
                                    <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
                                    <span className="text-xs uppercase tracking-wide">Dedupe</span>
                                </button>

                                <button
                                    onClick={deepClean}
                                    className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] font-semibold active:scale-95 min-w-[100px]"
                                >
                                    <Wand2 className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                                    <span className="text-xs uppercase tracking-wide">Deep Clean</span>
                                </button>

                                <button
                                    onClick={removeEmptyRows}
                                    className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(244,114,182,0.2)] font-semibold active:scale-95 min-w-[100px]"
                                >
                                    <Eraser className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
                                    <span className="text-xs uppercase tracking-wide">No Empty</span>
                                </button>

                                <button
                                    onClick={standardizeCase}
                                    className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(192,132,252,0.2)] font-semibold active:scale-95 min-w-[100px]"
                                >
                                    <Type className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                                    <span className="text-xs uppercase tracking-wide">Title Case</span>
                                </button>
                            </div>

                            <div className="w-px h-12 bg-white/10 mx-2 hidden xl:block"></div>

                            <div className="flex gap-2">
                                <button
                                    onClick={downloadFile}
                                    className="group relative overflow-hidden flex flex-col items-center justify-center gap-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all shadow-[0_0_30px_rgba(8,145,178,0.4)] hover:shadow-[0_0_50px_rgba(8,145,178,0.6)] font-bold tracking-wide active:scale-95 border border-white/10"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></span>
                                    <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                                    <span className="text-xs uppercase">Export</span>
                                </button>

                                <button
                                    onClick={() => setData([])}
                                    className="p-4 bg-gray-900/50 hover:bg-red-950/30 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-white/10 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                    title="Close File"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Preview (Scrollable) */}
                    <div className="w-full border border-white/10 rounded-[2rem] overflow-hidden bg-black/80 shadow-2xl backdrop-blur-md">
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black/90 border-b border-white/10">
                                    <tr>
                                        <th className="p-6 text-gray-500 font-bold w-20 text-center bg-black/80 sticky left-0 border-r border-white/10 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">#</th>
                                        {headers.map((header, i) => (
                                            <th key={i} className="p-6 text-cyan-100/70 font-bold border-b border-white/10 tracking-widest text-xs uppercase">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.slice(0, 50).map((row, i) => (
                                        <tr key={i} className="group hover:bg-cyan-900/10 transition-colors duration-150">
                                            <td className="p-5 text-gray-600 border-r border-white/10 text-center font-mono text-xs bg-black/40 sticky left-0 group-hover:bg-cyan-950/30 backdrop-blur-sm group-hover:text-cyan-500 transition-colors border-l-2 border-l-transparent group-hover:border-l-cyan-500">{i + 1}</td>
                                            {headers.map((header, j) => (
                                                <td key={j} className="p-5 text-gray-400 border-r border-white/5 last:border-0 max-w-[300px] truncate group-hover:text-cyan-100 transition-colors">
                                                    {String(row[header] !== null && row[header] !== undefined ? row[header] : '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {data.length > 50 && (
                            <div className="p-6 text-center text-sm font-medium text-gray-500 bg-black/90 border-t border-white/10 backdrop-blur-sm">
                                Showing first 50 rows of <span className="text-cyan-400 font-bold mx-1">{data.length.toLocaleString()}</span> records
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
