---
description: Install all project dependencies (Python, pip packages, npm packages)
allowed-tools: Bash
model: haiku

---

Run the installation script:

**For Windows:**
```bash
scripts\init\install_windows.bat
```

**For Linux:**
```bash
chmod +x scripts/init/install_linux.sh && ./scripts/init/install_linux.sh
```

**For macOS:**
```bash
chmod +x scripts/init/install_mac.sh && ./scripts/init/install_mac.sh
```

The installation script will:
1. Install Python 3.13 if not already installed
2. Install all pip packages from requirements.txt
3. Install Playwright browsers
4. Install FFmpeg
5. Run npm install in the visualise_video directory

Report the results to the user when complete.

After installation completes successfully, guide the user through API key setup:

1. Ask the user to visit: https://production2.outscal.com/v2/get-video-generation-api-key
2. Explain that they will need to register for an account (or login if already registered) to get their API key
3. Once they have their API key, ask them to:
   - Create a `.env` file in the project root directory if it doesn't already exist
   - Add the following line to the `.env` file: `OUTSCAL_API_KEY={their_api_key}`
   - Replace `{their_api_key}` with the actual API key they received

Wait for the user to confirm they have completed the API key setup before finishing.
