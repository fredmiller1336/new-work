import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import brtLogo from "@/assets/brt-logo.png";
import visaLogo from "@/assets/Visa.png";
import mastercardLogo from "@/assets/master.png";

const Footer = () => {
  const personalLinks = [
    { label: "Invia un pacco", href: "#" },
    { label: "Trova posizioni", href: "#" },
    { label: "Traccia il tuo pacco", href: "#" },
    { label: "Prezzi e tempi di transito", href: "#" },
    { label: "Spedizione internazionale", href: "#" },
    { label: "Servizi per privati", href: "#" }
  ];

  const businessLinks = [
    { label: "Soluzioni per l'e-commerce", href: "#" },
    { label: "Spedizioni internazionali", href: "#" },
    { label: "Servizi logistici", href: "#" },
    { label: "Gestione della supply chain", href: "#" },
    { label: "Soluzioni settoriali", href: "#" },
    { label: "Servizi digitali", href: "#" }
  ];

  const shopLinks = [
    { label: "Packaging e imballaggio", href: "#" },
    { label: "Etichette di spedizione", href: "#" },
    { label: "Prodotti per l'imballaggio", href: "#" },
    { label: "Scatole e buste", href: "#" },
    { label: "Materiali protettivi", href: "#" },
    { label: "Accessori per spedizioni", href: "#" }
  ];

  const websiteLinks = [
    { label: "Chi siamo", href: "#" },
    { label: "Carriere", href: "#" },
    { label: "Sostenibilità", href: "#" },
    { label: "Relazioni con gli investitori", href: "#" },
    { label: "Press Center", href: "#" },
    { label: "Termini e condizioni", href: "#" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  const partnerLogos = [
    { src: visaLogo, alt: "Visa", className: "h-6" },
    { src: mastercardLogo, alt: "Mastercard", className: "h-6" }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-12">
          {/* Privato Column */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-400 relative">
              Privato
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
            </h3>
            <ul className="space-y-2">
              {personalLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Column */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-400 relative">
              Business
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
            </h3>
            <ul className="space-y-2">
              {businessLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-400 relative">
              Shop
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Website Column */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-400 relative">
              Sito Web
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
            </h3>
            <ul className="space-y-2">
              {websiteLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Accordion Layout */}
        <div className="md:hidden mb-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privato" className="border-gray-700">
              <AccordionTrigger className="text-yellow-400 font-bold hover:text-yellow-300">
                Privato
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pt-2">
                  {personalLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm block py-1">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="business" className="border-gray-700">
              <AccordionTrigger className="text-yellow-400 font-bold hover:text-yellow-300">
                Business
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pt-2">
                  {businessLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm block py-1">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shop" className="border-gray-700">
              <AccordionTrigger className="text-yellow-400 font-bold hover:text-yellow-300">
                Shop
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pt-2">
                  {shopLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm block py-1">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="website" className="border-gray-700">
              <AccordionTrigger className="text-yellow-400 font-bold hover:text-yellow-300">
                Sito Web
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pt-2">
                  {websiteLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm block py-1">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-8 border-t border-gray-700">
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors">
              <Phone className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Telefono</p>
              <p className="text-white font-medium">+39 02 1234 5678</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors">
              <MapPin className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Indirizzo</p>
              <p className="text-white font-medium">Via Roma 123, 20121 Milano</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors">
              <Mail className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white font-medium">info@bartolini.it</p>
            </div>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4 mb-8">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-6"
                aria-label={social.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>

        {/* Partner Logos */}
        <div className="flex justify-center items-center space-x-8 mb-8 py-4 border-y border-gray-700">
          <div className="flex items-center space-x-2">
            <img src={brtLogo} alt="Bartolini" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
            <span className="text-gray-400 text-sm">Partner ufficiale</span>
          </div>
          <div className="flex items-center space-x-4">
            {partnerLogos.map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className={`${logo.className} opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110`}
              />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm">
          <p>&copy; 2024 Bartolini Italia. Tutti i diritti riservati.</p>
          <p className="mt-1">
            <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a> | 
            <a href="#" className="hover:text-yellow-400 transition-colors ml-1">Cookie Policy</a> | 
            <a href="#" className="hover:text-yellow-400 transition-colors ml-1">Termini di Servizio</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;