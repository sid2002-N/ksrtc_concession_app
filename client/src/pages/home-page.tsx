import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@shared/schema";
import { Bus, Search, CheckCircle, Download, Phone, ArrowRight, Info } from "lucide-react";

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
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-darkGrey to-softGrey text-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl font-poppins">
                  <span className="text-lemonYellow">KSRTC</span> Student Concession System
                </h1>
                <p className="mt-3 text-base text-white/90 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl font-roboto">
                  Get your student travel concession pass online without the hassle of paperwork and long queues.
                </p>
                <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {user ? (
                      <Button 
                        onClick={redirectToDashboard}
                        variant="default"
                        className="w-full py-3 font-semibold"
                        size="lg"
                      >
                        <Bus className="h-5 w-5" />
                        Go to Dashboard
                      </Button>
                    ) : (
                      <Link href="/auth?tab=register">
                        <Button 
                          variant="default"
                          className="w-full py-3 font-semibold"
                          size="lg"
                        >
                          <Bus className="h-5 w-5" />
                          Apply Now
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/student/track">
                      <Button 
                        size="lg"
                        variant="secondary"
                        className="w-full py-3 font-semibold"
                      >
                        <Search className="h-5 w-5" />
                        Track Application
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="px-6 py-8 sm:p-10">
                    <div className="bg-softGrey/10 rounded p-4 mb-6 border border-softGrey/20">
                      <h3 className="text-lg font-medium text-darkGrey font-poppins">Track Your Application</h3>
                      <p className="text-sm text-gray-500 mt-1 font-roboto">Enter your application ID or registered mobile number</p>
                    </div>
                    <form className="space-y-6" onSubmit={handleTrackSubmit}>
                      <div>
                        <label htmlFor="tracking-id" className="block text-sm font-medium text-gray-700 font-roboto">Application ID / Mobile Number</label>
                        <div className="mt-1 relative">
                          <Input 
                            type="text" 
                            name="tracking-id" 
                            id="tracking-id" 
                            className="pl-10 shadow-sm focus:ring-lightRed focus:border-lightRed block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                            placeholder="Enter ID or mobile number"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <Button 
                          type="submit" 
                          className="w-full bg-lightRed text-white hover:bg-lightRed/90 py-2 shadow-sm flex items-center justify-center gap-2"
                        >
                          <Search className="h-4 w-4" />
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
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-darkGrey sm:text-3xl font-poppins">
                How <span className="text-lightRed">It Works</span>
              </h2>
              <div className="flex justify-center mt-3">
                <div className="w-24 h-1 bg-lemonYellow rounded-full"></div>
              </div>
              <p className="mt-5 max-w-2xl mx-auto text-base text-gray-600 sm:mt-4 font-roboto">
                Get your student concession pass in three simple steps
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center bg-softGrey/30 rounded-lg p-8 shadow-sm hover-scale card-hover">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-lemonYellow/20 text-darkGrey text-2xl font-bold border-2 border-lemonYellow">1</div>
                  <h3 className="mt-6 text-lg font-medium text-darkGrey font-poppins">Student Application</h3>
                  <div className="w-12 h-0.5 bg-lightRed my-3"></div>
                  <p className="mt-2 text-base text-gray-600 text-center font-roboto">
                    Register and submit your application with required details and documents.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center bg-softGrey/30 rounded-lg p-8 shadow-sm hover-scale card-hover">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-lemonYellow/20 text-darkGrey text-2xl font-bold border-2 border-lemonYellow">2</div>
                  <h3 className="mt-6 text-lg font-medium text-darkGrey font-poppins">Verification Process</h3>
                  <div className="w-12 h-0.5 bg-lightRed my-3"></div>
                  <p className="mt-2 text-base text-gray-600 text-center font-roboto">
                    Your college and the KSRTC depot verify your application details.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center bg-softGrey/30 rounded-lg p-8 shadow-sm hover-scale card-hover">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-lemonYellow/20 text-darkGrey text-2xl font-bold border-2 border-lemonYellow">3</div>
                  <h3 className="mt-6 text-lg font-medium text-darkGrey font-poppins">Payment & Delivery</h3>
                  <div className="w-12 h-0.5 bg-lightRed my-3"></div>
                  <p className="mt-2 text-base text-gray-600 text-center font-roboto">
                    Make the payment and receive your concession pass instantly by downloading it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="py-16 bg-softGrey/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-darkGrey sm:text-3xl font-poppins">
                Student <span className="text-lightRed">Dashboard</span> Preview
              </h2>
              <div className="flex justify-center mt-3">
                <div className="w-24 h-1 bg-lemonYellow rounded-full"></div>
              </div>
              <p className="mt-5 max-w-2xl mx-auto text-base text-gray-600 sm:mt-4 font-roboto">
                Track your application status and manage your concession pass with ease
              </p>
            </div>

            <div className="mt-12">
              <Card className="bg-white overflow-hidden shadow-lg rounded-lg border border-softGrey/40">
                <div className="border-b border-softGrey bg-gradient-to-r from-darkGrey to-softGrey px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-white font-poppins flex items-center">
                      <Bus className="mr-2 h-5 w-5" /> Student Dashboard
                    </h3>
                    <div className="flex space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-lemonYellow text-darkGrey">
                        Student
                      </span>
                    </div>
                  </div>
                </div>
                <CardContent className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Application Status Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border border-softGrey/40 hover-scale">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-lemonYellow/20 rounded-md p-3">
                            <CheckCircle className="h-6 w-6 text-lightRed" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate font-roboto">
                              Application Status
                            </dt>
                            <dd className="flex items-center">
                              <div className="text-lg font-medium text-darkGrey font-poppins">
                                College Verification
                              </div>
                              <div className="ml-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-lemonYellow/20 text-darkGrey">
                                  In Progress
                                </span>
                              </div>
                            </dd>
                          </div>
                        </div>
                        <div className="mt-5">
                          <div className="relative">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                              <div style={{width: "50%"}} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-lightRed"></div>
                            </div>
                            <div className="flex text-xs justify-between font-roboto">
                              <span className="text-lightRed font-semibold">Submitted</span>
                              <span className="text-lightRed font-semibold">College Verification</span>
                              <span className="text-gray-400">KSRTC Approval</span>
                              <span className="text-gray-400">Payment</span>
                              <span className="text-gray-400">Issued</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-softGrey/10 px-4 py-4 sm:px-6">
                        <div className="text-sm">
                          <Link href="/auth" className="font-medium text-lightRed hover:text-lightRed/80 font-roboto flex items-center">
                            View full details <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Concession Details Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border border-softGrey/40 hover-scale">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-darkGrey font-poppins flex items-center">
                          <Info className="mr-2 h-5 w-5 text-lightRed" /> Concession Details
                        </h3>
                        <div className="mt-4 space-y-3 font-roboto">
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">Application ID</div>
                            <div className="text-sm font-medium text-darkGrey">KSRTC-2023-18742</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">Travel Route</div>
                            <div className="text-sm font-medium text-darkGrey">Thrissur to Kochi</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">Applied Date</div>
                            <div className="text-sm font-medium text-darkGrey">15 Aug 2023</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">College</div>
                            <div className="text-sm font-medium text-darkGrey">Govt. Engineering College, Thrissur</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-softGrey/10 px-4 py-4 sm:px-6">
                        <div className="text-sm">
                          <Link href="/auth" className="font-medium text-lightRed hover:text-lightRed/80 font-roboto flex items-center">
                            Edit application <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border border-softGrey/40 hover-scale">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-darkGrey font-poppins">Quick Actions</h3>
                        <div className="mt-5 grid grid-cols-1 gap-3">
                          <Link href="/auth">
                            <Button className="w-full bg-lightRed text-white hover:bg-lightRed/90 animated-button font-roboto">
                              Submit Payment Details
                            </Button>
                          </Link>
                          <Link href="/auth">
                            <Button className="w-full bg-white text-darkGrey hover:bg-softGrey/20 border border-softGrey/40 animated-button flex items-center justify-center gap-2 font-roboto">
                              <Download className="h-4 w-4" /> Download Application
                            </Button>
                          </Link>
                          <Link href="/contact">
                            <Button className="w-full bg-white text-darkGrey hover:bg-softGrey/20 border border-softGrey/40 animated-button flex items-center justify-center gap-2 font-roboto">
                              <Phone className="h-4 w-4" /> Contact Support
                            </Button>
                          </Link>
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
