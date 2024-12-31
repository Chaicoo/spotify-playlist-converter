<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Google\Service\YouTube as GoogleYouTube;
use Google\Service\YouTube\Playlist as YouTubePlaylist;
use Google\Service\YouTube\PlaylistSnippet as YouTubePlaylistSnippet;
use Google\Service\YouTube\PlaylistStatus as YouTubePlaylistStatus;
use Google\Service\YouTube\PlaylistItem as YouTubePlaylistItem;
use Google\Service\YouTube\PlaylistItemSnippet as YouTubePlaylistItemSnippet;
use Google\Service\YouTube\ResourceId as YouTubeResourceId;

class PlaylistController extends Controller
{
    public function searchPlaylist(Request $request)
    {
        $spotifyUrl = $request->input('spotify_url');

        if (!$spotifyUrl) {
            return response()->json(['error' => 'Invalid Spotify URL'], 400);
        }

        $playlistId = $this->extractPlaylistId($spotifyUrl);
        if (!$playlistId) {
            return response()->json(['error' => 'Invalid Spotify Playlist URL'], 400);
        }

        $spotifyTracks = $this->getSpotifyTracks($playlistId);
        $youtubeLinks = $this->searchYouTube($spotifyTracks);

        return response()->json(['youtube_links' => $youtubeLinks]);
    }

    public function convert(Request $request)
    {
        $spotifyUrl = $request->input('spotify_url');
        $playlistTitle = $request->input('playlist_title', 'Converted Playlist');

        if (!$spotifyUrl) {
            $spotifyUrl = session('spotify_url');
        }

        if (!$playlistTitle) {
            $playlistTitle = session('playlist_title', 'Converted Playlist');
        }

        if (!$spotifyUrl) {
            return response()->json(['error' => 'Invalid Spotify URL'], 400);
        }

        session([
            'spotify_url' => $spotifyUrl,
            'playlist_title' => $playlistTitle,
        ]);

        $playlistId = $this->extractPlaylistId($spotifyUrl);
        if (!$playlistId) {
            return response()->json(['error' => 'Invalid Spotify Playlist URL'], 400);
        }

        $spotifyTracks = $this->getSpotifyTracks($playlistId);
        $youtubeLinks = $this->searchYouTube($spotifyTracks);

        $authResponse = $this->createYouTubePlaylist($playlistTitle, $youtubeLinks);

        if ($authResponse instanceof \Illuminate\Http\RedirectResponse) {
            return $authResponse;
        }

        return response()->json([
            'youtube_playlist_url' => "https://www.youtube.com/playlist?list={$authResponse}"
        ]);
    }

    private function extractPlaylistId($url)
    {
        preg_match('/playlist\/([^\/\?]+)/', $url, $matches);
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

    private function createYouTubePlaylist($title, $youtubeLinks)
    {
        $client = new \Google_Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope("https://www.googleapis.com/auth/youtube");
        $client->setAccessType('offline');

        $authResponse = $this->getOAuthToken($client);

        if (is_string($authResponse)) {
            return response()->json(['redirect_url' => $authResponse]);
        }

        $client->setAccessToken($authResponse);

        $youtube = new GoogleYouTube($client);

        $playlistSnippet = new YouTubePlaylistSnippet();
        $playlistSnippet->setTitle($title);
        $playlistSnippet->setDescription("Playlist converted from Spotify");

        $playlistStatus = new YouTubePlaylistStatus();
        $playlistStatus->setPrivacyStatus('public');

        $playlist = new YouTubePlaylist();
        $playlist->setSnippet($playlistSnippet);
        $playlist->setStatus($playlistStatus);

        $createdPlaylist = $youtube->playlists->insert('snippet,status', $playlist);
        $playlistId = $createdPlaylist->getId();

        foreach ($youtubeLinks as $videoUrl) {
            $videoId = preg_replace('/https:\/\/www\.youtube\.com\/watch\?v=/', '', $videoUrl);

            $playlistItemSnippet = new YouTubePlaylistItemSnippet();
            $playlistItemSnippet->setPlaylistId($playlistId);
            $playlistItemSnippet->setResourceId(new YouTubeResourceId([
                'kind' => 'youtube#video',
                'videoId' => $videoId,
            ]));

            $playlistItem = new YouTubePlaylistItem();
            $playlistItem->setSnippet($playlistItemSnippet);

            $youtube->playlistItems->insert('snippet', $playlistItem);
        }

        return $playlistId;
    }

    public function handleGoogleCallback(Request $request)
    {
        $client = new \Google_Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));

        if ($request->has('code')) {
            $accessToken = $client->fetchAccessTokenWithAuthCode($request->input('code'));
            session(['youtube_access_token' => $accessToken]);

            return redirect('/test-convert')->with('success', 'YouTube authenticated successfully!');
        }

        return redirect('/')->withErrors('Failed to authenticate with YouTube.');
    }

    private function getOAuthToken($client)
    {
        if (!session()->has('youtube_access_token')) {
            if (!request()->has('code')) {
                $authUrl = $client->createAuthUrl();
                return $authUrl;
            }

            return null;
        }

        return session('youtube_access_token');
    }
}
