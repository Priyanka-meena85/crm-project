export interface WhatsAppResult {
  success: boolean;
  mode: "cloud_api" | "twilio" | "wa_me_fallback";
  waLink: string;
  messageId?: string;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const formatted = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<WhatsAppResult> {
  const waLink = buildWhatsAppLink(phone, message);
  const digits = phone.replace(/\D/g, "");
  const toNumber = digits.length === 10 ? `91${digits}` : digits;

  // 1. WhatsApp Cloud API if configured
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: toNumber,
            type: "text",
            text: { body: message },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          mode: "cloud_api",
          waLink,
          messageId: data?.messages?.[0]?.id,
        };
      }
    } catch (err) {
      console.error("WhatsApp Cloud API fallback:", err);
    }
  }

  // 2. Twilio WhatsApp if configured
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const params = new URLSearchParams({
        To: `whatsapp:+${toNumber}`,
        From: twilioFrom,
        Body: message,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          mode: "twilio",
          waLink,
          messageId: data?.sid,
        };
      }
    } catch (err) {
      console.error("Twilio WhatsApp fallback:", err);
    }
  }

  // 3. Fallback: wa.me link ready for 1-click WhatsApp Web/App
  return {
    success: true,
    mode: "wa_me_fallback",
    waLink,
  };
}
