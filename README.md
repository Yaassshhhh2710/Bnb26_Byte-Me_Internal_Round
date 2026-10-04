# ROUNDTABLE — Local App

A local recreation of the ROUNDTABLE multispeaker meeting UI.

## Run

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite.

## Notes
- Demo mode is enabled by default and generates a realistic sample conversation.
- Turn Demo mode off to use browser SpeechRecognition where supported (Chrome/Edge usually support it).
- Speaker count is adjustable from 3 to 5.
- Speaker names default to Speaker 1, Speaker 2, etc., and can be changed before starting.
- Session data is in-memory for this local prototype.
- Google Fonts is optional; the app falls back to system fonts if unavailable.
