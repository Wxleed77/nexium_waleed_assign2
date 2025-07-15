// internship/assignment-2/app/api/scrape/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios"; // Correct: Import AxiosError for type checking
// REMOVE THIS LINE: import { unknown } from "zod"; // This is the problematic line

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string' || !url.startsWith("http")) { // Added type check for url
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    // RapidAPI Summary & Translation Logic
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    // Check if API key is missing
    if (!rapidApiKey) {
        console.error("RAPIDAPI_KEY is not set in environment variables.");
        return NextResponse.json(
            { error: "Server configuration error: RapidAPI key is missing." },
            { status: 500 }
        );
    }

    // Console logs for debugging (consider removing or making conditional in production)
    console.log("RapidAPI Key (first few chars):", rapidApiKey.substring(0, 5) + '...');
    console.log("Received URL for summarization:", url);

    const options = {
      method: "GET",
      url: "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
      params: {
        url: encodeURIComponent(url), // The blog URL to summarize
        html: "true", // Include HTML formatting
        lang: "ur", // Urdu language
        engine: "2", // Specific engine version
      },
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
      },
    };

    const summaryResponse = await axios.request(options);
    console.log("API Response:", summaryResponse.data); // Debug the full response

    const summary = summaryResponse.data.summary || "Summary not available.";
    const translatedSummary = summary; // API handles Urdu, so no additional translation needed

    return NextResponse.json({
      summary,
      translatedSummary,
    });
  } catch (error: unknown) { // 'unknown' is a built-in type, no import needed
    // Enhanced error handling for Axios errors
    if (axios.isAxiosError(error)) { // Type guard to narrow 'error' to AxiosError
      const axiosError = error as AxiosError; // Explicit cast after type guard for clarity
      const responseData = axiosError.response?.data; // Safely access response data
      const errorMessage = (responseData as { message?: string })?.message || axiosError.message;
      const statusCode = axiosError.response?.status || 500;

      console.error(
        `RapidAPI Summary Error: Status ${statusCode}, Message: ${errorMessage}`,
        axiosError.response?.data // Log full response data for debugging
      );
      return NextResponse.json(
        { error: `Failed to summarize from RapidAPI: ${errorMessage || "Unknown RapidAPI error."}` },
        { status: statusCode }
      );
    } else if (error instanceof Error) { // Handle other standard Error objects
      console.error("General Error during summarization request:", error.message);
      return NextResponse.json(
        { error: `An unexpected error occurred: ${error.message}` },
        { status: 500 }
      );
    } else { // Handle truly unknown errors
      console.error("Unforeseen error type during summarization request:", error);
      return NextResponse.json(
        { error: "An unforeseen error occurred during summarization." },
        { status: 500 }
      );
    }
  }
}