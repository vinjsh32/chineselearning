# Chinese Learning

Simple Node.js application skeleton to guide learners of Chinese. It exposes routes for grammar, reading, listening, writing, character practice, and pinyin. The writing section optionally integrates with a free Hugging Face model to suggest corrections.

## Usage

1. Ensure Node.js 18 or later is installed.
2. (Optional) set the environment variable `HF_API_TOKEN` with a Hugging Face API token.
3. Start the server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser and navigate through the sections.

## Development Notes

Attempts to install external packages like Express or Axios failed due to access restrictions, so the implementation relies solely on built-in Node.js modules.
