import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github, ArrowRight, Crown, Truck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import lapostefooter2 from "@/assets/lapostefooter2.png";
import lapostefooter from "@/assets/lapostefooter.png";

const Footer = () => {
  const personalLinks = [{
    name: "Suivre un colis",
    href: "/track"
  }, {
    name: "Trouver les tarifs",
    href: "/prices"
  }, {
    name: "Acheter des timbres",
    href: "/stamps"
  }, {
    name: "Réexpéditions",
    href: "/redirect"
  }];

  const businessLinks = [{
    name: "Solutions entreprise",
    href: "/business"
  }, {
    name: "Envois en masse",
    href: "/bulk"
  }, {
    name: "Gestion de compte",
    href: "/account"
  }, {
    name: "Services API",
    href: "/api"
  }];

  const shopLinks = [{
    name: "Timbres",
    href: "/shop/stamps"
  }, {
    name: "Emballage",
    href: "/shop/packaging"
  }, {
    name: "Cadeaux",
    href: "/shop/gifts"
  }, {
    name: "Articles de collection",
    href: "/shop/collectibles"
  }];

  const websiteLinks = [{
    name: "La Poste",
    href: "https://laposte.fr"
  }, {
    name: "Colissimo",
    href: "https://colissimo.fr"
  }, {
    name: "Chronopost",
    href: "https://chronopost.fr"
  }, {
    name: "Boutique La Poste",
    href: "https://boutique.laposte.fr"
  }];

  const socialLinks = [{
    icon: Linkedin,
    href: "#",
    label: "LinkedIn"
  }, {
    icon: Github,
    href: "#",
    label: "GitHub"
  }, {
    icon: Twitter,
    href: "#",
    label: "Twitter"
  }, {
    icon: Instagram,
    href: "#",
    label: "Instagram"
  }];

  return <footer className="font-chevin text-gray-800" style={{
    backgroundColor: '#FFCC00'
  }}>
      {/* Main Footer Content */}
      <div>
        <div className="container mx-auto px-6 pt-8 pb-0">
          
          {/* Accordion Navigation - Above Images */}
          <div className="mb-6">
            <Accordion type="multiple" className="w-full space-y-2 max-w-2xl">
              <AccordionItem value="personal" className="border-b border-gray-800/20">
                <AccordionTrigger className="text-gray-800 hover:text-red-600 transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Particulier</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {personalLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-gray-700 hover:text-red-600 transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="business" className="border-b border-gray-800/20">
                <AccordionTrigger className="text-gray-800 hover:text-red-600 transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Entreprise</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {businessLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-gray-700 hover:text-red-600 transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shop" className="border-b border-gray-800/20">
                <AccordionTrigger className="text-gray-800 hover:text-red-600 transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Boutique</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {shopLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-gray-700 hover:text-red-600 transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="websites" className="border-b border-gray-800/20">
                <AccordionTrigger className="text-gray-800 hover:text-red-600 transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Nos Sites Web</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {websiteLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-gray-700 hover:text-red-600 transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            {/* Company Info & Images */}
            <div className="space-y-4">
              
              
              {/* Partner Logos */}
              <div className="mb-6 space-y-4">
                <div className="text-center group cursor-pointer">
                  <img 
                    src={lapostefooter2} 
                    alt="Image de pied de page 1"
                    className="transition-all duration-1000 ease-in-out hover:scale-110 hover:shadow-2xl hover:brightness-110 active:scale-95 group-hover:transform group-hover:-translate-y-2"
                    style={{ maxHeight: '120px', display: 'block', margin: '0 auto' }}
                  />
                </div>
                <div className="text-center group cursor-pointer">
                  <img 
                    src={lapostefooter} 
                    alt="Image de pied de page 3"
                    className="transition-all duration-1000 ease-in-out hover:scale-110 hover:shadow-2xl hover:brightness-110 active:scale-95 group-hover:transform group-hover:-translate-y-2"
                    style={{ maxHeight: '120px', display: 'block', margin: '0 auto' }}
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 rounded-xl bg-gray-800/10 group-hover:bg-gray-800/20 transition-all duration-300 shadow-md shadow-black/20 border border-gray-800/20 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110">
                      <Phone className="h-4 w-4 text-gray-800" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">01 41 91 45 55</span>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 rounded-xl bg-gray-800/10 group-hover:bg-gray-800/20 transition-all duration-300 shadow-md shadow-black/20 border border-gray-800/20 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110">
                      <MapPin className="h-4 w-4 text-gray-800" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Paris, France</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 group relative">
                      <div className="p-2 rounded-xl bg-gray-800/10 group-hover:bg-gray-800/20 transition-all duration-300 shadow-md shadow-black/20 border border-gray-800/20 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110">
                        <Mail className="h-4 w-4 text-gray-800" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">service.client@laposte.fr</span>
                    </div>
                    
                    {/* Thin line separator */}
                    <div className="w-full h-px bg-gray-800/30"></div>
                    
                    {/* Social Links */}
                    <div className="flex space-x-2">
                      {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return <Button key={index} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg bg-gray-800/5 hover:bg-red-600/20 border border-gray-800/10 hover:border-red-600/30 text-gray-700 hover:text-red-600 hover:scale-110 transition-all duration-300" aria-label={social.label}>
                            <Icon className="h-4 w-4" />
                          </Button>;
                    })}
                    </div>
                    
                    {/* Copyright Text */}
                    <p className="text-gray-600 text-sm font-medium tracking-wide text-center mb-6">© La Poste 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};

export default Footer;
