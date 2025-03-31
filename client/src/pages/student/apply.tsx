import { useState } from "react";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { College, Depot } from "@shared/schema";

// Application form schema
const applicationSchema = z.object({
  startPoint: z.string().min(1, "Start point is required"),
  endPoint: z.string().min(1, "End point is required"),
  depotId: z.number({ required_error: "Depot is required" }),
  isRenewal: z.boolean().default(false),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function StudentApply() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get colleges and depots
  const { data: colleges, isLoading: isLoadingColleges } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  const { data: depots, isLoading: isLoadingDepots } = useQuery<Depot[]>({
    queryKey: ["/api/depots"],
  });

  // Get student profile to pre-populate form
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["/api/student"],
  });

  // Set up the form
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      startPoint: "",
      endPoint: "",
      depotId: 0,
      isRenewal: false,
    },
  });

  // Submit application
  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted",
        description: "Your concession application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      navigate(`/student/track/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    applicationMutation.mutate(data);
  };

  const isLoading = isLoadingColleges || isLoadingDepots || isLoadingStudent;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Apply for Concession
              </h1>
              <p className="mt-1 text-gray-500">
                Fill in the details below to apply for a new concession pass
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Concession Application Form</CardTitle>
              <CardDescription>
                Enter your travel details for the concession pass
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="startPoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Point</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter starting location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endPoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Point</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter destination" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="depotId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select KSRTC Depot</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value ? field.value.toString() : undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select depot" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {depots?.map((depot) => (
                                    <SelectItem key={depot.id} value={depot.id.toString()}>
                                      {depot.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center gap-2 h-full pt-8">
                          <FormField
                            control={form.control}
                            name="isRenewal"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>This is a renewal application</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Student Information Display */}
                      <div className="bg-gray-50 p-4 rounded-md border mt-6">
                        <h3 className="text-md font-medium mb-2">Your Student Information</h3>
                        {student && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {student.firstName} {student.lastName}
                            </div>
                            <div>
                              <span className="font-medium">College ID:</span> {student.collegeIdNumber}
                            </div>
                            <div>
                              <span className="font-medium">Course:</span> {student.course}
                            </div>
                            <div>
                              <span className="font-medium">Department:</span> {student.department}
                            </div>
                            <div>
                              <span className="font-medium">Semester:</span> {student.semester}
                            </div>
                            <div>
                              <span className="font-medium">College:</span> {
                                colleges?.find(c => c.id === student.collegeId)?.name || 'Loading...'
                              }
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          This information will be included in your application
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/student/dashboard")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={applicationMutation.isPending}
                      >
                        {applicationMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
