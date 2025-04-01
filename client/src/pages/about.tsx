
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Shield, Clock, Eye, Building2, Bus, Users, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-darkGrey to-softGrey py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl font-poppins animate-fade-in">
                About KSRTC Online Concession
              </h1>
              <p className="mt-6 text-xl text-lemonYellow max-w-3xl mx-auto font-roboto animate-slide-up">
                Streamlining student concession pass applications for faster, more efficient services
              </p>
            </div>
          </div>
        </div>

        <div className="py-16 bg-gradient-to-b from-white to-softGrey/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-darkGrey sm:text-4xl font-poppins animate-fade-in">
                Our <span className="text-lightRed">Mission</span>
              </h2>
              <div className="mt-4 max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <p className="text-lg text-darkGrey font-roboto">
                  The KSRTC Online Concession System aims to modernize and simplify the process of obtaining student
                  concession passes for public transportation. By moving from paper-based applications to a digital
                  platform, we're improving efficiency, reducing wait times, and enhancing the overall experience
                  for students across Kerala.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-lightRed to-lightRed/80 p-6 rounded-lg shadow-xl text-white">
                  <Shield className="h-10 w-10 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
                  <p className="text-white/90">Advanced security protocols protect student data and ensure reliable service.</p>
                </div>
              </div>

              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-lemonYellow to-lemonYellow/80 p-6 rounded-lg shadow-xl text-darkGrey">
                  <Clock className="h-10 w-10 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Time-Saving</h3>
                  <p>Digital process reduces application time from weeks to just days.</p>
                </div>
              </div>

              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-darkGrey to-softGrey p-6 rounded-lg shadow-xl text-white">
                  <Eye className="h-10 w-10 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Transparent Process</h3>
                  <p>Real-time tracking of application status at every step.</p>
                </div>
              </div>

              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-lightRed/80 to-darkGrey p-6 rounded-lg shadow-xl text-white">
                  <Building2 className="h-10 w-10 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Institutional Integration</h3>
                  <p>Seamless coordination between educational institutions and KSRTC depots.</p>
                </div>
              </div>
            </div>

            <div className="mt-20 bg-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-lightRed/10 to-lemonYellow/10"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-darkGrey mb-8 font-poppins">About Kerala State Road Transport Corporation</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <p className="text-lg text-darkGrey font-roboto">
                      Kerala State Road Transport Corporation (KSRTC) is the state-run road transport corporation in Kerala, India. 
                      Established in 1965, it is one of the oldest state-run public bus transport services in India.
                    </p>
                    <div className="flex items-center space-x-4 bg-softGrey/10 p-4 rounded-lg transform hover:scale-105 transition-transform duration-300">
                      <Bus className="h-8 w-8 text-lightRed" />
                      <div>
                        <h4 className="font-semibold text-darkGrey">6,000+ Buses</h4>
                        <p className="text-sm text-gray-600">Operating across Kerala</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 bg-softGrey/10 p-4 rounded-lg transform hover:scale-105 transition-transform duration-300">
                      <Users className="h-8 w-8 text-lightRed" />
                      <div>
                        <h4 className="font-semibold text-darkGrey">Millions Served</h4>
                        <p className="text-sm text-gray-600">Daily passenger count</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 bg-softGrey/10 p-4 rounded-lg transform hover:scale-105 transition-transform duration-300">
                      <Award className="h-8 w-8 text-lightRed" />
                      <div>
                        <h4 className="font-semibold text-darkGrey">Legacy of Excellence</h4>
                        <p className="text-sm text-gray-600">Since 1965</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 bg-softGrey/10 p-4 rounded-lg transform hover:scale-105 transition-transform duration-300">
                      <MapPin className="h-8 w-8 text-lightRed" />
                      <div>
                        <h4 className="font-semibold text-darkGrey">Extensive Network</h4>
                        <p className="text-sm text-gray-600">Connecting all of Kerala</p>
                      </div>
                    </div>
                    <p className="text-lg text-darkGrey font-roboto">
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
