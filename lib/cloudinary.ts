import { isSafeExternalUrl } from "@/lib/security";

export interface UploadResult {
  url: string;
  provider: "cloudinary" | "placeholder";
}

const ALLOWED_IMAGE_MIME = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const MAX_BASE64_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadProductPhoto(
  fileBase64OrUrl: string
): Promise<UploadResult> {
  const input = (fileBase64OrUrl || "").trim();

  // 4 & 5. File Upload MIME/Size & SSRF Protection
  if (input) {
    if (input.startsWith("data:")) {
      if (!ALLOWED_IMAGE_MIME.test(input)) {
        throw new Error("Only JPEG, PNG, or WEBP images are allowed.");
      }
      if (Buffer.byteLength(input, "utf8") > MAX_BASE64_BYTES) {
        throw new Error("Image size exceeds 5MB limit.");
      }
    } else if (!isSafeExternalUrl(input)) {
      throw new Error("Unsafe or non-HTTPS image URL blocked.");
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      url:
        input ||
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
      provider: "placeholder",
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import("crypto");
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", input);
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
