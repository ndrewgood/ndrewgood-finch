# Voice memo states

The contact panel voice memo button (`RecordVoiceMemoButton.svelte`) moves through the states below. State transitions use the same swap animation as the copy email button (`swap-layer` classes). Timing is configured in `src/lib/voice-memo.config.ts`.

## States

### Entry

Default view.

- Title: **Send voice memo**
- Subtitle: Goes directly to Andrew’s phone
- Icon: `mic_outline`
- Interaction: clicking anywhere requests microphone access and moves to **Awaiting permission**

### Awaiting permission

- Title: **Asking for microphone permission**
- Subtitle: Look for a pop-up in your browser...
- Icon: `mic_pending`
- Interaction: waits for `navigator.mediaDevices.getUserMedia({ audio: true })`
- Next: **Ready to record** on success, **Error** on failure/denial

### Error

- Title: **Error occurred**
- Subtitle: Couldn't connect to your microphone
- Icon: `error` (red)
- Interaction: clicking anywhere retries permission from **Entry**

### Ready to record

Recorder toolbar inside a nested `bg-stone-150` container.

- Left: record button (`mic_outline`)
- Center: placeholder copy — Press the mic to record...
- Right: play (`play`) and next (`arrow_right_alt`) buttons, disabled
- Interaction:
  - record → **Recording**
  - play/next remain disabled until audio exists

### Recording

- Left: stop button (`stop`, red)
- Center: live dot waveform scrolling right to left
- Right: play and next disabled
- Interaction:
  - stop → **Finished recording**
  - auto-stops at 1 minute

### Finished recording

- Left: delete button (`delete`)
- Center: saved waveform
- Right: play and next enabled
- Interaction:
  - delete → clears audio and returns to **Ready to record**
  - play → **Playback**
  - next → **Add note**

### Playback

- Left: delete button
- Center: waveform with played dots darkened to show progress
- Right: pause (`pause`) and next enabled
- Interaction:
  - pause → **Finished recording**
  - playback ends automatically → **Finished recording**
  - next → **Add note**

### Add note

- Label: Add your name or message
- Input: free text note
- Icon: send (`send`)
- Interaction: send → **Sending**

### Sending

- Title: **Sending voice memo...**
- Icon: `pending`
- Current behavior: console.log payload, download audio file locally
- Future: upload memo + note to database for phone delivery
- Next: **Sent** after a short delay

### Sent

- Title: **Voice memo sent!**
- Icon: `check`
- Interaction: auto-resets to **Entry** after a configurable delay (`animation.sentDisplayMs` in config)

## Implementation notes

- **Animation tuning:** `src/lib/voice-memo.config.ts` — state swap duration, sent display time, UI transitions, waveform dot timing/gap/sizes, amplitude shaping
- Controller: `src/lib/voice-memo.svelte.ts`
- State swap helper: `src/lib/state-swap.svelte.ts`
- Waveform UI: `src/lib/components/GlobalNav/VoiceMemoWaveform.svelte`
- Waveform samples: configurable bar count + sample interval (see config)
- **Backend:** `POST /api/voice-memos` uploads audio + message to Firebase Storage/Firestore via Admin SDK
- **Admin:** `/answering-machine` (password in `ANSWERING_MACHINE_PASSWORD`) lists memos with signed audio URLs
- **Env:** see [`.env.example`](../.env.example) for required Firebase, auth, and Twilio SMS notify variables

## Future work

- Push notification to Andrew’s phone
- Retry/error copy for upload failures during **Sending**
