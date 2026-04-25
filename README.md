# Role Path Server

A basic Node.js server with Express that integrates with OpenAI API.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 3. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start at `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Chat with OpenAI
- **POST** `/api/chat`
- Request body:
  ```json
  {
    "message": "Your question here"
  }
  ```
- Response:
  ```json
  {
    "message": "Your question here",
    "reply": "OpenAI's response"
  }
  ```

## Example Usage

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what is 2+2?"}'
```

## Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

## Notes

- This server uses `gpt-3.5-turbo` model by default
- You can modify the model, temperature, and max_tokens in `server.js`
- Make sure your OpenAI account has available credits
