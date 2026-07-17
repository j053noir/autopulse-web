import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const year = searchParams.get("year");

  const BASE_URL = process.env.CARSXE_API_URL || "https://api.carsxe.com";
  const API_KEY = process.env.CARSXE_API_KEY;

  if (!API_KEY) {
    console.error("CARSXE_API_KEY is not defined in environment variables.");
    return NextResponse.json(
      { success: false, error: "API key is missing on the server" },
      { status: 500 }
    );
  }

  const carsxeUrl = new URL(`${BASE_URL}/images`);
  carsxeUrl.searchParams.append("key", API_KEY);
  if (make) carsxeUrl.searchParams.append("make", make);
  if (model) carsxeUrl.searchParams.append("model", model);
  if (year) carsxeUrl.searchParams.append("year", year);

  // Append other optional params if passed
  searchParams.forEach((value, key) => {
    if (key !== "make" && key !== "model" && key !== "year" && key !== "key") {
      carsxeUrl.searchParams.append(key, value);
    }
  });

  try {
    const res = await fetch(carsxeUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`CarsXE API error: ${res.statusText} (${res.status}). Body: ${errorText}`);
      return NextResponse.json(
        { success: false, error: `CarsXE API responded with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error proxying request to CarsXE:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error proxying CarsXE request" },
      { status: 500 }
    );
  }
}
