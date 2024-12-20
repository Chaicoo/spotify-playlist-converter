<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class PlaylistController extends Controller
{
    public function convert(Request $request)
    {
        $spotifyUrl = $request->input('spotify_url');

        if (!$spotifyUrl) {
            return response()->json(['error' => 'Invalid Spotify URL'], 400);
        }

        // Extrair o ID da playlist do URL
        $playlistId = $this->extractPlaylistId($spotifyUrl);
        if (!$playlistId) {
            return response()->json(['error' => 'Invalid Spotify Playlist URL'], 400);
        }

        // Obter músicas da playlist do Spotify
        $spotifyTracks = $this->getSpotifyTracks($playlistId);

        // Buscar no YouTube
        $youtubeLinks = $this->searchYouTube($spotifyTracks);

        return response()->json(['youtube_links' => $youtubeLinks]);
    }

    private function extractPlaylistId($url)
    {
        preg_match('/playlist\/([a-zA-Z0-9]+)/', $url, $matches);
        return $matches[1] ?? null;
    }

    private function getSpotifyTracks($playlistId)
    {
        $client = new Client();
        $authResponse = $client->post('https://accounts.spotify.com/api/token', [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode(env('SPOTIFY_CLIENT_ID') . ':' . env('SPOTIFY_CLIENT_SECRET')),
            ],
            'form_params' => [
                'grant_type' => 'client_credentials',
            ],
        ]);

        $authData = json_decode($authResponse->getBody(), true);
        $accessToken = $authData['access_token'];

        $response = $client->get("https://api.spotify.com/v1/playlists/{$playlistId}/tracks", [
            'headers' => [
                'Authorization' => "Bearer {$accessToken}",
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        $tracks = [];
        foreach ($data['items'] as $item) {
            if (isset($item['track']['name'], $item['track']['artists'])) {
                $trackName = $item['track']['name'];
                $artistName = $item['track']['artists'][0]['name'];
                $tracks[] = "{$trackName} {$artistName}";
            }
        }

        return $tracks;
    }

    private function searchYouTube($tracks)
    {
        $client = new Client();
        $youtubeLinks = [];

        foreach ($tracks as $track) {
            $response = $client->get('https://www.googleapis.com/youtube/v3/search', [
                'query' => [
                    'part' => 'snippet',
                    'q' => $track,
                    'key' => env('YOUTUBE_API_KEY'),
                    'maxResults' => 1,
                ],
            ]);

            $data = json_decode($response->getBody(), true);

            if (!empty($data['items'])) {
                $videoId = $data['items'][0]['id']['videoId'] ?? null;
                if ($videoId) {
                    $youtubeLinks[] = "https://www.youtube.com/watch?v={$videoId}";
                }
            }
        }

        return $youtubeLinks;
    }
}
