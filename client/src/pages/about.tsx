import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                About KSRTC Online Concession System
              </h1>
              <p className="mt-4 text-xl text-white/80">
                Streamlining student concession pass applications for faster, more efficient services
              </p>
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-12">
              <h2 className="text-2xl font-semibold text-primary-600">Our Mission</h2>
              <p className="mt-4 text-lg text-gray-500">
                The KSRTC Online Concession System aims to modernize and simplify the process of obtaining student
                concession passes for public transportation. By moving from paper-based applications to a digital
                platform, we're improving efficiency, reducing wait times, and enhancing the overall experience
                for students across Kerala.
              </p>
            </div>

            <div className="mt-16">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Secure & Reliable</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Our system uses advanced security protocols to protect student data and ensure reliable service at all times.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Time-Saving</h3>
                  <p className="mt-2 text-base text-gray-500">
                    The digital application process reduces processing time from weeks to just days, getting concession passes to students faster.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Transparent Process</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Real-time tracking allows students to see exactly where their application is in the approval process.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-5">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Institutional Integration</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Seamless coordination between educational institutions and KSRTC depots through our unified platform.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-16 bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">About Kerala State Road Transport Corporation</h2>
              <p className="text-lg text-gray-500 mb-4">
                Kerala State Road Transport Corporation (KSRTC) is the state-run road transport corporation in Kerala, India. 
                Established in 1965, it is one of the oldest state-run public bus transport services in India.
              </p>
              <p className="text-lg text-gray-500 mb-4">
                KSRTC operates a fleet of over 6,000 buses across Kerala and to neighboring states, serving millions of 
                passengers daily. The corporation is committed to providing safe, reliable, and affordable transportation 
                services to all citizens.
              </p>
              <p className="text-lg text-gray-500">
                Through the Online Concession System, KSRTC continues its tradition of supporting students with 
                special travel rates, making education more accessible for all.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}