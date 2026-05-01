import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileUp, 
  Trash2, 
  Download, 
  Plus, 
  FileImage, 
  Settings,
  ArrowRightLeft,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SeoContent from '../components/SeoContent';

interface ImageFile {
  id: string;
  name: string;
  url: string;
  size: string;
  file: File;
}

export default function PdfConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState('a4');
  const [noMargins, setNoMargins] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      file
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: pageSize
      });

      for (let i = 0; i < images.length; i++) {
        if (i !== 0) pdf.addPage();
        
        await new Promise((resolve) => {
          const img = new Image();
          img.src = images[i].url;
          img.onload = () => {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const margin = noMargins ? 0 : 20; // 10mm margin on each side (20mm total)
            const effectiveWidth = pageWidth - margin;
            const effectiveHeight = pageHeight - margin;
            
            // Calculate scale to fit effective area while maintaining aspect ratio
            const ratio = img.width / img.height;
            let drawWidth = effectiveWidth;
            let drawHeight = effectiveWidth / ratio;

            if (drawHeight > effectiveHeight) {
              drawHeight = effectiveHeight;
              drawWidth = effectiveHeight * ratio;
            }

            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            pdf.addImage(img, 'JPEG', x, y, drawWidth, drawHeight);
            resolve(null);
          };
        });
      }

      pdf.save('Lumina_Converted.pdf');
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-container">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">PDF Forge</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Transform your documents and images into clean PDFs.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer"
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform text-center flex-col">
               <FileUp size={32} />
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors">Choose Images</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm px-6 transition-colors">
              Select one or multiple images to combine into a single PDF document. Drag and drop supported.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px] md:min-h-[400px] transition-colors">
            <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors">
                <FileImage size={18} className="text-slate-400 dark:text-slate-500" /> Image Queue
              </h4>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider transition-colors">
                {images.length} Files Selected
              </span>
            </div>

            <div className="p-4 md:p-6 space-y-3 overflow-y-auto max-h-[400px] md:max-h-none">
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div 
                    key={img.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-slate-50 dark:border-slate-800 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border dark:border-slate-700">
                       <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate transition-colors">{img.name}</div>
                       <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 transition-colors">{img.size}</div>
                    </div>
                    <button 
                       onClick={() => removeImage(img.id)}
                       className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                    >
                       <Trash2 size={16} md:size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 md:py-20 text-slate-300 dark:text-slate-700">
                   <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-dashed rounded-xl mb-4 border-slate-200 dark:border-slate-800" />
                   <p className="text-xs md:text-sm font-medium">Your queue is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <Settings size={18} className="text-slate-400 dark:text-slate-500" /> Settings
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3 transition-colors">Page Size</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['a4', 'letter', 'legal', 'tabloid'].map(p => (
                         <button 
                           key={p}
                           onClick={() => setPageSize(p)}
                           className={cn(
                             "px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold rounded-xl border transition-all uppercase tracking-wider",
                             pageSize === p 
                               ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                               : "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                           )}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3 transition-colors">Margins</label>
                    <button 
                      onClick={() => setNoMargins(!noMargins)}
                      className="w-full p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group"
                    >
                       <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors">No Margins</span>
                       <div className={cn(
                          "w-10 h-5 rounded-full relative transition-all duration-300",
                          noMargins ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                       )}>
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                            noMargins ? "right-1" : "left-1"
                          )} />
                       </div>
                    </button>
                 </div>
              </div>

              <div className="mt-8 md:mt-10">
                 <button 
                    disabled={images.length === 0 || isProcessing}
                    onClick={generatePdf}
                    className="w-full bg-slate-900 dark:bg-indigo-600 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black dark:hover:bg-indigo-700 active:scale-[0.98] transition-all"
                 >
                    {isProcessing ? <Loader2 className="animate-spin text-white" /> : <Download size={20} />}
                    {isProcessing ? 'Processing...' : 'Generate PDF'}
                 </button>
              </div>
           </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900/50 transition-colors">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2 transition-colors">
                <ArrowRightLeft size={16} /> Other Tools coming soon
              </h4>
              <div className="space-y-2 opacity-60">
                 <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-400 transition-colors">PDF to Word</div>
                 <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-400 transition-colors">Compress PDF</div>
              </div>
           </div>
        </div>
      </div>

      <SeoContent 
        title="Free PDF Converter Online: Transform Images and Documents"
        description="Our Free PDF Converter is a powerful, browser-based tool designed to help you create clean and professional PDF documents in seconds. Whether you're combining several project photos into a single report or converting a series of images into a structured document, our 'PDF Forge' handles everything with precision. With support for multiple page sizes like A4 and Letter, and options for margin-less printing, we ensure your documents look exactly how you intend them to. No software installation, no watermarks, just high-quality PDF generation."
        features={[
          "Bulk Image Support: Select multiple images to combine into a single PDF document.",
          "Custom Page Sizes: Support for A4, Letter, Legal, and Tabloid formats.",
          "Margin Control: Toggle between standard margins and edge-to-edge 'No Margins' mode.",
          "Instant Queue: Easily manage and re-order your image queue before generation.",
          "Privacy Optimized: All processing happens in your browser; your files are never uploaded.",
          "High Fidelity: Maintains the original resolution and quality of your uploaded images."
        ]}
        steps={[
          "Click the upload area to select one or more images from your device.",
          "Review your images in the 'Image Queue' and remove any if necessary.",
          "Choose your desired page size and margin settings in the side panel.",
          "Click 'Generate PDF' to trigger the browser-side PDF forge.",
          "Download your finished PDF document immediately to your device."
        ]}
        benefits={[
          "Zero cost, professional-grade PDF generation.",
          "Secure processing with no server-side data storage.",
          "Universal compatibility with all modern PDF readers.",
          "Combines multiple files into one for easy sharing.",
          "Fast execution even with large image files."
        ]}
        faq={[
          { q: "Is there a limit on file size?", a: "There is no strict limit, but very large images might take a few moments longer to process within your browser's memory." },
          { q: "Which image formats are supported?", a: "You can upload all standard image formats including JPEG, PNG, and WebP." },
          { q: "Will the PDF have watermarks?", a: "No, our tool is free to use and provides clean PDF exports without any additional watermarks or branding." },
          { q: "Are my images uploaded to a server?", a: "No. For your security and privacy, the entire conversion process happens locally in your browser using the jsPDF library." },
          { q: "Can I convert images back to original format?", a: "This specific tool is designed for PDF creation. To extract images from a PDF, we will be launching a 'PDF to Image' tool soon." }
        ]}
        ctaTitle="Forge your documents today."
      />
    </div>
  );
}
