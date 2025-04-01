
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Shield, Clock, Eye, Building2, Bus, Users, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl font-poppins">
                About KSRTC Online Concession
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto font-roboto">
                Streamlining student concession pass applications for faster, more efficient services
              </p>
            </div>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl font-poppins">
                Our <span className="text-primary-600">Mission</span>
              </h2>
              <div className="mt-4 max-w-3xl mx-auto">
                <p className="text-lg text-gray-600 font-roboto">
                  The KSRTC Online Concession System aims to modernize and simplify the process of obtaining student
                  concession passes for public transportation. By moving from paper-based applications to a digital
                  platform, we're improving efficiency, reducing wait times, and enhancing the overall experience
                  for students across Kerala.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Shield className="h-10 w-10 text-primary-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                  <p className="text-gray-600">Advanced security protocols protect student data and ensure reliable service.</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Clock className="h-10 w-10 text-primary-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Time-Saving</h3>
                  <p className="text-gray-600">Digital process reduces application time from weeks to just days.</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Eye className="h-10 w-10 text-primary-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Process</h3>
                  <p className="text-gray-600">Real-time tracking of application status at every step.</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Building2 className="h-10 w-10 text-primary-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Institutional Integration</h3>
                  <p className="text-gray-600">Seamless coordination between educational institutions and KSRTC depots.</p>
                </div>
              </div>
            </div>

            <div className="mt-20 bg-gray-50 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 font-poppins">About Kerala State Road Transport Corporation</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600 font-roboto">
                      Kerala State Road Transport Corporation (KSRTC) is the state-run road transport corporation in Kerala, India. 
                      Established in 1965, it is one of the oldest state-run public bus transport services in India.
                    </p>
                    <div className="flex items-center space-x-4">
                      <Bus className="h-8 w-8 text-primary-500" />
                      <div>
                        <h4 className="font-semibold">6,000+ Buses</h4>
                        <p className="text-sm text-gray-500">Operating across Kerala</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Users className="h-8 w-8 text-primary-500" />
                      <div>
                        <h4 className="font-semibold">Millions Served</h4>
                        <p className="text-sm text-gray-500">Daily passenger count</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Award className="h-8 w-8 text-primary-500" />
                      <div>
                        <h4 className="font-semibold">Legacy of Excellence</h4>
                        <p className="text-sm text-gray-500">Since 1965</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <MapPin className="h-8 w-8 text-primary-500" />
                      <div>
                        <h4 className="font-semibold">Extensive Network</h4>
                        <p className="text-sm text-gray-500">Connecting all of Kerala</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 font-roboto">
                      Through the Online Concession System, KSRTC continues its tradition of supporting students with 
                      special travel rates, making education more accessible for all.
                    </p>
                  </div>
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
