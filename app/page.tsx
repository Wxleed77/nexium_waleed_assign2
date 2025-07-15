"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800 text-center">
            Blog Post Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url" className="text-gray-700 font-medium">
                Enter Blog Post URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/blog-post"
                  className="bg-white/20 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 transition-all"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Summarize"
                  )}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-100/20 backdrop-blur-md border border-red-200/50 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {scrapedText && (
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Scraped Text
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed max-h-40 overflow-y-auto">
                {scrapedText}
              </p>
            </div>
          )}

          {summary && (
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Summary
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {translatedSummary && (
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Translated Summary (Urdu)
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed font-urdu">
                {translatedSummary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}