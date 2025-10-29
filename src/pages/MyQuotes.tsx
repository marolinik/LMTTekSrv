import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { quoteService, Quote } from '@/services/quote.service';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, FileText, Calendar, DollarSign, Package, ArrowLeft, Trash2, Copy, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type QuoteStatus = 'ALL' | Quote['status'];

const statusColors: Record<Quote['status'], string> = {
  PENDING: 'bg-yellow-500',
  REVIEWED: 'bg-blue-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  COMPLETED: 'bg-purple-500',
};

export default function MyQuotes() {
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('ALL');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch quotes
  const { data, isLoading, error } = useQuery<{ quotes: Quote[]; pagination: any }>({
    queryKey: ['my-quotes', selectedStatus],
    queryFn: () => quoteService.getAll({
      status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      page: 1,
      limit: 50,
    }),
  });

  const quotes = data?.quotes || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (quoteId: string) => quoteService.delete(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quotes'] });
      toast({
        title: 'Quote deleted',
        description: 'The quote has been deleted successfully.',
      });
      setSelectedQuote(null);
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete quote',
        description: error.response?.data?.error || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  // Copy mutation
  const copyMutation = useMutation({
    mutationFn: (quote: Quote) =>
      quoteService.create({
        configuration: quote.configuration,
        items: quote.items,
        totalPrice: quote.totalPrice,
        notes: quote.notes ? `Copy of: ${quote.notes}` : undefined,
      }),
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ['my-quotes'] });
      toast({
        title: 'Quote copied',
        description: `New quote #${newQuote.quoteNumber} has been created.`,
      });
      setSelectedQuote(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to copy quote',
        description: error.response?.data?.error || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  // Handle delete
  const handleDeleteClick = (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (quoteToDelete) {
      deleteMutation.mutate(quoteToDelete.id);
    }
  };

  // Handle copy
  const handleCopyClick = (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    copyMutation.mutate(quote);
  };

  // Handle edit
  const handleEditClick = (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    // Store configuration in localStorage and navigate to configurator
    localStorage.setItem('editingQuoteConfig', JSON.stringify(quote.configuration));
    localStorage.setItem('editingQuoteId', quote.id);
    navigate('/');
    toast({
      title: 'Editing quote',
      description: 'Configuration loaded into the configurator.',
    });
  };

  // Filter counts
  const statusCounts = {
    ALL: quotes.length,
    PENDING: quotes.filter((q) => q.status === 'PENDING').length,
    REVIEWED: quotes.filter((q) => q.status === 'REVIEWED').length,
    APPROVED: quotes.filter((q) => q.status === 'APPROVED').length,
    REJECTED: quotes.filter((q) => q.status === 'REJECTED').length,
    COMPLETED: quotes.filter((q) => q.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Configurator
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">My Quotes</h1>
          <p className="text-muted-foreground">
            View and track your server configuration quote requests
          </p>
        </div>

        {/* Tabs for status filtering */}
        <Tabs value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as QuoteStatus)}>
          <TabsList className="mb-6">
            <TabsTrigger value="ALL">All ({statusCounts.ALL})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({statusCounts.PENDING})</TabsTrigger>
            <TabsTrigger value="REVIEWED">Reviewed ({statusCounts.REVIEWED})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({statusCounts.APPROVED})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({statusCounts.REJECTED})</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed ({statusCounts.COMPLETED})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-destructive">Failed to load quotes. Please try again.</p>
                </CardContent>
              </Card>
            ) : quotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedStatus === 'ALL'
                      ? "You haven't submitted any quotes yet."
                      : `You don't have any ${selectedStatus.toLowerCase()} quotes.`}
                  </p>
                  <Link to="/">
                    <Button>Create Your First Quote</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {quotes.map((quote) => (
                  <Card
                    key={quote.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Quote #{quote.quoteNumber}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3" />
                              Submitted on {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[quote.status]}>
                            {quote.status}
                          </Badge>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleEditClick(quote, e)}
                              title="Edit quote"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleCopyClick(quote, e)}
                              title="Copy quote"
                              disabled={copyMutation.isPending}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => handleDeleteClick(quote, e)}
                              title="Delete quote"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {quote.configuration.gpu.quantity}x {quote.configuration.gpu.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            ${quote.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.items.length} items
                        </div>
                      </div>
                      {quote.adminNotes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{quote.adminNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quote Detail Dialog */}
        {selectedQuote && (
          <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Quote #{selectedQuote.quoteNumber}</span>
                  <Badge className={statusColors[selectedQuote.status]}>
                    {selectedQuote.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedQuote.createdAt), 'MMMM dd, yyyy')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Configuration Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Configuration</h3>
                  <div className="grid gap-2 text-sm">
                    {selectedQuote.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.spec}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.totalPrice.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x ${item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between p-4 bg-primary/10 rounded-lg mt-4 font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">${selectedQuote.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Client Notes */}
                {selectedQuote.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Your Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                      {selectedQuote.notes}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedQuote.adminNotes && (
                  <div>
                    <h3 className="font-semibold mb-2">Admin Response</h3>
                    <p className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      {selectedQuote.adminNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(selectedQuote, e);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Configuration
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyClick(selectedQuote, e);
                    }}
                    disabled={copyMutation.isPending}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copyMutation.isPending ? 'Copying...' : 'Copy Quote'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(selectedQuote, e);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quote</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete Quote #{quoteToDelete?.quoteNumber}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setQuoteToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
