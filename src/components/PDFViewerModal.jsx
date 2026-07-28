import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Eye, ExternalLink, Bookmark, Check, Image as ImageIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const PDFViewerModal = ({ material, onClose }) => {
  const { trackDownload, favorites, toggleFavoriteItem } = useData();
  const { currentUser } = useAuth();
  const [downloaded, setDownloaded] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  if (!material) return null;

  const isFav = material.id ? favorites?.materialIds?.includes(material.id) : false;

  const isImage = material.attachmentType === 'image' || 
    (typeof material.fileUrl === 'string' && (
      material.fileUrl.startsWith('data:image/') ||
      /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(material.fileUrl)
    ));

  const fileTitle = material.title || material.attachmentName || 'Document Preview';
  const fileLink = material.fileUrl || material.attachmentUrl;

  const handleDownload = () => {
    if (material.id) trackDownload(material.id);
    setDownloaded(true);
    
    const ext = isImage ? 'png' : 'pdf';
    const cleanTitle = fileTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = material.fileName || material.attachmentName || `${cleanTitle}.${ext}`;

    try {
      if (typeof fileLink === 'string' && fileLink.startsWith('data:')) {
        const parts = fileLink.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      } else {
        const link = document.createElement('a');
        link.href = fileLink;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error('Download error:', e);
      const link = document.createElement('a');
      link.href = fileLink;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => setDownloaded(false), 3000);
  };

  const isPpt = material.category === 'PPTs' || 
    (typeof material.fileUrl === 'string' && /\.(ppt|pptx)(\?.*)?$/i.test(material.fileUrl)) ||
    (typeof material.fileName === 'string' && /\.(ppt|pptx)$/i.test(material.fileName));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                {material.category && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                    {material.category}
                  </span>
                )}
                {material.year && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {material.year}
                  </span>
                )}
                {material.semester && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Sem {material.semester}
                  </span>
                )}
                {material.subjectName && <span className="text-xs text-slate-400 truncate">{material.subjectName}</span>}
              </div>
              <h3 className="text-base font-bold text-white truncate">{fileTitle}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Bookmark button */}
            {currentUser && material.id && (
              <button
                onClick={() => toggleFavoriteItem('material', material.id)}
                className={`p-2 rounded-xl border transition-all ${
                  isFav 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={isFav ? "Remove from Favorites" : "Save to Favorites"}
              >
                <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all"
            >
              {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
              <span>{downloaded ? "Downloaded!" : "Download File"}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-info bar */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {material.updatedDate ? (
              <span className="flex items-center text-indigo-300 font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Updated: {material.updatedDate}{material.updatedTime ? ` • ${material.updatedTime}` : ''}
              </span>
            ) : material.uploadDate && (
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Uploaded: {material.uploadDate}{material.uploadTime ? ` • ${material.uploadTime}` : ''}</span>
            )}
            {material.downloadCount !== undefined && (
              <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Downloads: {material.downloadCount}</span>
            )}
            {material.fileSize && <span>Size: {material.fileSize}</span>}
          </div>
          
          <div className="flex items-center space-x-3">
            {!isImage && typeof fileLink === 'string' && fileLink.startsWith('http') && (
              <button
                onClick={() => setUseGoogleViewer(!useGoogleViewer)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
              >
                {useGoogleViewer ? "Switch to Direct Embed" : "Try Online Viewer"}
              </button>
            )}
            <a 
              href={fileLink} 
              target="_blank" 
              rel="noreferrer"
              className="text-brand-400 hover:text-brand-300 flex items-center hover:underline"
            >
              <span>Open in external tab</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Main Preview Container */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
          {isImage ? (
            <div className="w-full h-full p-6 flex items-center justify-center overflow-auto">
              <img
                src={fileLink}
                alt={fileTitle}
                className="max-h-full max-w-full object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />
            </div>
          ) : isPpt ? (
            typeof fileLink === 'string' && fileLink.startsWith('http') ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileLink)}&embedded=true`}
                title={fileTitle}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Presentation File (PPT)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Preview is not available for offline PPT slides. Please download the file to view the full presentation presentation slides.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Presentation</span>
                </button>
              </div>
            )
          ) : useGoogleViewer && typeof fileLink === 'string' && fileLink.startsWith('http') ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileLink)}&embedded=true`}
              title={fileTitle}
              className="w-full h-full border-0"
            />
          ) : (
            <object
              data={fileLink}
              type="application/pdf"
              className="w-full h-full border-0"
            >
              <iframe
                src={fileLink}
                title={fileTitle}
                className="w-full h-full border-0"
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                  <FileText className="w-12 h-12 text-slate-600 mb-2" />
                  <p className="text-slate-300 text-sm font-semibold">PDF File Preview</p>
                  <div className="flex items-center space-x-3">
                    {typeof fileLink === 'string' && fileLink.startsWith('http') && (
                      <button
                        onClick={() => setUseGoogleViewer(true)}
                        className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs"
                      >
                        Open Online PDF Reader
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                    >
                      Download PDF File
                    </button>
                  </div>
                </div>
              </iframe>
            </object>
          )}
        </div>

      </div>
    </div>
  );
};
