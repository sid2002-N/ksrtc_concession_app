import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import FaqPage from "@/pages/faq";
import { ProtectedRoute } from "./lib/protected-route";
import StudentDashboard from "@/pages/student/dashboard";
import StudentApply from "@/pages/student/apply";
import StudentTrack from "@/pages/student/track";
import StudentPayment from "@/pages/student/payment";
import StudentDownload from "@/pages/student/download";
import CollegeDashboard from "@/pages/college/dashboard";
import CollegeVerify from "@/pages/college/verify";
import DepotDashboard from "@/pages/depot/dashboard";
import DepotApprove from "@/pages/depot/approve";
import { UserType } from "@shared/schema";
import React, { Suspense } from "react";

// Lazy load analytics components
const AnalyticsDashboard = React.lazy(() => import("@/pages/analytics/dashboard"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faq" component={FaqPage} />
      
      {/* Student Routes */}
      <ProtectedRoute path="/student/dashboard" component={StudentDashboard} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/apply" component={StudentApply} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/track/:id" component={StudentTrack} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/payment/:id" component={StudentPayment} userType={UserType.STUDENT} />
      <ProtectedRoute path="/student/download/:id" component={StudentDownload} userType={UserType.STUDENT} />
      
      {/* College Routes */}
      <ProtectedRoute path="/college/dashboard" component={CollegeDashboard} userType={UserType.COLLEGE} />
      <ProtectedRoute path="/college/verify/:id" component={CollegeVerify} userType={UserType.COLLEGE} />
      
      {/* Depot Routes */}
      <ProtectedRoute path="/depot/dashboard" component={DepotDashboard} userType={UserType.DEPOT} />
      <ProtectedRoute path="/depot/approve/:id" component={DepotApprove} userType={UserType.DEPOT} />
      
      {/* Analytics Routes */}
      <ProtectedRoute 
        path="/admin/analytics/:section?" 
        component={() => (
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
            <AnalyticsDashboard />
          </Suspense>
        )} 
        userType={UserType.DEPOT} 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
