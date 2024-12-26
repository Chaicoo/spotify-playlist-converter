<!DOCTYPE html>
<html>

<head>
    <title>Test Convert</title>
</head>

<body>
    <form method="POST" action="{{ route('convert') }}">
        @csrf

        <label for="spotify_url">Spotify URL:</label>
        <input
            type="text"
            name="spotify_url"
            id="spotify_url"
            value="https://open.spotify.com/playlist/2HoABu4JCPj9UPJnCEMIWv?si=d6c62bf6fd624cfc" />

        <label for="playlist_title">Playlist Title:</label>
        <input
            type="text"
            name="playlist_title"
            id="playlist_title"
            value="Converted Playlist" />

        <button type="submit">Enviar</button>
    </form>
</body>

</html>