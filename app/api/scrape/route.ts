// internship/assignment-2/app/api/scrape/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios"; // Import AxiosError for type checking
import * as cheerio from "cheerio";
// Assuming you still want to connect to MongoDB and Supabase, uncomment these imports
// import connectToDatabase from '@/lib/mongodb';
// import BlogText from '@/models/BlogText'; // You'll need to create this model
// import { createClient } from '@supabase/supabase-js'; // If you move summary saving here later

// Supabase client initialization (if you save summary here)
// const supabaseUrl = process.env.SUPABASE_URL || '';
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string' || !url.startsWith("http")) { // Added type check for url
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    // --- Scraping Logic ---
    let scrapedText: string;
    try {
      // await connectToDatabase(); // Uncomment if using MongoDB to store full text

      // // Check if URL already scraped and stored in MongoDB
      // let blogText = await BlogText.findOne({ url });
      // if (blogText) {
      //   console.log(`Full text for ${url} found in DB. Skipping scrape.`);
      //   scrapedText = blogText.fullText;
      // } else {
        const scrapeResponse = await axios.get(url);
        const $ = cheerio.load(scrapeResponse.data);
        scrapedText = $("p, h1, h2, h3, h4, h5, h6")
          .map((_, el) => $(el).text().trim())
          .get()
          .join(" ");

        if (!scrapedText.trim()) { // Use .trim() to check for empty or whitespace-only text
          return NextResponse.json(
            { error: "No relevant content found at the provided URL. Try another URL." },
            { status: 400 }
          );
        }
        // Save full text to MongoDB (uncomment if using MongoDB)
        // blogText = new BlogText({ url, fullText: scrapedText });
        // await blogText.save();
        // console.log(`Full text for ${url} saved to DB.`);
      // }
    } catch (scrapeError) {
      console.error("Error during scraping:", scrapeError);
      return NextResponse.json(
        { error: "Failed to scrape the URL. It might be invalid or unreachable." },
        { status: 500 }
      );
    }

    // --- RapidAPI Summary & Translation Logic ---
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    if (!rapidApiKey) { // Ensure API key is present
        console.error("RAPIDAPI_KEY is not set in environment variables.");
        return NextResponse.json(
            { error: "Server configuration error: RapidAPI key missing." },
            { status: 500 }
        );
    }

    console.log("RapidAPI Key (first few chars):", rapidApiKey.substring(0, 5) + '...'); // Log safely
    console.log("Received URL for summary:", url);

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

      const summary = summaryResponse.data.summary || "Summary not available.";
      const translatedSummary = translateToUrdu(summary);

      // Save summary to Supabase (uncomment if you've set up Supabase here)
      // const { data: supabaseData, error: supabaseError } = await supabase
      //   .from('summaries') // Replace 'summaries' with your table name
      //   .insert([{ url, summary, urdu_summary: translatedSummary }]);

      // if (supabaseError) {
      //   console.error('Error saving summary to Supabase:', supabaseError);
      //   // Don't necessarily return an error here, as the summary itself was successful
      // } else {
      //   console.log('Summary saved to Supabase:', supabaseData);
      // }

      return NextResponse.json({
        scrapedText: scrapedText.slice(0, 1000), // Return a truncated version of scraped text
        summary,
        translatedSummary,
      });
    } catch (error) { // Type is now 'unknown' by default, which is safer
      // Refined error handling for AxiosError
      if (axios.isAxiosError(error)) { // Check if it's an AxiosError
        const axiosError = error as AxiosError; // Safely cast to AxiosError
        const errorMessage = (axiosError.response?.data as { message?: string })?.message || axiosError.message;
        console.error("Axios Error during summarization:", errorMessage, axiosError.response?.status, axiosError.config?.url);
        return NextResponse.json(
          { error: `Failed to summarize from RapidAPI: ${errorMessage || "Unknown RapidAPI error."}` },
          { status: axiosError.response?.status || 500 }
        );
      } else if (error instanceof Error) {
        console.error("General Error during summarization:", error.message);
        return NextResponse.json(
          { error: `Failed to summarize: ${error.message}` },
          { status: 500 }
        );
      } else {
        console.error("Unknown error during summarization:", error);
        return NextResponse.json(
          { error: "An unexpected error occurred during summarization." },
          { status: 500 }
        );
      }
    }
  } catch (initialError) { // Catch for the initial request.json() or URL validation
    console.error("Initial request processing error:", initialError);
    // Be more specific if initialError can be a JSON parse error etc.
    return NextResponse.json(
      { error: "Invalid request or URL." },
      { status: 400 }
    );
  }
}

// Your existing translateToUrdu function (keep as is or enhance your dictionary)
function translateToUrdu(text: string): string {
  const dictionary: { [key: string]: string } = {
    "the": "دی",
    "is": "ہے",
    "and": "اور",
    "to": "کو", // Changed 'کے لیے' to 'کو' for a more general 'to'
    "in": "میں",
    "of": "کا",
    "a": "ایک",
    "for": "کے لیے",
    "on": "پر",
    "with": "کے ساتھ",
    "summary": "خلاصہ",
    "article": "مضمون",
    "blog": "بلاگ",
    "content": "مواد",
    "important": "اہم",
    "information": "معلومات",
    "this": "یہ",
    "that": "وہ",
    "it": "یہ",
    "you": "آپ",
    "we": "ہم",
    "they": "وہ",
    "he": "وہ",
    "she": "وہ",
    "be": "ہو",
    "have": "ہے",
    "do": "کرنا",
    "say": "کہنا",
    "get": "حاصل کرنا",
    "make": "بنانا",
    "go": "جانا",
    "know": "جاننا",
    "take": "لینا",
    "see": "دیکھنا",
    "come": "آنا",
    "think": "سوچنا",
    "look": "دیکھنا",
    "want": "چاہنا",
    "give": "دینا",
    "use": "استعمال",
    "find": "تلاش",
    "tell": "بتانا",
    "ask": "پوچھنا",
    "work": "کام",
    "seem": "لگنا",
    "feel": "محسوس کرنا",
    "try": "کوشش کرنا",
    "leave": "چھوڑنا",
    "call": "بلانا",
    // Add more common words
  };

  const translatedWords: string[] = [];
  // Split by words, keeping punctuation for more accurate replacement
  const words = text.split(/(\b\w+\b|\s+|[.,!?;:"])/g).filter(Boolean); // Filter out empty strings from split

  for (const word of words) {
    const cleanedWord = word.toLowerCase().replace(/[^a-z0-9]/g, ''); // Remove punctuation for dictionary lookup
    if (dictionary[cleanedWord]) {
      // If found in dictionary, replace and re-attach original punctuation
      const originalPunctuation = word.match(/([^a-zA-Z0-9]*)$/)?.[0] || '';
      const leadingPunctuation = word.match(/^([^a-zA-Z0-9]*)/)?.[0] || '';
      translatedWords.push(leadingPunctuation + dictionary[cleanedWord] + originalPunctuation);
    } else {
      translatedWords.push(word); // Keep original word if not in dictionary
    }
  }

  return translatedWords.join(""); // Join with empty string because spaces are handled by the split
}