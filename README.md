# 🎵 Music Bar

Music Bar is a modern, Progressive Web Application (PWA) designed specifically for bars, cafes, and restaurants to manage their background music and allow customers to request songs interactively. Built with **Next.js**, **React**, **Tailwind CSS**, and the **YouTube Data/IFrame API**.

## ✨ Key Features

- **🎧 Persistent Seamless Playback:**
  The music never stops. A persistent YouTube IFrame player runs in the background, ensuring that even if the admin navigates between different management pages, the music continues seamlessly without reloading.
  
- **📱 Mobile-First Customer Requests (`/request`):**
  Customers can scan a QR code to access a mobile-optimized page where they can search for any song on YouTube and add it to the queue. **Crucially**, the music does not autoplay on the customer's phone—it only plays on the main system connected to the store's speakers.

- **🤖 Smart Queue Management:**
  The system intelligently switches between the store's default "Playlist Mode" and customer "Request Mode". When a customer requests a song, it waits patiently in the queue and plays exactly when the current song finishes, without abruptly cutting off the vibe.
  
- **📺 Audio & Video Modes:**
  The main player features a stunning, premium UI with glowing album art. Want to see the music video? Simply toggle **Video Mode**, and the YouTube video smoothly overlays the album art without interrupting playback.

- **⚙️ Admin Dashboard (`/admin`):**
  A PIN-protected area where store staff can create custom playlists, search and import playlists directly from YouTube, and set the default playlist that plays when there are no customer requests.

- **🔋 PWA & Background Support:**
  Utilizes the Wake Lock API to prevent the screen from sleeping while playing, and the Page Visibility API to handle background pausing/resuming smoothly.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + Shadcn UI
- **Database:** [PostgreSQL (Neon)](https://neon.tech/) + [Prisma ORM](https://www.prisma.io/)
- **Data Fetching:** [SWR](https://swr.vercel.app/)
- **Media:** YouTube IFrame API & YouTube Data API v3
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Bun (or npm/yarn)
- A PostgreSQL Database URL (Neon is recommended)
- A YouTube Data API v3 Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/music-bar.git
   cd music-bar
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@host/database"
   YOUTUBE_API_KEY="your_youtube_api_key_here"
   ```

4. **Initialize Database:**
   Push the Prisma schema to your database.
   ```bash
   bunx prisma db push
   ```

5. **Run the development server:**
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `app/(system)/`: Layout and pages for the main store system (Player & Admin). Includes the persistent player.
- `app/request/`: Isolated layout for the customer request page (Mobile optimized, no background player).
- `components/`: Reusable React components including the `PersistentYouTubePlayer` and `PlayerView`.
- `context/`: React Context (`player-context.tsx`) that manages the global state of the queue, volume, and playback modes.
- `lib/`: Utility functions and Prisma client setup.
- `prisma/`: Database schema definition.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.
