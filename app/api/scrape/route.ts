import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string' || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY;

    if (!rapidApiKey) {
        console.error("RAPIDAPI_KEY is not set in environment variables.");
        return NextResponse.json(
            { error: "Server configuration error: RapidAPI key is missing." },
            { status: 500 }
        );
    }

    console.log("RapidAPI Key (first few chars):", rapidApiKey.substring(0, 5) + '...');
    console.log("Received URL from frontend:", url); // Log the raw URL from the frontend

    const options = {
      method: "GET",
      url: "https://article-extractor-and-summarizer.p.rapidapi.com/summarize  ",
      params: {
        url: url, // <--- CHANGE THIS LINE: Remove encodeURIComponent
        html: "true",
        lang: "ur",
        engine: "2",
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
      },
    };

    // --- Add extensive logging here ---
    console.log("Axios request options being sent:", JSON.stringify(options, null, 2)); // Log the full options object
    const summaryResponse = await axios.request(options);
    console.log("API Response:", summaryResponse.data); // Debug the full response

    const summary = summaryResponse.data.summary || "Summary not available.";
    const translatedSummary = summary;

    return NextResponse.json({
      summary,
      translatedSummary,
    });
  } catch (error: unknown) {
    // ... (Your refined error handling logic from previous steps, ensure axios.isAxiosError is used) ...
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const responseData = axiosError.response?.data;
        const errorMessage = (responseData as { message?: string })?.message || axiosError.message;
        const statusCode = axiosError.response?.status || 500;

        console.error(
          `RapidAPI Summary Error: Status ${statusCode}, Message: ${errorMessage}`,
          axiosError.response?.data, // Log full response data
          axiosError.config // Log the request config that caused the error
        );
        return NextResponse.json(
          { error: `Failed to summarize from RapidAPI: ${errorMessage || "Unknown RapidAPI error."}` },
          { status: statusCode }
        );
    } else if (error instanceof Error) {
        console.error("General Error during summarization request:", error.message);
        return NextResponse.json(
          { error: `An unexpected error occurred: ${error.message}` },
          { status: 500 }
        );
    } else {
        console.error("Unforeseen error type during summarization request:", error);
        return NextResponse.json(
          { error: "An unforeseen error occurred during summarization." },
          { status: 500 }
        );
    }
  }
}