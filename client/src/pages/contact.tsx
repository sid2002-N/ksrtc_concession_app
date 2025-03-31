import { useState } from "react";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would submit to an API
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond soon.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Contact Us
              </h1>
              <p className="mt-4 text-xl text-white/80">
                Get in touch with our support team for assistance with the KSRTC Online Concession System
              </p>
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
                          <p className="mt-1 text-gray-500">support@ksrtc.kerala.gov.in</p>
                          <p className="mt-1 text-gray-500">concessions@ksrtc.kerala.gov.in</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
                          <p className="mt-1 text-gray-500">Helpline: +91 0471-2463799</p>
                          <p className="mt-1 text-gray-500">Toll Free: 1800 599 1881</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Office Address</h3>
                          <p className="mt-1 text-gray-500">Kerala State Road Transport Corporation</p>
                          <p className="mt-1 text-gray-500">Transport Bhavan, Fort</p>
                          <p className="mt-1 text-gray-500">Thiruvananthapuram, Kerala - 695023</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
                          <p className="mt-1 text-gray-500">Monday - Saturday: 10:00 AM - 5:00 PM</p>
                          <p className="mt-1 text-gray-500">Sunday & Public Holidays: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <p className="font-medium text-gray-700">How long does it take to process a concession application?</p>
                      <p className="text-gray-500">Typically 3-5 working days after both college and depot verification.</p>
                    </li>
                    <li>
                      <p className="font-medium text-gray-700">What should I do if my application is rejected?</p>
                      <p className="text-gray-500">You can view the reason for rejection in your account and reapply with the correct information.</p>
                    </li>
                    <li>
                      <p className="font-medium text-gray-700">How do I track my application status?</p>
                      <p className="text-gray-500">Log in to your student account and check the application status on your dashboard.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}