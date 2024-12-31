import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, ArrowRight, Music, Youtube } from "lucide-react";

const PlaylistConverter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("convert");

    const getCsrfToken = () => {
        return document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
    };

    const handleSubmit = async (e, action) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setDialogOpen(true);

        const formData = new FormData(e.target);
        const csrfToken = getCsrfToken();
        const endpoint = action === "convert" ? "/convert" : "/api/search-playlist";

        if (!csrfToken) {
            setError("CSRF token not found. Please refresh the page.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    spotify_url: formData.get("spotify_url"),
                    playlist_title: formData.get("playlist_title"),
                }),
                credentials: "same-origin",
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(
                    responseData.error ||
                        `HTTP error! status: ${response.status}`
                );
            }

            setResult(responseData);
        } catch (err) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Tabs defaultValue="convert" className="w-full max-w-lg">
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger
                        value="convert"
                        onClick={() => setActiveTab("convert")}
                    >
                        Converter Playlist
                    </TabsTrigger>
                    <TabsTrigger
                        value="search"
                        onClick={() => setActiveTab("search")}
                    >
                        Buscar Músicas
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="convert">
                    <Card>
                        <CardHeader>
                            <CardTitle>Spotify para YouTube</CardTitle>
                            <CardDescription>
                                Converta playlists do Spotify para o YouTube.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => handleSubmit(e, "convert")}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="spotify_url">
                                        URL do Spotify
                                    </Label>
                                    <Input
                                        id="spotify_url"
                                        name="spotify_url"
                                        placeholder="https://open.spotify.com/playlist/..."
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="playlist_title">
                                        Título da Playlist
                                    </Label>
                                    <Input
                                        id="playlist_title"
                                        name="playlist_title"
                                        placeholder="Nome da Playlist"
                                        defaultValue="Converted Playlist"
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Convertendo...
                                        </>
                                    ) : (
                                        "Converter"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="search">
                    <Card>
                        <CardHeader>
                            <CardTitle>Buscar Músicas</CardTitle>
                            <CardDescription>
                                Busque músicas de uma playlist do Spotify.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => handleSubmit(e, "search")}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="spotify_url">
                                        URL do Spotify
                                    </Label>
                                    <Input
                                        id="spotify_url"
                                        name="spotify_url"
                                        placeholder="https://open.spotify.com/playlist/..."
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Buscando...
                                        </>
                                    ) : (
                                        "Buscar"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isLoading
                                ? activeTab === "convert"
                                    ? "Convertendo Playlist..."
                                    : "Buscando Músicas..."
                                : "Operação Concluída!"}
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="flex flex-col items-center space-y-4">
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                <span>
                                    {activeTab === "convert"
                                        ? "Convertendo..."
                                        : "Buscando..."}
                                </span>
                            </div>
                        ) : result ? (
                            <div className="text-center">
                                <p className="mb-4">
                                    {activeTab === "convert"
                                        ? "Playlist convertida com sucesso!"
                                        : "Músicas buscadas com sucesso!"}
                                </p>
                                {result.youtube_playlist_url ? (
                                    <a
                                        href={result.youtube_playlist_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        Abrir Playlist no YouTube
                                    </a>
                                ) : (
                                    <ul className="list-disc list-inside">
                                        {result.youtube_links &&
                                            result.youtube_links.map(
                                                (link, index) => (
                                                    <li key={index}>
                                                        <a
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 underline"
                                                        >
                                                            Música {index + 1}
                                                        </a>
                                                    </li>
                                                )
                                            )}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <p className="text-red-500">
                                Erro ao processar a solicitação.
                            </p>
                        )}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        {!isLoading && (
                            <AlertDialogAction
                                onClick={() => setDialogOpen(false)}
                            >
                                Fechar
                            </AlertDialogAction>
                        )}
                        {isLoading && (
                            <AlertDialogCancel
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancelar
                            </AlertDialogCancel>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PlaylistConverter;
