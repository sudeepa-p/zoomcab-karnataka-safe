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
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "driver",
        });

        await supabase.from("driver_profiles").insert({
          user_id: data.user.id,
          license_number: licenseNumber,
          license_expiry: licenseExpiry,
        });

        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "driver")
          .single();

        if (!roleData) {
          await supabase.auth.signOut();
          throw new Error("This account is not registered as a driver.");
        }

        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
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
