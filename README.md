# Pixel Hopper

[cloudflarebutton]

Pixel Hopper is a delightful 2D platformer game inspired by classic side-scrollers like Super Mario. The application features a single, playable level where the user controls a character named 'Pip'. Pip can run left and right, and jump to navigate the world. The world is constructed from various types of blocks: solid ground blocks, collectible coin blocks, and empty-air blocks. The level also features simple enemies that patrol back and forth. The player's objective is to navigate from the start of the level to the end goal, collecting coins for points and stomping on enemies to defeat them.

The entire game state, including player position, score, lives, and enemy states, is managed by a central Zustand store. The game logic is processed within a `requestAnimationFrame` loop for smooth, consistent performance. The visual style is intentionally playful and kid-friendly, using bright colors and a clean, modern aesthetic.

## ✨ Key Features

-   **Classic 2D Platformer Gameplay**: Run, jump, and navigate through a challenging level.
-   **Interactive World**: Interact with different block types, including collectible coin blocks.
-   **Enemies & Combat**: Stomp on simple patrolling enemies to defeat them.
-   **Centralized State Management**: Entire game state is managed efficiently with Zustand.
-   **Performant Game Loop**: Utilizes `requestAnimationFrame` for smooth, consistent physics and animations.
-   **Complete UI**: Features a Start Screen, in-game HUD (Score, Lives), and a Game Over screen.
-   **Responsive Design**: A fully responsive layout that maintains a 16:9 aspect ratio, ensuring a great experience on any device.

## 🛠️ Technology Stack

-   **Frontend**: React, TypeScript, Vite
-   **State Management**: Zustand
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **Animation**: Framer Motion
-   **Icons**: Lucide React
-   **Deployment**: Cloudflare Workers

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/pixel_hopper.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd pixel_hopper
    ```

3.  **Install dependencies using Bun:**
    ```bash
    bun install
    ```

## 🖥️ Running the Development Server

To start the local development server, run the following command:

```bash
bun dev
```

The application will be available at `http://localhost:3000` (or the next available port). The server supports hot-reloading, so any changes you make to the code will be reflected in the browser instantly.

## 部署 (Deployment)

This project is configured for easy deployment to Cloudflare's global network.

To deploy the application, run the following command:

```bash
bun run deploy
```

This command will build the application and deploy it using Wrangler.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[cloudflarebutton]

## ⚖️ License

This project is licensed under the MIT License - see the LICENSE file for details.