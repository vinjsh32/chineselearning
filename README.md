# Chinese Learning

Simple Node.js application skeleton to guide learners of Chinese. It exposes routes for grammar, reading, listening, writing, character practice, pinyin, and an AI tutor. The writing and tutor sections optionally integrate with a free Hugging Face model to suggest corrections and answer questions.

## Usage

1. Ensure Node.js 18 or later is installed.
2. (Optional) set the environment variable `HF_API_TOKEN` with a Hugging Face API token to enable AI-powered features.
3. Start the server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser and navigate through the sections.
   - `/writing` accepts text and returns a corrected version.
   - `/tutor` lets you ask questions; submit a prompt via the form and receive a model-generated reply.

## Development Notes

Attempts to install external packages like Express or Axios failed due to access restrictions, so the implementation relies solely on built-in Node.js modules.
