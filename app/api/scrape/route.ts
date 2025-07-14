import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    // Step 1: Scrape the blog post for raw text (for display purposes)
    const scrapeResponse = await axios.get(url);
    const $ = cheerio.load(scrapeResponse.data);
    const scrapedText = $("p, h1, h2, h3, h4, h5, h6")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");

    if (!scrapedText) {
      return NextResponse.json(
        { error: "No content found at the provided URL" },
        { status: 400 }
      );
    }

    // Step 2: Use RapidAPI article-extractor-and-summarizer
    const rapidApiKey = process.env.RAPIDAPI_KEY; // Set in .env.local
    const summaryResponse = await axios.get(
      "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
      {
        params: { url, length: "3" }, // Request a 3-sentence summary
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
        },
      }
    );

    const summary = summaryResponse.data.summary || "Summary not available.";

    // Step 3: Translate summary to Urdu (using dictionary-based approach for now)
    const translatedSummary = translateToUrdu(summary);

    return NextResponse.json({
      scrapedText: scrapedText.slice(0, 1000), // Limit for display
      summary,
      translatedSummary,
    });
  } catch (error: unknown) {
    console.error(error);
    let errorMessage = "Failed to scrape or summarize the URL";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Dictionary-based Urdu translation (same as before)
function translateToUrdu(text: string): string {
  const dictionary: { [key: string]: string } = {
    the: "دی",
    is: "ہے",
    and: "اور",
    to: "کے لیے",
    in: "میں",
    of: "کا",
    a: "ایک",
    for: "کے لیے",
    on: "پر",
    with: "کے ساتھ",
    // Add more words as needed
  };

  let translated = text.toLowerCase();
  for (const [english, urdu] of Object.entries(dictionary)) {
    translated = translated.replace(new RegExp(`\\b${english}\\b`, "g"), urdu);
  }

  return translated
    .split(" ")
    .map((word) => (dictionary[word] ? dictionary[word] : word))
    .join(" ");
}