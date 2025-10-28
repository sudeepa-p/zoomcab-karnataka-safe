import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, MapPin, Clock, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Safety", href: "#safety" },
    { name: "Routes", href: "#routes" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ZoomGo</h1>
              <p className="text-xs text-muted-foreground">Karnataka Cabs</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </div>
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <Button variant="hero" onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">ZoomGo</h1>
                    <p className="text-xs text-muted-foreground">Karnataka Cabs</p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>

                {/* Mobile Contact */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-foreground">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Clock className="h-5 w-5 text-secondary" />
                    <span>24/7 Available</span>
                  </div>
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    </>
                  ) : (
                    <Button variant="hero" size="lg" className="w-full mt-4" onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;