"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Link, FileText, AlertCircle, CheckCircle2, Globe } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.translatedSummary || data.summary || "Summary not available.");
      } else {
        setError(data.error || "Failed to process the URL. Please try again.");
      }
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred. Please check the URL and your internet connection.";
      if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Error: ${err}`;
      }
      setError(errorMessage);
      console.error("Client-side fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.05),transparent_50%)]"></div>
      
      <div className="w-full max-w-4xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-6 shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Article Summarizer
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Transform web articles into clear, concise Urdu summaries
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
              <div className="space-y-3">
                <Label htmlFor="url" className="text-slate-700 font-medium text-base flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Article URL
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="bg-slate-50/80 border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 px-4 py-3 text-base rounded-xl h-12"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 h-12 min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Summarize
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
                <Alert className="bg-red-50 border-red-200 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Success & Summary */}
            {summary && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                {/* Success indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Summary generated successfully</span>
                </div>
                
                {/* Summary Card */}
                <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      خلاصہ (Summary)
                    </h2>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-slate-700 text-base leading-relaxed text-right font-urdu whitespace-pre-wrap">
                      {summary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Powered by AI • Fast & Accurate Summarization
          </p>
        </div>
      </div>
    </div>
  );
}