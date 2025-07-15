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

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    console.log("RapidAPI Key:", rapidApiKey);
    console.log("Received URL:", url);

    try {
      const summaryResponse = await axios.get(
        "https://article-extractor-and-summarizer.p.rapidapi.com/summarize",
        {
          params: { url: encodeURIComponent(url), length: "3" },
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
          },
        }
      );
      console.log("Headers sent:", {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "article-extractor-and-summarizer.p.rapidapi.com",
      });
      const summary = summaryResponse.data.summary || "Summary not available.";
      const translatedSummary = translateToUrdu(summary);

      return NextResponse.json({
        scrapedText: scrapedText.slice(0, 1000),
        summary,
        translatedSummary,
      });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error && "message" in error) {
        const responseData =
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
            ? (error.response as { data?: { message?: string } }).data
            : undefined;
        console.error(
          "Axios Error:",
          responseData || (typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error))
        );
        return NextResponse.json(
          { error: "Failed to summarize: " + (responseData?.message || (typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error))) },
          { status: 500 }
        );
      } else {
        console.error("Axios Error:", error);
        return NextResponse.json(
          { error: "Failed to summarize: " + String(error) },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to scrape or process the URL" },
      { status: 500 }
    );
  }
}

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