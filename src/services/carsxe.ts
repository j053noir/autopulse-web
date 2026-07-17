export interface CarsXEImageParams {
  make: string;
  model: string;
  year?: string;
  trim?: string;
  color?: string;
  transparent?: boolean;
  angle?: "front" | "front three-quarter" | "side" | "rear" | "rear three-quarter" | string;
  photoType?: "interior" | "exterior" | "engine" | string;
  size?: "Small" | "Medium" | "Large" | "Wallpaper" | "All" | string;
  license?: "Public" | "Share" | "ShareCommercially" | "Modify" | "ModifyCommercially" | string;
  format?: "json" | "xml" | string;
  validate?: boolean;
}

export interface CarsXEImageItem {
  mime: string;
  link: string;
  contextLink: string;
  height: number;
  width: number;
  byteSize: number;
  thumbnailLink: string;
  thumbnailHeight: number;
  thumbnailWidth: number;
  hostPageDomainFriendlyName?: string;
  accentColor?: string;
  datePublished?: string;
}

export interface CarsXEImageResponse {
  query: {
    year?: string;
    make: string;
    model: string;
  };
  images: CarsXEImageItem[];
  success: boolean;
  error?: string;
}

// Call our local Next.js API route proxy which appends the key server-side to avoid CORS blocks and secure the credential.
const PROXY_PATH = "/api/carsxe/images";

export async function fetchCarImages(params: CarsXEImageParams): Promise<CarsXEImageResponse> {
  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(PROXY_PATH, baseOrigin);
  
  // Attach required parameters (API Key is handled server-side by our proxy)
  url.searchParams.append("make", params.make);
  url.searchParams.append("model", params.model);

  // Attach optional parameters if they exist
  if (params.year) url.searchParams.append("year", params.year);
  if (params.trim) url.searchParams.append("trim", params.trim);
  if (params.color) url.searchParams.append("color", params.color);
  if (params.transparent !== undefined) {
    url.searchParams.append("transparent", String(params.transparent));
  }
  if (params.angle) url.searchParams.append("angle", params.angle);
  if (params.photoType) url.searchParams.append("photoType", params.photoType);
  if (params.size) url.searchParams.append("size", params.size);
  if (params.license) url.searchParams.append("license", params.license);
  if (params.format) url.searchParams.append("format", params.format);
  if (params.validate !== undefined) {
    url.searchParams.append("validate", String(params.validate));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CarsXE API HTTP error: ${response.status}`);
  }

  return response.json();
}
