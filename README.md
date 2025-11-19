# 🐍 Snake Game

A modern, responsive implementation of the classic Snake game built with **HTML5 Canvas**, **Vanilla JavaScript**, and **Tailwind CSS**.

This project features a retro neon aesthetic, a particle system for visual effects, and fully synthesized sound effects using the Web Audio API (no external audio files required).

## ✨ Features

* **🕹️ Classic Gameplay**: Eat food, grow longer, and avoid hitting the walls or yourself.
* **🎨 Retro Neon Aesthetic**: Glowing text and visual elements using CSS shadows and canvas effects.
* **🔊 Synthesized Audio**: Custom sound effects (Move, Eat, Game Over) generated dynamically using the **Web Audio API**.
* **✨ Particle System**: Exploding particle effects when food is consumed.
* **📱 Fully Responsive**: The canvas automatically resizes to fit any screen size (Desktop, Tablet, Mobile).
* **👆 Touch Controls**: Swipe gestures implemented for mobile gameplay.
* **💾 Local Storage**: High scores are saved locally in the browser.
* **⚡ Dynamic Difficulty**: The game speed increases slightly as your score grows.
* **⏸️ Pause Feature**: Press 'P' to pause/resume the game.

## 🛠️ Tech Stack

* **HTML5**: Semantic structure and Canvas API.
* **CSS3**: Animations, keyframes, and custom styling.
* **Tailwind CSS**: Utility-first styling (loaded via CDN).
* **JavaScript (ES6+)**: Game logic, state management, and Audio Context.

## 🚀 How to Run

Since this project uses vanilla JavaScript and a Tailwind CDN, **no build step or package installation is required.**

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/neon-snake-game.git](https://github.com/yourusername/neon-snake-game.git)
    ```
2.  **Navigate to the folder:**
    ```bash
    cd snake-game
    ```
3.  **Open `index.html`**:
    Simply double-click `index.html` to open it in your default web browser.

## 🎮 Controls

### Desktop
| Key | Action |
| :--- | :--- |
| **Arrow Keys** or **WASD** | Move Snake |
| **Space** or **Enter** | Start / Restart Game |
| **P** | Pause / Resume |

### Mobile
* **Swipe** (Up, Down, Left, Right) to change direction.
* **Tap** the screen to start the game.

## 📂 Project Structure

```text
/
├── index.html      # Main HTML structure and Tailwind CDN import
├── style.css       # Custom styles, fonts, and animations
├── game.js         # Game logic, canvas rendering, and audio synthesis
└── README.md       # Project documentation
