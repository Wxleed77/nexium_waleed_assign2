// internship/assignment-2/app/api/scrape/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios"; // Import AxiosError for type checking
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // 1. Basic URL validation and type check
    if (!url || typeof url !== 'string' || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    // 2. Scraping Logic (optional fallback, mostly for full text storage)
    // The RapidAPI summarizer can extract text itself, but this is good for storing original content.
    let scrapedText: string;
    try {
      const scrapeResponse = await axios.get(url);
      const $ = cheerio.load(scrapeResponse.data);
      scrapedText = $("p, h1, h2, h3, h4, h5, h6")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ");

      if (!scrapedText.trim()) { // Use .trim() to check for empty or whitespace-only text
        console.warn(`No relevant content scraped from ${url}. Continuing with API summarization.`);
        // Optionally, you could return an error here if scrapedText is absolutely required.
        // For now, we'll let the summarizer API try.
      }
    } catch (scrapeError: unknown) { // Use unknown for initial catch
        console.error("Error during local scraping:", scrapeError);
        // If scraping fails, we still want to try the RapidAPI summarizer,
        // so we'll set scrapedText to a default or empty string.
        scrapedText = ""; // Or some fallback message
        // Don't return an error here yet, as the API might still work.
    }


    // 3. RapidAPI Summary & Translation Logic
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

    try {
      const options = {
        method: "GET",
        url: 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize',
        params: {
          url: encodeURIComponent(url), // The blog URL to summarize
          html: "true", // Include HTML formatting in the response
          lang: "ur", // Set to Urdu
          engine: "2", // Specific engine version
        },
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
        },
      };

      const summaryResponse = await axios.request(options);

      const summary = summaryResponse.data.summary || "Summary not available.";
      // Since lang=ur provides Urdu summary directly, use it directly
      const translatedSummary = summary; // This is now the Urdu summary from the API

      return NextResponse.json({
        scrapedText: scrapedText.slice(0, 1000), // Limit for display or save the full text elsewhere
        summary: "English summary would go here if API provided it, but now it's Urdu.", // Adjust this based on your API's output
        translatedSummary, // This is the Urdu summary from the API
      });
    } catch (error: unknown) { // Explicitly type as unknown for robust handling
      // Enhanced error handling for Axios errors
      if (axios.isAxiosError(error)) { // Type guard to narrow 'error' to AxiosError
        const axiosError = error as AxiosError; // Explicit cast after type guard
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
  } catch (initialProcessingError: unknown) { // Catch for issues before API calls (e.g., parsing request body)
      console.error("Initial request processing error:", initialProcessingError);
      let errorMessage = "An unknown error occurred during request processing.";
      if (initialProcessingError instanceof Error) {
          errorMessage = initialProcessingError.message;
      } else if (typeof initialProcessingError === 'string') {
          errorMessage = initialProcessingError;
      }
      return NextResponse.json(
          { error: `Failed to process request: ${errorMessage}` },
          { status: 400 } // Often a bad request for initial errors
      );
  }
}

// NOTE: Your custom translateToUrdu function is no longer needed
// if the RapidAPI provides direct Urdu translation using `lang: "ur"`.
// If you still want to include it for fallback or other purposes, keep it,
// but ensure it's not called if the API already gives Urdu.
// If you keep it, define it here or import it from a utility file.