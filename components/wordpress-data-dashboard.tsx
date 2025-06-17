"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  RefreshCw,
  FileText,
  Image,
  Users,
  Calendar,
  ExternalLink,
  Tag,
  Folder,
  Clock,
  Database,
} from "lucide-react";
import {
  CategorizedWordPressData,
  WordPressPage,
  WordPressPost,
  WordPressMedia,
  WordPressUser,
} from "@/lib/services/wordpress-api";

interface WordPressDataDashboardProps {
  initialData?: CategorizedWordPressData | null;
}

export function WordPressDataDashboard({
  initialData,
}: WordPressDataDashboardProps) {
  const [data, setData] = useState<CategorizedWordPressData | null>(
    initialData || null
  );
  const [loading, setLoading] = useState(!initialData);
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
    if (!initialData) {
      fetchData();
    }
  }, [initialData]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading WordPress data...</span>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!data) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
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

      {/* Metadata Card */}
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
              <p className="text-2xl font-bold">{data.metadata.totalItems}</p>
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
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                API Endpoint
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pages.count}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(data.pages.lastUpdated).toLocaleString()}
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

      {/* Detailed Data Tabs */}
      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pages ({data.pages.count})</CardTitle>
              <CardDescription>WordPress pages content</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.pages.data.map((page: WordPressPage) => (
                    <div key={page.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {page.title.rendered}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            /{page.slug}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">ID: {page.id}</Badge>
                            <Badge variant="outline">{page.status}</Badge>
                            {page.featured_media && (
                              <Badge variant="outline">
                                <Image className="h-3 w-3 mr-1" />
                                Featured Media
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Modified:{" "}
                            {new Date(page.modified).toLocaleDateString()}
                          </p>
                          <a
                            href={page.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                          >
                            View Page
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Posts List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Posts ({data.posts.count})</CardTitle>
                  <CardDescription>
                    WordPress blog posts and articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {data.posts.data.map((post: WordPressPost) => (
                        <div key={post.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {post.title.rendered}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                /{post.slug}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">ID: {post.id}</Badge>
                                <Badge variant="outline">{post.status}</Badge>
                                {post.categories.length > 0 && (
                                  <Badge variant="outline">
                                    <Folder className="h-3 w-3 mr-1" />
                                    {post.categories.length} categories
                                  </Badge>
                                )}
                                {post.tags.length > 0 && (
                                  <Badge variant="outline">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {post.tags.length} tags
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(post.date).toLocaleDateString()}
                              </p>
                              <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                              >
                                View Post
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Categories and Tags */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Categories ({data.posts.categories.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {data.posts.categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-xs text-muted-foreground">
                              /{category.slug}
                            </p>
                          </div>
                          <Badge variant="secondary">{category.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags ({data.posts.tags.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {data.posts.tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{tag.name}</p>
                            <p className="text-xs text-muted-foreground">
                              /{tag.slug}
                            </p>
                          </div>
                          <Badge variant="secondary">{tag.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Library ({data.media.count})</CardTitle>
              <CardDescription>
                Images, videos, and file attachments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.media.data.map((media: WordPressMedia) => (
                    <div key={media.id} className="border rounded-lg p-4">
                      <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                        {media.media_type === "image" ? (
                          <img
                            src={media.source_url}
                            alt={media.alt_text || media.title.rendered}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">
                        {media.title.rendered}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {media.mime_type}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary">ID: {media.id}</Badge>
                        <a
                          href={media.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users ({data.users.count})</CardTitle>
              <CardDescription>Authors and contributors</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.users.data.map((user: WordPressUser) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                          {user.avatar_urls && user.avatar_urls["96"] ? (
                            <img
                              src={user.avatar_urls["96"]}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            @{user.slug}
                          </p>
                          {user.description && (
                            <p className="text-sm mt-1">{user.description}</p>
                          )}
                          <Badge variant="secondary" className="mt-2">
                            ID: {user.id}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Raw JSON Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Raw JSON Data</CardTitle>
          <CardDescription>Complete WordPress data structure</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
