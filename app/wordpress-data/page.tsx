"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  RefreshCw,
  FileText,
  Image,
  Users,
  Clock,
  Database,
} from "lucide-react";
import type { CategorizedWordPressData } from "@/lib/services/wordpress-api";

export default function WordPressDataPage() {
  const [data, setData] = useState<CategorizedWordPressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/wordpress");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadJSON = () => {
    if (!data) return;

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wordpress-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading WordPress data...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && !data && (
          <Card>
            <CardHeader>
              <CardTitle>No Data</CardTitle>
              <CardDescription>No WordPress data available</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Fetch Data
              </Button>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">WordPress Data Dashboard</h1>
                <p className="text-muted-foreground">
                  Categorized data from {data.metadata.baseUrl}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={downloadJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Items
                    </p>
                    <p className="text-2xl font-bold">
                      {data.metadata.totalItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      API Version
                    </p>
                    <p className="text-lg">{data.metadata.apiVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fetched At
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(data.metadata.fetchedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Base URL
                    </p>
                    <a
                      href={data.metadata.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      API Endpoint
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pages</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.pages.count}</div>
                  <p className="text-xs text-muted-foreground">
                    Static content pages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.posts.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.posts.categories.length} categories,{" "}
                    {data.posts.tags.length} tags
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Media</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.media.count}</div>
                  <p className="text-xs text-muted-foreground">
                    Images, videos, and files
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.users.count}</div>
                  <p className="text-xs text-muted-foreground">
                    Authors and contributors
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pages ({data.pages.count})</CardTitle>
                  <CardDescription>WordPress pages content</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {data.pages.data.map((page) => (
                        <div key={page.id} className="border rounded-lg p-3">
                          <h3 className="font-semibold">
                            {page.title.rendered}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            /{page.slug}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">ID: {page.id}</Badge>
                            <Badge variant="outline">{page.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Posts ({data.posts.count})</CardTitle>
                  <CardDescription>WordPress blog posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {data.posts.data.map((post) => (
                        <div key={post.id} className="border rounded-lg p-3">
                          <h3 className="font-semibold">
                            {post.title.rendered}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            /{post.slug}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">ID: {post.id}</Badge>
                            <Badge variant="outline">{post.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Raw JSON Data</CardTitle>
                <CardDescription>
                  Complete WordPress data structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
