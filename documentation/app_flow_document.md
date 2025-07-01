# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a new user launches Astrophysicals for the first time, the app greets them with a dark mode splash screen animated by drifting constellations. A subtle “Get Started” button appears, inviting them into the experience. Tapping it opens a prompt to sign in with Aptos, where the user chooses between Google or Apple authentication. Behind the scenes, a non-custodial Aptos wallet is generated and its private keys are securely stored in the device’s enclave. Once authenticated, the user is guided to enter their birth date, birth time, and birth location. This information is encrypted on the device before it is sent to our cloud backend, ensuring privacy. As soon as the birth details are saved, the app builds the user’s basic astrology profile and transitions them to the Home screen.

If the user prefers not to use Google or Apple sign-in, they can opt for a manual wallet creation path. In this fallback, the app presents a generated 12-word seed phrase and instructs the user to record it safely. The wallet still lives entirely on their device and the user remains in full control of their keys. Lost passwords are not needed because authentication is tied to the wallet, but if a user loses their device or needs to recover their account, they can import the saved seed phrase into a new installation and regain access to their profile and NFTs.

In scenarios where a user does not yet have the full app and someone invites them to connect, an App Clip on iPhone or an Instant App on Android can be launched. This mini-version asks for minimal details—name, birth date, time, and location—builds a temporary astrology profile, and then hands off to the full app download. After installing the full app, the user is logged in automatically and sees their just-created profile ready to go.

## Main Dashboard or Home Page

Upon completing sign-in, the user lands on the Home screen. The top of the screen shows their Sun, Moon, and Rising signs alongside a short daily cosmic snapshot, such as a note about the current moon phase or a major transit. A bottom navigation bar provides quick access to three main sections: Home, Connections, and Profile. The Home section remains the default view and includes a large “Connect” button that initiates the in-person pairing flow. Across the top, a small notification icon indicates new chat messages or upcoming astrological events. The Home layout stays clean and intuitive, with the color palette of deep indigo backgrounds, lavender accents, and gold highlights ensuring that the mystical feel remains consistent throughout.

In the Connections tab, the user finds their personal timeline, called the Connection Chronicle. Each entry shows the date and a thumbnail of the minted NFT for that meeting. Tapping an entry opens a detailed view of the astrological insights, the NFT artwork in full, and any notes or shared media associated with that connection. The Profile tab allows the user to view or edit their birth details, manage connected wallets, toggle notification preferences, and export their timeline as a stylized PDF.

## Detailed Feature Flows and Page Transitions

### Initiating a Connection and Pairing

When two people meet, one user taps the central “Connect” button on the Home screen. This reveals a full-screen QR code. The second person scans that code with their phone camera or in-app scanner, and if they do not have the full app installed, they immediately see the App Clip prompt. If both users have the app and NFC is available, they can instead opt for a phone tap that triggers the same session handshake. Once proximity is confirmed, the app creates a private connection session. The screen then fades into the compatibility computation phase.

### Generating Astrological Insights

Within seconds, the app compares both natal charts against the current planetary positions and displays a synastry reading. A dynamic animation of zodiac glyphs swirls on screen as text appears, describing how the users’ Sun, Moon, and Venus signs interact. A compatibility label such as “Soulmate Spark” or “Playful Disruptor” is shown, along with a contextual note about any significant transit like a full moon or Mercury retrograde. The bottom of this view previews the NFT art, giving users a glimpse of the generated cosmic keepsake.

### One-Tap NFT Minting

Below the insights, each user sees a “Mint” button. When both users press it, a cloud function triggers an Aptos blockchain transaction. A progress indicator plays for a few seconds, then confirms success with a constellation burst animation. The newly minted NFT appears in each user’s wallet, and the art is cached locally. If the second user came through an App Clip, a prompt appears encouraging them to download the full app. After installing, they open Astrophysicals to find their first NFT and connection details already populated in their timeline.

### Exploring Timeline and Chat

Back on the full app, tapping any connection entry shows the NFT artwork, the original compatibility reading, and a space for adding notes or photos. An in-app chat icon at the top of each connection view opens a real-time messaging thread. Users can send text, images, or voice notes, react with star and planet emojis, and receive astrology-driven prompts when a new transit affects their relationship. Over time, badges or mini NFTs appear for milestones like the first month or first shared full moon, enriching the timeline.

## Settings and Account Management

In the Profile tab, the user sees their avatar, name, and astrology summary. A settings button leads to personal information management, where they can update their birth details or change their display name. Notification preferences allow the user to opt in or out of daily horoscopes, synastry alerts, or new NFT release announcements. Under a privacy section, the user can toggle whether future NFTs record city-level location. If granted location permission, the app reverse-geocodes coordinates into a city name for inclusion. Users can also export their Connection Chronicle as a stylized PDF and view all wallets linked to their account. A sign-out button logs the user out of Aptos, requiring re-authentication on next launch.

## Error States and Alternate Paths

If the user enters invalid birth details, the app shows a clear message explaining the issue and asks them to correct the fields. When network connectivity drops during pairing or minting, the app displays a retry screen that caches the request and automatically resumes once the connection returns. If the NFT minting fails on the blockchain, the user sees an error dialog with a friendly apology and a “Retry Mint” option. Should an NFC handshake fail, the app suggests switching to QR code scanning. If location permission is denied, the app falls back to a manual city entry prompt. All error messages use simple language and offer a clear next step to help the user get back on track.

## Conclusion and Overall App Journey

From the moment a new user opens the app, Astrophysicals guides them gently through setting up their astrology profile and non-custodial wallet. Meeting someone in person is as easy as tapping a button and scanning a code or tapping phones. In seconds, users share a playful compatibility reading and mint a unique NFT that captures their cosmic connection. The full app preserves these moments in a timeline enriched by chat, badges, and ongoing astrological insights. Settings and privacy controls ensure personal data stays secure while error screens and fallbacks keep the experience smooth. Altogether, Astrophysicals delivers both instant fun and lasting value in a seamless end-to-end flow.
