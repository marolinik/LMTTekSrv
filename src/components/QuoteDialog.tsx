import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Configuration } from './Configurator';
import { quoteService, QuoteItem } from '@/services/quote.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Printer, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: Configuration;
  totalPrice: number;
  marginPercentage: number;
  finalPrice: number;
}

export const QuoteDialog = ({ open, onOpenChange, config, totalPrice, marginPercentage, finalPrice }: QuoteDialogProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [savedQuote, setSavedQuote] = useState<any>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    if (!user || !savedQuote) {
      console.error('Missing user or savedQuote data');
      return null;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

    // Header with company name and logo area
    pdf.setFillColor(0, 122, 255);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LM TEK', margin, 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Server Configurator', margin, 28);

    // Quote number and date on right
    pdf.setFontSize(10);
    const quoteText = `Quote #${savedQuote.quoteNumber}`;
    const dateText = `Date: ${new Date(savedQuote.createdAt).toLocaleDateString()}`;
    pdf.text(quoteText, pageWidth - margin, 20, { align: 'right' });
    pdf.text(dateText, pageWidth - margin, 27, { align: 'right' });

    yPosition = 50;

    // Customer Information
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Customer Information', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${user.name}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${user.email}`, margin, yPosition);
    yPosition += 6;
    if (user.company) {
      pdf.text(`Company: ${user.company}`, margin, yPosition);
      yPosition += 6;
    }
    if (user.phone) {
      pdf.text(`Phone: ${user.phone}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 6;

    // Configuration Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Server Configuration', margin, yPosition);
    yPosition += 8;

    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Component', margin + 2, yPosition);
    pdf.text('Specification', margin + 60, yPosition);
    pdf.text('Qty', pageWidth - margin - 40, yPosition);
    pdf.text('Price', pageWidth - margin - 10, yPosition, { align: 'right' });

    yPosition += 8;

    // Configuration items
    pdf.setFont('helvetica', 'normal');
    const items = [
      { component: 'GPU', spec: `${config.gpu.quantity}x ${config.gpu.model}`, qty: config.gpu.quantity, price: config.gpu.price },
      ...(config.gpu.nvlink ? [{ component: 'NVLink Bridge', spec: 'NVLink 2-way bridge', qty: config.gpu.nvlink.quantity, price: config.gpu.nvlink.totalPrice }] : []),
      { component: 'CPU', spec: `${config.cpu.model}`, qty: 1, price: config.cpu.price },
      { component: 'RAM', spec: `${config.ram.quantity}x ${config.ram.capacity}GB DDR5`, qty: config.ram.quantity, price: config.ram.price },
      { component: 'Storage', spec: config.storage.os, qty: 1, price: config.storage.price },
      { component: 'Power Supply', spec: `${config.power.model} (${config.power.capacity}W)`, qty: 1, price: config.power.price },
      { component: 'Motherboard', spec: config.motherboard.model, qty: 1, price: config.motherboard.price },
      { component: 'Cooling', spec: config.cooling.model, qty: 1, price: config.cooling.price },
      { component: 'Network', spec: config.network.model, qty: 1, price: config.network.price },
      { component: 'Chassis', spec: config.chassis.model, qty: 1, price: config.chassis.price },
    ];

    items.forEach((item) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(9);
      pdf.text(item.component, margin + 2, yPosition);

      // Wrap long spec text
      const specLines = pdf.splitTextToSize(item.spec, 50);
      pdf.text(specLines[0], margin + 60, yPosition);

      pdf.text(item.qty.toString(), pageWidth - margin - 40, yPosition);
      pdf.text(`€${item.price.toLocaleString()}`, pageWidth - margin - 10, yPosition, { align: 'right' });

      yPosition += 7;
    });

    // Total
    yPosition += 5;
    pdf.setDrawColor(0, 122, 255);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Subtotal
    if (marginPercentage > 10) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Subtotal:', pageWidth - margin - 60, yPosition);
      pdf.text(`€${totalPrice.toLocaleString()}`, pageWidth - margin - 10, yPosition, { align: 'right' });
      yPosition += 7;

      // Margin
      pdf.setTextColor(34, 197, 94);
      pdf.text(`Margin (${marginPercentage}%):`, pageWidth - margin - 60, yPosition);
      pdf.text(`+€${(finalPrice - totalPrice).toLocaleString()}`, pageWidth - margin - 10, yPosition, { align: 'right' });
      yPosition += 10;
    }

    // Total Price
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Total Price:', pageWidth - margin - 60, yPosition);
    pdf.setTextColor(0, 122, 255);
    pdf.setFontSize(14);
    pdf.text(`€${finalPrice.toLocaleString()}`, pageWidth - margin - 10, yPosition, { align: 'right' });

    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    // Notes section
    if (notes.trim()) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Additional Notes:', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const notesLines = pdf.splitTextToSize(notes, pageWidth - 2 * margin);
      notesLines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });
    }

      // Footer
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Thank you for choosing LM TEK Server Configurator', pageWidth / 2, footerY, { align: 'center' });
      pdf.text('For questions, please contact us at support@lmtek.com', pageWidth / 2, footerY + 4, { align: 'center' });

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please login or register to make a quote.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert configuration to quote items
      const items: Omit<QuoteItem, 'id'>[] = [
        {
          category: 'GPU',
          name: config.gpu.model,
          spec: `Quantity: ${config.gpu.quantity}`,
          quantity: config.gpu.quantity,
          unitPrice: config.gpu.price / config.gpu.quantity,
          totalPrice: config.gpu.price,
        },
        {
          category: 'CPU',
          name: config.cpu.model,
          spec: `${config.cpu.cores} Cores`,
          quantity: 1,
          unitPrice: config.cpu.price,
          totalPrice: config.cpu.price,
        },
        {
          category: 'RAM',
          name: `${config.ram.capacity}GB DDR5`,
          spec: `${config.ram.capacity}GB`,
          quantity: 1,
          unitPrice: config.ram.price,
          totalPrice: config.ram.price,
        },
        {
          category: 'Storage',
          name: config.storage.os,
          spec: `OS Drive + ${config.storage.data.filter(d => d !== 'NO STORAGE').length} Data Drives`,
          quantity: 1,
          unitPrice: config.storage.price,
          totalPrice: config.storage.price,
        },
        {
          category: 'Power Supply',
          name: config.power.model,
          spec: `${config.power.capacity}W`,
          quantity: 1,
          unitPrice: config.power.price,
          totalPrice: config.power.price,
        },
        {
          category: 'Network',
          name: config.network.model,
          spec: 'Network Interface',
          quantity: 1,
          unitPrice: config.network.price,
          totalPrice: config.network.price,
        },
        {
          category: 'Motherboard',
          name: config.motherboard.model,
          spec: 'Server Motherboard',
          quantity: 1,
          unitPrice: config.motherboard.price,
          totalPrice: config.motherboard.price,
        },
        {
          category: 'Cooling',
          name: config.cooling.model,
          spec: 'Liquid Cooling System',
          quantity: 1,
          unitPrice: config.cooling.price,
          totalPrice: config.cooling.price,
        },
      ];

      // Create quote - the backend automatically saves user and timestamp
      const quote = await quoteService.create({
        configuration: config,
        items,
        totalPrice: finalPrice,
        notes: notes.trim() || undefined,
        marginPercentage,
        subtotal: totalPrice,
      });

      setSavedQuote(quote);

      toast({
        title: 'Quote saved successfully!',
        description: `Quote #${quote.quoteNumber} created on ${new Date(quote.createdAt).toLocaleString()}`,
      });

      // Reset isSubmitting before showing PDF preview
      setIsSubmitting(false);

      // Now show PDF preview
      setShowPdfPreview(true);
    } catch (error: any) {
      toast({
        title: 'Failed to create quote',
        description: error.response?.data?.error || 'An error occurred while creating your quote.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = () => {
    setIsSubmitting(true);

    // Use setTimeout to ensure UI updates
    setTimeout(() => {
      try {
        console.log('Starting PDF generation...');
        const pdf = generatePDF();

        if (!pdf) {
          throw new Error('PDF generation returned null');
        }

        console.log('PDF generated, creating blob...');
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfDataUrl(pdfUrl);

        console.log('PDF preview ready');
        toast({
          title: 'PDF Generated!',
          description: 'Your quote PDF is ready to download or print.',
        });
      } catch (error: any) {
        console.error('PDF generation error:', error);
        toast({
          title: 'PDF Generation Failed',
          description: error.message || 'There was an error generating the PDF.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 100);
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = generatePDF();
      if (pdf && savedQuote) {
        pdf.save(`LM-TEK-Quote-${savedQuote.quoteNumber}.pdf`);
        toast({
          title: 'PDF Downloaded!',
          description: `Quote ${savedQuote.quoteNumber} has been downloaded.`,
        });
      } else {
        throw new Error('Failed to generate PDF for download');
      }
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Could not download PDF.',
        variant: 'destructive',
      });
    }
  };

  const handlePrintPDF = () => {
    if (pdfDataUrl) {
      const printWindow = window.open(pdfDataUrl);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  const handleClose = () => {
    setShowPdfPreview(false);
    setPdfDataUrl('');
    setSavedQuote(null);
    setNotes('');
    setIsSubmitting(false);
    onOpenChange(false);
    if (savedQuote) {
      navigate('/my-quotes');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showPdfPreview ? (
          <>
            <DialogHeader>
              <DialogTitle>Make a Quote</DialogTitle>
              <DialogDescription>
                Review your configuration and create a quote. The system will save who made it and when.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Configuration Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Configuration Summary</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">GPU:</span>
                    <span>{config.gpu.quantity}x {config.gpu.model}</span>
                  </div>

                  {config.gpu.nvlink && (
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">NVLink Bridges:</span>
                      <span>{config.gpu.nvlink.quantity}x NVLink 2-way bridge</span>
                    </div>
                  )}

                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">CPU:</span>
                    <span>{config.cpu.model.split('(')[0].trim()} ({config.cpu.cores} Cores)</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">RAM:</span>
                    <span>{config.ram.quantity}x {config.ram.capacity}GB DDR5</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Storage OS:</span>
                    <span>{config.storage.os}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Storage Data:</span>
                    <span>{config.storage.data.filter(d => d !== 'NO STORAGE').join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Power:</span>
                    <span>{config.power.quantity}x {config.power.model}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Network:</span>
                    <span>{config.network.model}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Motherboard:</span>
                    <span>{config.motherboard.model}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Cooling:</span>
                    <span>{config.cooling.model}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Chassis:</span>
                    <span>{config.chassis.model}</span>
                  </div>
                </div>

                {marginPercentage > 10 && (
                  <>
                    <div className="flex justify-between p-3 text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>€{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 text-green-600 font-medium">
                      <span>Margin ({marginPercentage}%):</span>
                      <span>+€{(finalPrice - totalPrice).toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between p-4 bg-primary/10 rounded-lg text-lg font-bold">
                  <span>Total Price:</span>
                  <span className="text-primary">€{finalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 bg-muted rounded-lg space-y-1">
                  <p className="text-sm font-medium">Quote will be created by:</p>
                  <p className="text-sm">{user.name} ({user.email})</p>
                  {user.company && <p className="text-sm text-muted-foreground">{user.company}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    Date & Time: {new Date().toLocaleString()}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Quote...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Quote Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Quote Created Successfully!</DialogTitle>
              <DialogDescription>
                Quote #{savedQuote?.quoteNumber} created on {new Date(savedQuote?.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* PDF Preview */}
              {pdfDataUrl ? (
                <div className="border rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={pdfDataUrl}
                    className="w-full h-[500px]"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">Ready to Generate PDF</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to generate your quote PDF
                  </p>
                </div>
              )}

              {/* Quote Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Quote Number:</span>
                  <span>{savedQuote?.quoteNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created By:</span>
                  <span>{user?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created On:</span>
                  <span>{new Date(savedQuote?.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <span className="text-yellow-600 font-semibold">{savedQuote?.status}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <div className="flex gap-3">
                  {pdfDataUrl && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handlePrintPDF}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {pdfDataUrl ? 'Regenerate PDF' : 'Make a PDF Quote'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
