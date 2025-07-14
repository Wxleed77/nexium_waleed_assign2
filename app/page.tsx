"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scrapedText, setScrapedText] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setScrapedText("");
    setSummary("");
    setTranslatedSummary("");

    try {
      // Call API route to scrape and process
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (response.ok) {
        setScrapedText(data.scrapedText);
        setSummary(data.summary);
        setTranslatedSummary(data.translatedSummary);
      } else {
        setError(data.error || "Failed to process the URL");
      }
    } catch (err) {
      setError("An error occurred while processing the URL");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Blog Post Processor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">Blog Post URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/blog-post"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Process URL"}
            </Button>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {scrapedText && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Scraped Text</h2>
              <p className="text-sm text-gray-600">{scrapedText}</p>
            </div>
          )}

          {summary && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Summary</h2>
              <p className="text-sm text-gray-600">{summary}</p>
            </div>
          )}

          {translatedSummary && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Translated Summary (Urdu)</h2>
              <p className="text-sm text-gray-600">{translatedSummary}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}