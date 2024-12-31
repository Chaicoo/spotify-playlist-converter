import React, { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const SpotifyConverterForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const getCsrfToken = () => {
        return document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setResult(null);
    
      const formData = new FormData(e.target);
      const csrfToken = getCsrfToken();
      
      if (!csrfToken) {
        setError('CSRF token not found. Please refresh the page.');
        setIsLoading(false);
        return;
      }
    
      try {
        const response = await fetch('/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({
            spotify_url: formData.get('spotify_url'),
            playlist_title: formData.get('playlist_title'),
          }),
          credentials: 'same-origin',
        });
    
        const responseData = await response.json();
    
        if (responseData.redirect_url) {
          window.location.href = responseData.redirect_url;
          return;
        }
    
        if (!response.ok) {
          throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
        }
    
        setResult(responseData);
    
      } catch (err) {
        console.error('Conversion error:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };    

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Spotify to YouTube Converter
                    </CardTitle>
                    <CardDescription>
                        Convert your Spotify playlists to YouTube with just one
                        click
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="spotify_url">Spotify URL</Label>
                            <Input
                                type="text"
                                id="spotify_url"
                                name="spotify_url"
                                placeholder="https://open.spotify.com/playlist/..."
                                defaultValue="https://open.spotify.com/playlist/2HoABu4JCPj9UPJnCEMIWv?si=d6c62bf6fd624cfc"
                                className="w-full"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="playlist_title">
                                Playlist Title
                            </Label>
                            <Input
                                type="text"
                                id="playlist_title"
                                name="playlist_title"
                                placeholder="Enter playlist title"
                                defaultValue="Converted Playlist"
                                className="w-full"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                "Convert Playlist"
                            )}
                        </Button>
                    </form>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <Alert className="mt-4">
                            <AlertDescription>
                                Playlist converted successfully!{" "}
                                <a
                                    href={result.youtube_playlist_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium underline"
                                >
                                    Open YouTube Playlist
                                </a>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SpotifyConverterForm;
