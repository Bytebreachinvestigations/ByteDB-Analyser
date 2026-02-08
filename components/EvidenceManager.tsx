
import React, { useRef, useState, useEffect } from 'react';
import { Evidence } from '../types';

interface UploadItem {
  id: string;
  file: File;
  fileName: string;
  progress: number;
  status: 'pending' | 'reading' | 'hashing' | 'error';
}

interface Props {
  evidenceList: Evidence[];
  setEvidenceList: React.Dispatch<React.SetStateAction<Evidence[]>>;
}

const EvidenceManager: React.FC<Props> = ({ evidenceList, setEvidenceList }) => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Concurrency control
  const processingRef = useRef<Set<string>>(new Set());
  const MAX_CONCURRENCY = 3;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
    }
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const addFilesToQueue = (fileList: FileList) => {
    const files = Array.from(fileList);
    const newItems: UploadItem[] = files.map(file => ({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        progress: 0,
        status: 'pending'
    }));
    setUploads(prev => [...prev, ...newItems]);
  };

  const processFile = async (item: UploadItem) => {
    try {
        // Update status to reading
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: 'reading', progress: 0 } : u));

        // Step 1: Read file
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploads(prev => prev.map(u => u.id === item.id ? { ...u, progress: percent } : u));
                }
            };
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsArrayBuffer(item.file);
        });

        // Step 2: Hash
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: 'hashing', progress: 100 } : u));
        
        // Slight delay to allow UI to show "Hashing" state perceptibly for small files
        await new Promise(r => setTimeout(r, 100));

        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const newEvidence: Evidence = {
            id: item.id,
            fileName: item.fileName,
            fileSize: item.file.size,
            fileType: item.file.type || 'application/octet-stream',
            timestamp: Date.now(),
            lastModified: item.file.lastModified,
            hash: hashHex,
            tags: [],
            category: 'Uncategorized'
        };

        setEvidenceList(prev => {
            const isDuplicate = prev.some(e => e.hash === hashHex);
            const evidenceToAdd = {
                ...newEvidence,
                tags: isDuplicate ? ['Duplicate'] : []
            };
            return [evidenceToAdd, ...prev];
        });

        // Remove from queue
        setUploads(prev => prev.filter(u => u.id !== item.id));

    } catch (error) {
        console.error("Error processing file", item.fileName, error);
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: 'error' } : u));
        // Auto remove error after 3s
        setTimeout(() => {
            setUploads(prev => prev.filter(u => u.id !== item.id));
        }, 3000);
    } finally {
        processingRef.current.delete(item.id);
    }
  };

  // Queue Manager Effect
  useEffect(() => {
    const pendingItems = uploads.filter(u => u.status === 'pending');
    const activeCount = processingRef.current.size;
    const availableSlots = MAX_CONCURRENCY - activeCount;

    if (pendingItems.length > 0 && availableSlots > 0) {
        const toProcess = pendingItems.slice(0, availableSlots);
        toProcess.forEach(item => {
            if (!processingRef.current.has(item.id)) {
                processingRef.current.add(item.id);
                processFile(item);
            }
        });
    }
  }, [uploads]);

  const exportChainOfCustody = () => {
    const report = {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        tool: "OmniDB Forensic Suite",
        totalArtifacts: evidenceList.length,
        artifacts: evidenceList.map(e => ({
            fileName: e.fileName,
            fileSize: e.fileSize,
            hashAlgorithm: "SHA-256",
            hash: e.hash,
            acquiredTimestamp: new Date(e.timestamp).toISOString(),
            integrityStatus: e.tags.includes('Duplicate') ? 'Duplicate' : 'Verified',
            tags: e.tags
        }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chain-of-custody-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       {/* Drop Zone */}
       <div 
         className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'}`}
         onDragEnter={handleDrag}
         onDragLeave={handleDrag}
         onDragOver={handleDrag}
         onDrop={handleDrop}
       >
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
             <i className="fas fa-fingerprint text-3xl text-sky-500"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">Secure Forensic Upload</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm text-center">
             Drag & drop evidence files or use the secure file picker below. Files are hashed (SHA-256) locally before chain of custody logging.
          </p>
          <input 
            ref={inputRef}
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleChange} 
          />
          <button 
            onClick={() => inputRef.current?.click()}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-sky-900/20 flex items-center gap-2"
          >
            <i className="fas fa-folder-open"></i>
            Browse System Files
          </button>
       </div>

       {/* Upload Progress Queue */}
       {uploads.length > 0 && (
         <div className="space-y-3">
           <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing Queue</h4>
              <span className="text-[10px] text-sky-400 font-mono animate-pulse">PROCESSING...</span>
           </div>
           {uploads.map(upload => (
              <div key={upload.id} className={`bg-slate-900/80 border p-3 rounded-lg flex items-center gap-4 shadow-sm transition-all ${upload.status === 'error' ? 'border-rose-900/50' : 'border-slate-800'}`}>
                 <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded text-sky-500 border border-slate-700">
                    {upload.status === 'pending' ? (
                       <i className="fas fa-clock text-slate-500"></i>
                    ) : upload.status === 'error' ? (
                       <i className="fas fa-triangle-exclamation text-rose-500"></i>
                    ) : upload.status === 'hashing' ? (
                       <i className="fas fa-fingerprint animate-pulse text-emerald-400"></i>
                    ) : (
                       <i className="fas fa-circle-notch animate-spin"></i>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                       <span className="text-sm font-medium text-slate-200 truncate pr-4">{upload.fileName}</span>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${
                           upload.status === 'hashing' ? 'text-emerald-500' : 
                           upload.status === 'pending' ? 'text-slate-500' :
                           upload.status === 'error' ? 'text-rose-500' : 'text-sky-500'
                       }`}>
                          {upload.status === 'pending' ? 'PENDING' :
                           upload.status === 'error' ? 'FAILED' :
                           upload.status === 'hashing' ? 'HASHING...' : 
                           `${upload.progress}%`}
                       </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-300 ease-out ${
                             upload.status === 'hashing' ? 'bg-emerald-500' : 
                             upload.status === 'error' ? 'bg-rose-500' :
                             upload.status === 'pending' ? 'bg-slate-700' : 'bg-sky-500'
                         }`} 
                         style={{ width: upload.status === 'pending' ? '0%' : `${upload.progress}%` }}
                       ></div>
                    </div>
                 </div>
              </div>
           ))}
         </div>
       )}

       {/* Evidence List */}
       <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden cyber-border">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <div className="flex items-center gap-4">
                 <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <i className="fas fa-box-archive text-sky-500"></i> Evidence Locker
                 </h3>
                 <div className="flex gap-2">
                     {evidenceList.length > 0 && (
                        <button 
                            onClick={exportChainOfCustody}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
                            title="Download Chain of Custody Report"
                        >
                            <i className="fas fa-file-signature"></i> Export Report
                        </button>
                     )}
                     <button 
                        onClick={() => inputRef.current?.click()}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
                     >
                        <i className="fas fa-plus"></i> Add Evidence
                    </button>
                 </div>
             </div>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{evidenceList.length} ARTIFACTS</span>
          </div>
          
          {evidenceList.length === 0 && uploads.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
                <i className="fas fa-folder-open text-slate-700 text-4xl mb-4"></i>
                <p className="text-slate-500 font-medium">No digital evidence collected yet.</p>
                <p className="text-xs text-slate-600 mt-1">Upload files to begin chain of custody tracking.</p>
             </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      <tr>
                         <th className="px-6 py-4">Asset Name</th>
                         <th className="px-6 py-4">Type</th>
                         <th className="px-6 py-4">Size</th>
                         <th className="px-6 py-4">Integrity (SHA-256)</th>
                         <th className="px-6 py-4">Acquired</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                      {evidenceList.map(item => (
                         <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 relative">
                                     <i className={`fas ${item.fileName.endsWith('.log') ? 'fa-file-lines' : item.fileName.endsWith('.pcap') ? 'fa-network-wired' : 'fa-file-code'}`}></i>
                                     {item.tags.includes('Duplicate') && (
                                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-slate-900" title="Duplicate Artifact"></div>
                                     )}
                                  </div>
                                  <div>
                                     <div className="text-sm font-medium text-slate-200">{item.fileName}</div>
                                     <div className="flex gap-2">
                                        <div className="text-[10px] text-slate-500 uppercase">{item.category}</div>
                                        {item.tags.includes('Duplicate') && (
                                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 rounded border border-amber-500/20 uppercase font-bold">Duplicate</span>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-mono text-sky-400 bg-sky-950/30 px-2 py-1 rounded border border-sky-900/50">
                                  {item.fileType.split('/')[1] || 'BINARY'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 font-mono">{formatBytes(item.fileSize)}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2 group/hash cursor-pointer" onClick={() => navigator.clipboard.writeText(item.hash)}>
                                  <i className="fas fa-shield-halved text-[10px] text-emerald-500/70"></i>
                                  <code className="text-[10px] text-emerald-500 font-mono bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30 max-w-[120px] truncate">
                                     {item.hash}
                                  </code>
                                  <i className="fas fa-copy text-[10px] text-slate-600 group-hover/hash:text-emerald-400 transition-colors"></i>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                               {new Date(item.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-950/30 rounded"
                                 title="Delete Evidence"
                                 onClick={() => setEvidenceList(prev => prev.filter(e => e.id !== item.id))}
                               >
                                  <i className="fas fa-trash-can"></i>
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}
       </div>
    </div>
  );
};

export default EvidenceManager;
