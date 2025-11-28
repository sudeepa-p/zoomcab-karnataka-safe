import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DriverAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDriver: boolean;
  driverProfile: any | null;
  signUp: (email: string, password: string, fullName: string, phone: string, licenseNumber: string, licenseExpiry: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

export const DriverAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "driver")
              .single();
            
            setIsDriver(!!roleData);
            
            if (roleData) {
              const { data: profile } = await supabase
                .from("driver_profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .single();
              
              setDriverProfile(profile);
            }
          }, 0);
        } else {
          setIsDriver(false);
          setDriverProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, licenseNumber: string, licenseExpiry: string) => {
    try {
      const redirectUrl = `${window.location.origin}/driver/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
            user_type: 'driver',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert driver role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "driver",
        });

        if (roleError) {
          console.error("Role insertion error:", roleError);
          toast.error("Failed to assign driver role. Please contact support.");
          throw roleError;
        }

        // Insert driver profile
        const { error: profileError } = await supabase.from("driver_profiles").insert({
          user_id: data.user.id,
          license_number: licenseNumber,
          license_expiry: licenseExpiry,
        });

        if (profileError) {
          console.error("Profile insertion error:", profileError);
          toast.error("Failed to create driver profile. Please contact support.");
          throw profileError;
        }

        toast.success("Driver account created! Please check your email to verify your account.", {
          duration: 6000,
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      if (data.user) {
        // Check if user has driver role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "driver")
          .maybeSingle();

        if (roleError) {
          console.error("Role check error:", roleError);
          toast.error("Failed to verify driver status. Please try again.");
          await supabase.auth.signOut();
          throw roleError;
        }

        if (!roleData) {
          await supabase.auth.signOut();
          toast.error("This account is not registered as a driver. Please use the passenger login or sign up as a driver.");
          throw new Error("Not a driver account");
        }

        toast.success("Welcome back! Signed in successfully.");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully!");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <DriverAuthContext.Provider value={{ user, session, loading, isDriver, driverProfile, signUp, signIn, signOut }}>
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (context === undefined) {
    throw new Error("useDriverAuth must be used within a DriverAuthProvider");
  }
  return context;
};
