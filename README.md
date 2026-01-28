# 🧊 Cryo-Vision AI - Cold Chain Intelligence OS

**Real-time, predictive cold chain logistics platform** with GPS tracking, live weather integration, and autonomous decision-making.

## 🚀 Features

- ✅ **Digital Twin Sensing** - Predicts internal temperature without physical sensors
- ✅ **Custom GPS Routes** - Set any start/destination with live weather
- ✅ **Product Lifecycle Tracking** - Real-time shelf life monitoring
- ✅ **Predictive Analytics** - Early alerts before violations
- ✅ **Smart Routing** - Auto-reroute and abort decisions
- ✅ **Thermal Stress Index** - Cumulative heat exposure tracking
- ✅ **Explainable AI** - Every decision explained

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/sowbagya-049/cryo-vision.git
cd cryo-vision

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🌐 Live Demo

Visit: [https://cryo-vision.vercel.app](https://cryo-vision.vercel.app)

## 🎮 Usage

1. **Select Product** - Choose from Vaccine, Dairy, Frozen Food, Tomato, or Banana
2. **Set Custom Route** (Optional):
   - Enter start location (e.g., "Los Angeles, CA")
   - Enter destination (e.g., "Phoenix, AZ")
   - Click "🗺️ Set Custom Route"
3. **Start Simulation** - Watch real-time monitoring
4. **Observe**:
   - Temperature alerts
   - Turbo cooling activation
   - Days remaining countdown
   - Thermal stress accumulation

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Maps**: Custom SVG visualization
- **Weather**: OpenMeteo API
- **Geocoding**: OpenStreetMap Nominatim

## 📊 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── MapView.tsx     # GPS visualization
│   ├── MetricsPanel.tsx # Live metrics
│   └── ...
├── services/           # External APIs
│   ├── weatherService.ts
│   └── geocodingService.ts
├── data/               # Product database
│   └── productData.ts
├── simulationEngine.ts # Core prediction logic
└── types.ts            # TypeScript definitions
```

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` file:
```
VITE_WEATHER_API_URL=https://api.open-meteo.com
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Deploy!

### Manual Build

```bash
npm run build
# Output in dist/ folder
```

## 📝 License

MIT License - feel free to use for your projects!

## 👤 Author

**Sowbagya**
- GitHub: [@sowbagya-049](https://github.com/sowbagya-049)

## 🙏 Acknowledgments

- OpenMeteo for weather data
- OpenStreetMap for geocoding
- Lucide React for icons
