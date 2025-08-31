# Zola Local

**Zola Local** is the open-source, local-only chat interface for all your AI models. No registration, no cloud database - everything runs locally in your browser.

![zola cover](./public/cover_zola.jpg)

## Features

- 🏠 **Local-Only**: All data stored in your browser's IndexedDB
- 🔒 **Privacy-First**: No registration, no external servers for data storage
- 🤖 **Multi-model support**: OpenAI, Mistral, Claude, Gemini, Ollama (local models)
- 📁 **File uploads**: Process documents and images locally
- 🎨 **Clean UI**: Responsive design with light/dark themes
- 🛠️ **Built with**: Tailwind CSS, shadcn/ui, and prompt-kit
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- 🔧 **Customizable**: User system prompt, multiple layout options
- 🏃‍♂️ **Local AI with Ollama**: Run models locally with automatic model detection

## Quick Start

### Option 1: With OpenAI (Cloud)

```bash
git clone https://github.com/thevarunraja/zola-local.git
cd zola-local
npm install
echo "OPENAI_API_KEY=your-key" > .env.local
echo "CSRF_SECRET=$(openssl rand -hex 32)" >> .env.local
npm run dev
```

### Option 2: With Ollama (Local)

```bash
# Install and start Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2  # or any model you prefer

# Clone and run Zola Local
git clone https://github.com/thevarunraja/zola-local.git
cd zola-local
npm install
echo "CSRF_SECRET=$(openssl rand -hex 32)" > .env.local
npm run dev
```

Zola will automatically detect your local Ollama models!

### Option 3: Docker with Ollama

```bash
git clone https://github.com/thevarunraja/zola-local.git
cd zola-local
docker-compose -f docker-compose.ollama.yml up
```

## Local-Only Mode

This version of Zola runs entirely in your browser:

- ✅ **No Registration Required**: Start chatting immediately
- ✅ **Local Data Storage**: All chats stored in IndexedDB
- ✅ **Privacy-First**: Your conversations never leave your device
- ✅ **Works Offline**: Once loaded, works without internet (for local models)

For detailed setup instructions, see [INSTALL.md](./INSTALL.md).

## Built with

- [prompt-kit](https://prompt-kit.com/) — AI components
- [shadcn/ui](https://ui.shadcn.com) — core components
- [motion-primitives](https://motion-primitives.com) — animated components
- [vercel ai sdk](https://vercel.com/blog/introducing-the-vercel-ai-sdk) — model integration, AI features
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) — local data storage

## Sponsors

<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

## License

Apache License 2.0

## Notes

This is a beta release. The codebase is evolving and may change.
