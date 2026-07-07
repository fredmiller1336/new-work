import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github, ArrowRight, Crown, Truck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import footer1 from "@/assets/footer1.png";
import footer3 from "@/assets/footer3.png";
const Footer = () => {
  const personalLinks = [{
    name: "Track a package",
    href: "/track"
  }, {
    name: "Find prices",
    href: "/prices"
  }, {
    name: "Buy stamps",
    href: "/stamps"
  }, {
    name: "Redirections",
    href: "/redirect"
  }];
  const businessLinks = [{
    name: "Business solutions",
    href: "/business"
  }, {
    name: "Bulk mail",
    href: "/bulk"
  }, {
    name: "Account management",
    href: "/account"
  }, {
    name: "API services",
    href: "/api"
  }];
  const shopLinks = [{
    name: "Stamps",
    href: "/shop/stamps"
  }, {
    name: "Packaging",
    href: "/shop/packaging"
  }, {
    name: "Gifts",
    href: "/shop/gifts"
  }, {
    name: "Collectibles",
    href: "/shop/collectibles"
  }];
  const websiteLinks = [{
    name: "Royal Mail",
    href: "https://royalmail.com"
  }, {
    name: "ParcelForce",
    href: "https://parcelforce.com"
  }, {
    name: "IDS",
    href: "https://ids.co.uk"
  }, {
    name: "Royal Mail Shop",
    href: "https://shop.royalmail.com"
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
  return <footer className="font-chevin text-white" style={{
    backgroundColor: '#2A2A2D'
  }}>
      {/* Main Footer Content */}
      <div>
        <div className="container mx-auto px-6 pt-8 pb-0">
          
          {/* Accordion Navigation - Above Images */}
          <div className="mb-6">
            <Accordion type="multiple" className="w-full space-y-2 max-w-2xl">
              <AccordionItem value="personal" className="border-b border-white/10">
                <AccordionTrigger className="text-white hover:text-primary transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Personal</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {personalLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-white/70 hover:text-primary transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="business" className="border-b border-white/10">
                <AccordionTrigger className="text-white hover:text-primary transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Business</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {businessLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-white/70 hover:text-primary transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shop" className="border-b border-white/10">
                <AccordionTrigger className="text-white hover:text-primary transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Shop</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {shopLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-white/70 hover:text-primary transition-all duration-300 group flex items-center space-x-2">
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </a>
                      </li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="websites" className="border-b border-white/10">
                <AccordionTrigger className="text-white hover:text-primary transition-colors duration-300 text-left py-2">
                  <span className="text-base font-medium">Our websites</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-3">
                    {websiteLinks.map((link, index) => <li key={index}>
                        <a href={link.href} className="text-white/70 hover:text-primary transition-all duration-300 group flex items-center space-x-2">
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
                    src={footer1} 
                    alt="Footer image 1"
                    className="transition-all duration-1000 ease-in-out hover:scale-110 hover:shadow-2xl hover:brightness-110 active:scale-95 group-hover:transform group-hover:-translate-y-2"
                    style={{ maxHeight: '120px', display: 'block', margin: '0 auto' }}
                  />
                </div>
                <div className="text-center group cursor-pointer">
                  <img 
                    src={footer3} 
                    alt="Footer image 3"
                    className="transition-all duration-1000 ease-in-out hover:scale-110 hover:shadow-2xl hover:brightness-110 active:scale-95 group-hover:transform group-hover:-translate-y-2"
                    style={{ maxHeight: '120px', display: 'block', margin: '0 auto' }}
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 shadow-md shadow-black/20 border border-white/20 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/80 group-hover:text-white transition-colors duration-300">03457 740 740</span>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 shadow-md shadow-black/20 border border-white/20 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/80 group-hover:text-white transition-colors duration-300">London, UK</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 group relative">
                      <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 shadow-md shadow-black/20 border border-white/20 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white/80 group-hover:text-white transition-colors duration-300">support@royalmail.com</span>
                    </div>
                    
                    {/* Thin line separator */}
                    <div className="w-full h-px bg-white/30"></div>
                    
                    {/* Social Links */}
                    <div className="flex space-x-2">
                      {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return <Button key={index} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 text-white/70 hover:text-primary hover:scale-110 transition-all duration-300" aria-label={social.label}>
                            <Icon className="h-4 w-4" />
                          </Button>;
                    })}
                    </div>
                    
                    {/* Copyright Text */}
                    <p className="text-white/50 text-sm font-medium tracking-wide text-center mb-6">© Royal Mail Group Ltd 2025</p>
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