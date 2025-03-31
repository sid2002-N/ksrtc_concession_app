import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UserType, 
  studentRegistrationSchema, 
  collegeRegistrationSchema,
  depotRegistrationSchema
} from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { 
    user, 
    isLoading, 
    loginMutation, 
    registerStudentMutation, 
    registerCollegeMutation, 
    registerDepotMutation 
  } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [registrationType, setRegistrationType] = useState("student");
  
  const { data: colleges } = useQuery<any[]>({
    queryKey: ["/api/colleges"],
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.userType === UserType.STUDENT) {
        navigate("/student/dashboard");
      } else if (user.userType === UserType.COLLEGE) {
        navigate("/college/dashboard");
      } else if (user.userType === UserType.DEPOT) {
        navigate("/depot/dashboard");
      }
    }
  }, [user, navigate]);

  // Login form setup
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      userType: UserType.STUDENT,
    },
  });

  // Student registration form setup with validation
  const studentRegSchema = studentRegistrationSchema.extend({
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const studentRegForm = useForm<z.infer<typeof studentRegSchema>>({
    resolver: zodResolver(studentRegSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      collegeIdNumber: "",
      dateOfBirth: "",
      gender: "",
      altPhone: "",
      address: "",
      course: "",
      department: "",
      semester: "",
      collegeId: 0,
      terms: false,
    },
  });
  
  // College registration form setup
  const collegeRegSchema = collegeRegistrationSchema.extend({
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const collegeRegForm = useForm<z.infer<typeof collegeRegSchema>>({
    resolver: zodResolver(collegeRegSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      name: "",
      address: "",
      district: "",
      contactPerson: "",
      terms: false,
    },
  });
  
  // Depot registration form setup
  const depotRegSchema = depotRegistrationSchema.extend({
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const depotRegForm = useForm<z.infer<typeof depotRegSchema>>({
    resolver: zodResolver(depotRegSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      name: "",
      location: "",
      address: "",
      contactPerson: "",
      terms: false,
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: any) => {
    console.log("Login attempt with:", { username: data.username, userType: data.userType });
    loginMutation.mutate({
      username: data.username,
      password: data.password,
      userType: data.userType,
    });
  };

  // Handle student registration form submission
  const onStudentRegisterSubmit = (data: any) => {
    // Remove terms and confirmPassword as they're not part of the API
    const { terms, confirmPassword, ...registrationData } = data;
    
    // Convert collegeId from string to number if needed
    const formattedData = {
      ...registrationData,
      collegeId: Number(registrationData.collegeId),
    };
    
    registerStudentMutation.mutate(formattedData);
  };
  
  // Handle college registration form submission
  const onCollegeRegisterSubmit = (data: any) => {
    // Remove terms and confirmPassword as they're not part of the API
    const { terms, confirmPassword, ...registrationData } = data;
    registerCollegeMutation.mutate(registrationData);
  };
  
  // Handle depot registration form submission
  const onDepotRegisterSubmit = (data: any) => {
    // Remove terms and confirmPassword as they're not part of the API
    const { terms, confirmPassword, ...registrationData } = data;
    registerDepotMutation.mutate(registrationData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white shadow overflow-hidden sm:rounded-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200">
                <div className="flex justify-center">
                  <TabsList className="h-auto border-b">
                    <TabsTrigger value="login" className="py-4 px-6">Login</TabsTrigger>
                    <TabsTrigger value="register" className="py-4 px-6">Register</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Login Form */}
              <TabsContent value="login" className="px-4 py-6 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Login to Your Account</h3>
                    <p className="mt-1 text-sm text-gray-500">Access your concession application dashboard.</p>
                  </div>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={UserType.STUDENT}>Student</SelectItem>
                                <SelectItem value={UserType.COLLEGE}>College Admin</SelectItem>
                                <SelectItem value={UserType.DEPOT}>KSRTC Officer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email / Username</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter your email or username" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder="Enter your password" 
                              />
                            </FormControl>
                            <div>
                              <a href="#" className="text-sm text-primary-600 hover:text-primary-500 mt-1 inline-block">Forgot password?</a>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : "Login"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              {/* Registration Forms */}
              <TabsContent value="register" className="px-4 py-6 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Registration</h3>
                    <p className="mt-1 text-sm text-gray-500">Choose your registration type below.</p>
                  </div>
                  
                  {/* Registration type selector */}
                  <div className="border-b border-gray-200 mb-4">
                    <div className="flex justify-center">
                      <Tabs value={registrationType} onValueChange={setRegistrationType}>
                        <TabsList className="h-auto">
                          <TabsTrigger value="student">Student</TabsTrigger>
                          <TabsTrigger value="college">College</TabsTrigger>
                          <TabsTrigger value="depot">KSRTC Depot</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                  
                  {/* Student registration form */}
                  {registrationType === "student" && (
                    <div>
                      <div>
                        <h4 className="text-md font-medium leading-6 text-gray-900">Student Registration</h4>
                        <p className="mt-1 text-sm text-gray-500">Create an account to apply for concession pass.</p>
                      </div>
                      
                      <Form {...studentRegForm}>
                        <form onSubmit={studentRegForm.handleSubmit(onStudentRegisterSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <FormField
                              control={studentRegForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="collegeIdNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>College ID</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="altPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Alternate Phone</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Textarea rows={3} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="course"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Course</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="semester"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Semester</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="collegeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>College</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))} 
                                    defaultValue={field.value ? field.value.toString() : undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select your college" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {colleges?.map((college) => (
                                        <SelectItem key={college.id} value={college.id.toString()}>
                                          {college.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={studentRegForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={studentRegForm.control}
                            name="terms"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    id="terms" 
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">terms and conditions</a>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerStudentMutation.isPending}
                          >
                            {registerStudentMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : "Register"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                  
                  {/* College registration form */}
                  {registrationType === "college" && (
                    <div>
                      <div>
                        <h4 className="text-md font-medium leading-6 text-gray-900">College Registration</h4>
                        <p className="mt-1 text-sm text-gray-500">Register your college to verify student applications.</p>
                      </div>
                      
                      <Form {...collegeRegForm}>
                        <form onSubmit={collegeRegForm.handleSubmit(onCollegeRegisterSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <FormField
                              control={collegeRegForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>College Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="district"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>District</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="contactPerson"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Person</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Textarea rows={3} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={collegeRegForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={collegeRegForm.control}
                            name="terms"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    id="terms" 
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">terms and conditions</a>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerCollegeMutation.isPending}
                          >
                            {registerCollegeMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : "Register"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                  
                  {/* Depot registration form */}
                  {registrationType === "depot" && (
                    <div>
                      <div>
                        <h4 className="text-md font-medium leading-6 text-gray-900">KSRTC Depot Registration</h4>
                        <p className="mt-1 text-sm text-gray-500">Register your depot to manage concession applications.</p>
                      </div>
                      
                      <Form {...depotRegForm}>
                        <form onSubmit={depotRegForm.handleSubmit(onDepotRegisterSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <FormField
                              control={depotRegForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Depot Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="contactPerson"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Person</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Textarea rows={3} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depotRegForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={depotRegForm.control}
                            name="terms"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    id="terms" 
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">terms and conditions</a>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerDepotMutation.isPending}
                          >
                            {registerDepotMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : "Register"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}