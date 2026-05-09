# Pokepoke - The Ultimate Pokemon Hunter & Arcade Experience

A comprehensive, high-fidelity Pokemon companion app and arcade battle simulator. Features a premium design system, interactive maps, a deep Pokedex, and a cinematic arcade collection system.

## 🌟 Core Features

### 🎴 Mezastar Arcade Simulator (v3.0 - The Strategy Update!)
- **Ultra-Premium HoloCards**: 3D parallax, holographic shaders, and type-thematic backgrounds.
- **Strategic Matchup Analysis**: 
  - Full **Type Advantage System** (x1.5 Damage Multiplier) based on official element charts.
  - **Matchup Dashboard**: Real-time tactical analysis during battle preparation.
  - **Visual Auras**: Pokemon with elemental advantages emit a pulsing emerald aura.
- **Cinematic Battle VFX**: 
  - **Impact Sparks**: Dramatic star-bursts on every physical hit.
  - **Tactical Shields**: Hex-style defensive overlays when guarding.
  - **Elemental Particles**: Unique Fire, Poison, Electric, and Water/Ice effects for skills.
- **Manual Target Selection**: Win 2+ rounds to unlock a special choice screen where you pick 1 of the 3 enemies to attempt to capture.
- **Fluid Drag-to-Explore**: New inertial drag system for the collection reel—explore your gallery with tactile, physics-based swipes.
- **Pokemon-First Detail View**: Cinematic cardless inspection focusing on the monster's artwork, including **Signature Move descriptions**.
- **Child-Friendly UX**: 
  - **Out of Action** status for fainted fighters (Grayscale & Badges).
  - **Dynamic Sidebar Tips**: Real-time Advantage (↑) and Weakness (↓) indicators.
  - **Safe Initialization**: Manual fighter selection with premium empty slot placeholders.

### 🔍 Shiny Hunter Hub
- **Real-time Shiny Tracking**: Specialized interface for tracking your hunt progress.
- **Advanced Statistics**: Monitor encounter rates and probabilities.
- **Visual Feedback**: Dynamic shiny effects and status indicators.

### 📖 Next-Gen Pokedex
- **Branching Evolutions**: Recursive visualization of complex evolution trees (e.g., Eevee, Tyrogue).
- **Comprehensive Data**: Detailed stats, types, moves, and lore for all generations.
- **Type-Thematic UI**: Each Pokemon page adapts its theme based on its primary type.

### 🗺️ Interactive Maps & Weather
- **Regional Maps**: Explore detailed maps of various Pokemon regions.
- **Dynamic Weather Overlays**: Real-time visual weather effects (Rain, Snow, Storms) that affect the exploration experience.
- **Tactical Overlays**: View points of interest and regional markers.

## 🛠️ Technology Stack
- **Framework**: Next.js 14+ (Turbopack)
- **Animation**: Framer Motion (3D Transforms, Particles, Physics-based Swiping)
- **Icons**: Lucide React
- **State Management**: Zustand (with persistent arcade session tracking)
- **Database**: Supabase Integration
- **Styling**: Tailwind CSS & Vanilla CSS (Custom Glassmorphism & Cinematic Shaders)

## 🎮 How to Use
1. **Navigate**: Use the premium navbar to switch between the Pokedex, Shiny Hunter, Maps, and Mezastar.
2. **Collect**: In Mezastar, spend coins to summon rare holographic tags. Balance starts at 100,000 for elite testing.
3. **Strategize**: In Arcade Mode, look for the **↑/↓ indicators** in the sidebar to pick the best element counter for the current enemy.
4. **Battle**: Engage in turn-based duels, manage your energy, and time your **Signature Moves** for massive damage.
5. **Capture**: If you win at least 2 rounds, choose your favorite enemy from the session and throw a Poké Ball!

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **yarn**

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/alshafraz/Pokepoke.git
   cd Pokepoke
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

---
Created with ❤️ by [alshafraz](https://github.com/alshafraz)
