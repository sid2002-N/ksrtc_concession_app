import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import StudentDashboard from "@/pages/student/dashboard";
import StudentApply from "@/pages/student/apply";
import StudentTrack from "@/pages/student/track";
import StudentPayment from "@/pages/student/payment";
import CollegeDashboard from "@/pages/college/dashboard";
import CollegeVerify from "@/pages/college/verify";
import DepotDashboard from "@/pages/depot/dashboard";
import DepotApprove from "@/pages/depot/approve";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Student Routes */}
      <ProtectedRoute path="/student/dashboard" component={StudentDashboard} userType="student" />
      <ProtectedRoute path="/student/apply" component={StudentApply} userType="student" />
      <ProtectedRoute path="/student/track/:id" component={StudentTrack} userType="student" />
      <ProtectedRoute path="/student/payment/:id" component={StudentPayment} userType="student" />
      
      {/* College Routes */}
      <ProtectedRoute path="/college/dashboard" component={CollegeDashboard} userType="college" />
      <ProtectedRoute path="/college/verify/:id" component={CollegeVerify} userType="college" />
      
      {/* Depot Routes */}
      <ProtectedRoute path="/depot/dashboard" component={DepotDashboard} userType="depot" />
      <ProtectedRoute path="/depot/approve/:id" component={DepotApprove} userType="depot" />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
