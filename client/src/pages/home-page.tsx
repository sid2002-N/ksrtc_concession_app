import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [trackingId, setTrackingId] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId) {
      setLocation(`/student/track/${trackingId}`);
    }
  };

  const redirectToDashboard = () => {
    if (user?.userType === UserType.STUDENT) {
      setLocation("/student/dashboard");
    } else if (user?.userType === UserType.COLLEGE) {
      setLocation("/college/dashboard");
    } else if (user?.userType === UserType.DEPOT) {
      setLocation("/depot/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-primary-500 text-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                  KSRTC Student Concession System
                </h1>
                <p className="mt-3 text-base text-primary-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Get your student travel concession pass online without the hassle of paperwork and long queues.
                </p>
                <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {user ? (
                      <Button 
                        variant="default" 
                        size="lg" 
                        onClick={redirectToDashboard}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Go to Dashboard
                      </Button>
                    ) : (
                      <Link href="/auth?tab=register">
                        <Button 
                          variant="default" 
                          size="lg" 
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Apply Now
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="#track">
                      <Button 
                        variant="secondary" 
                        size="lg" 
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50"
                      >
                        Track Application
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="px-6 py-8 sm:p-10">
                    <div className="bg-blue-50 rounded p-4 mb-6">
                      <h3 className="text-lg font-medium text-primary-800">Track Your Application</h3>
                      <p className="text-sm text-gray-500 mt-1">Enter your application ID or registered mobile number</p>
                    </div>
                    <form className="space-y-6" onSubmit={handleTrackSubmit}>
                      <div>
                        <label htmlFor="tracking-id" className="block text-sm font-medium text-gray-700">Application ID / Mobile Number</label>
                        <div className="mt-1">
                          <Input 
                            type="text" 
                            name="tracking-id" 
                            id="tracking-id" 
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                            placeholder="Enter ID or mobile number"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Button 
                          type="submit" 
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Track Now
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">How It Works</h2>
              <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:mt-4">
                Get your student concession pass in three simple steps
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">1</div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Student Application</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Register and submit your application with required details and documents.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">2</div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Verification Process</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Your college and the KSRTC depot verify your application details.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">3</div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Payment & Delivery</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Make the payment and receive your concession pass via post within 3-4 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Student Dashboard Preview</h2>
              <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:mt-4">
                Track your application status and manage your concession pass with ease.
              </p>
            </div>

            <div className="mt-10">
              <Card className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="border-b border-gray-200 bg-primary-600 px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-white">Student Dashboard</h3>
                    <div className="flex space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                        Student
                      </span>
                    </div>
                  </div>
                </div>
                <CardContent className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Application Status Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Application Status
                            </dt>
                            <dd className="flex items-center">
                              <div className="text-lg font-medium text-gray-900">
                                College Verification
                              </div>
                              <div className="ml-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                                  In Progress
                                </span>
                              </div>
                            </dd>
                          </div>
                        </div>
                        <div className="mt-5">
                          <div className="relative">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                              <div style={{width: "50%"}} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"></div>
                            </div>
                            <div className="flex text-xs justify-between">
                              <span className="text-green-600 font-semibold">Submitted</span>
                              <span className="text-yellow-600 font-semibold">College Verification</span>
                              <span className="text-gray-400">KSRTC Approval</span>
                              <span className="text-gray-400">Payment</span>
                              <span className="text-gray-400">Issued</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <div className="text-sm">
                          <Link href="/auth" className="font-medium text-primary-600 hover:text-primary-500">
                            View full details
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Concession Details Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Concession Details</h3>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">Application ID</div>
                            <div className="text-sm font-medium text-gray-900">KSRTC-2023-18742</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">Travel Route</div>
                            <div className="text-sm font-medium text-gray-900">Thrissur to Kochi</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">Applied Date</div>
                            <div className="text-sm font-medium text-gray-900">15 Aug 2023</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">College</div>
                            <div className="text-sm font-medium text-gray-900">Govt. Engineering College, Thrissur</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <div className="text-sm">
                          <Link href="/auth" className="font-medium text-primary-600 hover:text-primary-500">
                            Edit application
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                        <div className="mt-5 grid grid-cols-1 gap-3">
                          <Button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Submit Payment Details
                          </Button>
                          <Button variant="outline" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Download Application
                          </Button>
                          <Button variant="outline" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
