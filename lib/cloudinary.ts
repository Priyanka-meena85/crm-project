export interface UploadResult {
  url: string;
  provider: "cloudinary" | "placeholder";
}

export async function uploadProductPhoto(
  fileBase64OrUrl: string
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      url:
        fileBase64OrUrl ||
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
      provider: "placeholder",
    };
  }

  // Signed Cloudinary upload helper for server routes
  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import("crypto");
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", fileBase64OrUrl);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    provider: "cloudinary",
  };
}
