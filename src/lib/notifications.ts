export const sendWhatsAppNotification = async (message: string) => {
  const apiKey = (import.meta as any).env.VITE_CALLMEBOT_API_KEY;
  const phone = (import.meta as any).env.VITE_CALLMEBOT_PHONE;

  if (!apiKey || !phone) {
    console.error("CallMeBot config missing");
    return;
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;

  try {
    // Note: This might hit CORS issues in a browser, but it's the standard way to call CallMeBot
    await fetch(url, { mode: 'no-cors' });
    console.log("Notification sent via CallMeBot");
  } catch (error) {
    console.error("CallMeBot error:", error);
  }
};
