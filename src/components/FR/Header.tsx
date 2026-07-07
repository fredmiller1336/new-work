import { useState } from "react";
import { Menu, X, Package, User, Building2, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import laposteLogo from "@/assets/laposte.png";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="sticky top-0 z-50 bg-white shadow-lg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gray-100 rounded-full animate-bounce-light"></div>
        <div className="absolute top-8 left-1/4 w-16 h-16 bg-gray-50 rounded-full animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center py-4">
            <img 
              src={laposteLogo} 
              alt="La Poste Logo" 
              className="h-6 w-auto transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 group">
              <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Particulier
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 group">
              <Building2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Entreprise
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 group">
              <HelpCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Aide & Support
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all duration-300 hover:scale-110">
              <Search style={{
              width: '24px',
              height: '24px'
            }} />
            </Button>
            
            {/* User Button */}
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all duration-300 hover:scale-110">
              <User style={{
              width: '24px',
              height: '24px'
            }} />
            </Button>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all duration-300 hover:scale-110" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X style={{
              width: '24px',
              height: '24px'
            }} /> : <Menu style={{
              width: '24px',
              height: '24px'
            }} />}
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden mt-4 py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 justify-start">
                <User className="h-4 w-4 mr-2" />
                Particulier
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Entreprise
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Aide & Support
              </Button>
            </div>
          </div>}
      </div>
    </header>;
};
export default Header;
