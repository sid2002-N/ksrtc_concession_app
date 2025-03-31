import React from "react";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 text-xl text-white/80">
                Find answers to common questions about the KSRTC Online Concession System
              </p>
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">General Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    What is the KSRTC Online Concession System?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    The KSRTC Online Concession System is a web-based application that digitizes and streamlines the student 
                    concession application process for Kerala State Road Transport Corporation. It replaces the traditional 
                    paper-based process with a faster, more efficient online system.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    Who is eligible for student concession passes?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    Full-time students enrolled in recognized educational institutions in Kerala are eligible for 
                    concession passes. This includes students in schools, colleges, universities, and other 
                    recognized academic institutions. The student must be traveling between their residence and 
                    educational institution.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    How much does a student concession pass cost?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    Concession pass fees are calculated based on the distance between your residence and educational 
                    institution. Generally, students receive a 50% discount on the regular fare. The exact amount will 
                    be displayed during the application process after entering your route details.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Application Process</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-4" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    How do I apply for a concession pass?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Register on the KSRTC Concession portal as a student</li>
                      <li>Fill out the application form with your personal and educational details</li>
                      <li>Upload required documents (student ID, photo, etc.)</li>
                      <li>Select your travel route (start and end points)</li>
                      <li>Submit the application for college verification</li>
                      <li>After college verification, the application goes to the depot for approval</li>
                      <li>Once approved, make the payment online</li>
                      <li>Receive your concession pass</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    What documents do I need to apply?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Valid student ID card</li>
                      <li>Recent passport-sized photograph</li>
                      <li>Proof of residence (for verification of travel route)</li>
                      <li>College/institution identity card or admission letter</li>
                      <li>Previous concession pass (if renewing)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    How long does the application process take?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    The entire process typically takes 5-7 working days from application submission to receipt of the pass. 
                    This includes college verification (1-2 days), depot approval (1-2 days), payment processing, and pass 
                    generation. You can track the status of your application through your student dashboard.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Verification & Payment</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-7" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    What happens during college verification?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    During college verification, the designated college administrator verifies your student status, 
                    the authenticity of your documents, and confirms that you are enrolled in the institution. 
                    If everything is in order, they approve your application and forward it to the KSRTC depot 
                    for the next stage of verification.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    What happens if my application is rejected?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    If your application is rejected, you'll receive a notification with the reason for rejection. 
                    Common reasons include incorrect information, invalid documents, or ineligible route. You can 
                    correct the issues and resubmit your application without having to start the entire process 
                    from the beginning.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    What payment methods are accepted?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    We accept multiple payment methods including:
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Credit/Debit cards</li>
                      <li>Net banking</li>
                      <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                      <li>KSRTC wallet (if applicable)</li>
                    </ul>
                    Payment confirmation is instant, and you'll receive a receipt via email.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Using Your Concession Pass</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-10" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    How do I receive my concession pass?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    After payment verification, your pass will be generated and can be collected from your designated 
                    KSRTC depot. Alternatively, some depots offer a postal delivery option. You'll need to show your 
                    ID and application reference number when collecting the pass in person.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-11" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    Can I use my concession pass on any KSRTC bus?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    Student concession passes are valid on regular KSRTC buses only. They cannot be used on premium 
                    services like Volvo, AC buses, or special services. The pass is valid only for the specified 
                    route between your residence and educational institution.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-12" className="border rounded-md p-1">
                  <AccordionTrigger className="text-lg font-medium px-4">
                    How long is my concession pass valid?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    Student concession passes are typically valid for one academic year or until the end date specified 
                    on the pass. You'll need to renew your pass for the next academic year. The renewal process is 
                    simpler than the initial application, as some of your information will already be in the system.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}