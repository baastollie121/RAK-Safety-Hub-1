'use client';

import { useState, RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UseDownloadPdfProps {
  reportRef: RefObject<HTMLDivElement>;
  fileName: string;
}

export function useDownloadPdf({ reportRef, fileName }: UseDownloadPdfProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    const element = reportRef.current;
    if (!element) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find the report content to download.' });
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const PADDING = 10;
      const contentWidth = pdfWidth - (PADDING * 2);
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = PADDING;

      pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, imgHeight);
      heightLeft -= (pdf.internal.pageSize.getHeight() - (PADDING * 2));

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + PADDING;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, imgHeight);
        heightLeft -= (pdf.internal.pageSize.getHeight() - (PADDING * 2));
      }
      
      pdf.save(`${fileName}.pdf`);
      toast({ title: 'Success', description: 'PDF downloaded successfully.' });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const DownloadButton = () => (
    <Button onClick={handleDownload} disabled={isDownloading} variant="outline">
      {isDownloading ? (
        <>
          <Loader2 className="animate-spin mr-2 size-4" /> Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 size-4" /> Download PDF
        </>
      )}
    </Button>
  );

  return { isDownloading, handleDownload, DownloadButton };
}
