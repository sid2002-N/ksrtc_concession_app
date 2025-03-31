import { useState } from "react";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Application, ApplicationStatus } from "@shared/schema";

// Payment form schema
const paymentSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  transactionDate: z.string().min(1, "Transaction date is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
  amount: z.number().min(1, "Amount is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function StudentPayment() {
  const { id } = useParams();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get application details
  const { data: application, isLoading: isLoadingApplication, error: applicationError } = useQuery<Application>({
    queryKey: [`/api/applications/${id}`],
  });

  // Set up the form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      transactionId: "",
      transactionDate: new Date().toISOString().slice(0, 10),
      accountHolder: "",
      amount: 0,
      paymentMethod: "",
    },
  });

  // Submit payment details
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const res = await apiRequest("POST", `/api/applications/${id}/payment`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Details Submitted",
        description: "Your payment details have been submitted successfully and are awaiting verification.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      navigate(`/student/track/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    paymentMutation.mutate(data);
  };

  const isLoading = isLoadingApplication;

  // Redirect if application is not in the right status
  if (!isLoading && application && application.status !== ApplicationStatus.DEPOT_APPROVED) {
    navigate(`/student/track/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Submit Payment Details
              </h1>
              {application && (
                <p className="mt-1 text-gray-500">
                  Application ID: KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}
                </p>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter your payment details for the concession pass
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : applicationError ? (
                <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
                  <h3 className="font-medium">Error loading application</h3>
                  <p className="text-sm mt-2">
                    We couldn't load your application. Please try again or contact support.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/student/dashboard")}
                    variant="outline"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  {/* Application summary */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h3 className="font-medium text-blue-800">Payment Instructions</h3>
                    <p className="text-sm mt-2 text-blue-700">
                      Please make the payment through bank transfer, UPI, or other available methods to the account details below.
                      After making the payment, submit the transaction details here.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span className="font-medium">Amount:</span>
                        <span>₹150.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Account Number:</span>
                        <span>1234567890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Bank:</span>
                        <span>State Bank of India</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">IFSC:</span>
                        <span>SBIN0001234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">UPI ID:</span>
                        <span>ksrtc@sbi</span>
                      </div>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="transactionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transaction ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter transaction ID or reference number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="transactionDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount (₹)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Enter amount paid" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="accountHolder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Holder Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter the name on the account used for payment" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="upi">UPI</SelectItem>
                                  <SelectItem value="netbanking">Net Banking</SelectItem>
                                  <SelectItem value="debit_card">Debit Card</SelectItem>
                                  <SelectItem value="credit_card">Credit Card</SelectItem>
                                  <SelectItem value="bank_transfer">Bank Transfer / NEFT / RTGS</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/student/track/${id}`)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={paymentMutation.isPending}
                        >
                          {paymentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : "Submit Payment Details"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
