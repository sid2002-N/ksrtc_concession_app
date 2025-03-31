import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { 
  User, 
  UserType, 
  StudentRegistration, 
  CollegeRegistration, 
  DepotRegistration 
} from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerStudentMutation: UseMutationResult<User, Error, StudentRegistration>;
  registerCollegeMutation: UseMutationResult<User, Error, CollegeRegistration>;
  registerDepotMutation: UseMutationResult<User, Error, DepotRegistration>;
};

type LoginData = {
  username: string;
  password: string;
  userType: UserType;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Navigate based on user type
      let redirectPath = "/";
      if (user.userType === UserType.STUDENT) {
        redirectPath = "/student/dashboard";
      } else if (user.userType === UserType.COLLEGE) {
        redirectPath = "/college/dashboard";
      } else if (user.userType === UserType.DEPOT) {
        redirectPath = "/depot/dashboard";
      }
      
      // Use window.location to navigate
      window.location.href = redirectPath;
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerStudentMutation = useMutation({
    mutationFn: async (data: StudentRegistration) => {
      const res = await apiRequest("POST", "/api/register", {
        ...data,
        userType: UserType.STUDENT,
      });
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Navigate to student dashboard
      window.location.href = "/student/dashboard";
      
      toast({
        title: "Registration successful",
        description: "Welcome to KSRTC Online Concession System.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const registerCollegeMutation = useMutation({
    mutationFn: async (data: CollegeRegistration) => {
      const res = await apiRequest("POST", "/api/register", {
        ...data,
        userType: UserType.COLLEGE,
      });
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Navigate to college dashboard
      window.location.href = "/college/dashboard";
      
      toast({
        title: "College Registration Successful",
        description: "Your college has been registered successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "College Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const registerDepotMutation = useMutation({
    mutationFn: async (data: DepotRegistration) => {
      const res = await apiRequest("POST", "/api/register", {
        ...data,
        userType: UserType.DEPOT,
      });
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Navigate to depot dashboard
      window.location.href = "/depot/dashboard";
      
      toast({
        title: "Depot Registration Successful",
        description: "Your KSRTC depot has been registered successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Depot Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      
      // Navigate to home page
      window.location.href = "/";
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerStudentMutation,
        registerCollegeMutation,
        registerDepotMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
