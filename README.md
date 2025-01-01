# Playlist Converter 🎵

Este é um projeto de conversão de playlists que permite aos usuários converter playlists do Spotify para YouTube e também buscar músicas específicas de uma playlist do Spotify.

## ✨ Funcionalidades

- **Conversão de Playlists**: Transforma uma playlist do Spotify em uma playlist pública no YouTube.
- **Busca de Músicas**: Busca links de músicas individuais de uma playlist do Spotify.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**:
- [Laravel](https://laravel.com/) (Framework PHP)
- [GuzzleHTTP](https://docs.guzzlephp.org/) (Cliente HTTP para chamadas à API)
- [Google API Client](https://developers.google.com/youtube) (Integração com a API do YouTube)
- [API do Spotify](https://developer.spotify.com/documentation/web-api) (Para obtenção de músicas e playlists.)
- **Frontend**:
- [React](https://reactjs.org/) (Interface de usuário)
- Componentes customizados baseados em [Radix UI](https://www.radix-ui.com/) e [ShadCN](https://shadcn.dev/)

---

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos

Certifique-se de ter instalado:

- [PHP](https://www.php.net/downloads) (8.1 ou superior)
- [Composer](https://getcomposer.org/download/)
- [Node.js](https://nodejs.org/) (16.x ou superior)

---

### 2. Configuração do Projeto

#### 2.1 Clone o Repositório

```bash
git clone https://github.com/seu-usuario/playlist-converter.git
cd playlist-converter
```

#### 2.2 Instale as Dependências do Backend e do Frontend

```bash
composer install
npm install
```

#### 2.3 Configure o Arquivo .env

Copie o arquivo .env.example para .env:

```bash
cp .env.example .env
```

No .env, configure as variáveis a seguir:

- Spotify API:

```env
SPOTIFY_CLIENT_ID=seu_client_id_do_spotify
SPOTIFY_CLIENT_SECRET=seu_client_secret_do_spotify
```

- Google API:

```env
GOOGLE_CLIENT_ID=seu_client_id_do_google
GOOGLE_CLIENT_SECRET=seu_client_secret_do_google
GOOGLE_REDIRECT_URI=http://localhost:8000/youtube/callback
YOUTUBE_API_KEY=sua_chave_da_api_do_youtube
```

### 3. Rodando o Projeto

- Inicie o backend:

```bash
php artisan serve
```

| O backend estará disponível em http://localhost:8000.

- Inicie o frontend:

```bash
npm run dev
```

| O frontend estará disponível em http://localhost:5173
