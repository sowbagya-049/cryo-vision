# Cold Chain Intelligence OS

A 24-hour hackathon prototype demonstrating predictive temperature management and dynamic route optimization for cold chain logistics - **without any physical sensors**.

## 🎯 Core Innovation

Traditional cold-chain systems detect damage **after it happens**. This system **predicts** damage **before it happens**, tracks remaining freshness like a battery, and changes routes proactively.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically http://localhost:5173)

## 🎮 How to Demo

1. **Start Simulation**: Click "Start Simulation" to begin
2. **Try Different Scenarios**: Use the dropdown to test:
   - Normal Conditions
   - Heatwave (extreme temperatures)
   - Traffic Jam (truck stops in hot weather)
   - Optimal Conditions
3. **Manual Control**: Adjust temperature and truck speed in real-time
4. **Watch the Magic**: Observe automatic rerouting when risk is detected
5. **Review Decisions**: See the explainable AI logic in the Decision Log

## 📊 Key Features

### 1. Temperature Prediction (No Sensors!)
- Predicts inside temperature based on:
  - Outside temperature
  - Truck speed (moving/slow/stopped)
  - Time stopped
  - Product type

### 2. Freshness-as-a-Battery Model
- Freshness starts at 100%
- Decreases when temperature exceeds safe range
- Higher temperatures = faster decay
- Product still usable even at lower freshness

### 3. Risk Evaluation Engine
- Calculates risk using:
  - Remaining freshness
  - Distance to destination
  - Time remaining
  - Outside temperature trends
- Risk levels: Low, Medium, High

### 4. Predictive Rerouting
- Automatically changes routes BEFORE damage occurs
- Options:
  - Switch to safer route
  - Reroute to nearby cold storage
- All decisions explained in plain English

### 5. Live Analytics
- Route comparison table
- Freshness loss per route
- Risk event tracking
- Final delivery quality score

## 🧠 60-Second Judge Explanation

**"Traditional cold-chain monitoring uses sensors to detect when products go bad. But by then, it's too late.**

**Our system is different. Instead of detecting damage, we PREDICT it.**

**Here's how: We track the truck's location, speed, and outside temperature. Using rule-based logic, we predict the inside temperature - even without sensors. For example, if a truck is stopped in 40°C heat, we know the inside temp is rising.**

**We treat freshness like a phone battery - it starts at 100% and drains faster in bad conditions. When we predict the freshness will drop dangerously low, we automatically reroute the truck to a safer path or nearby cold storage.**

**Every decision is explained in plain English - judges can see exactly WHY the system acted.**

**The key insight: You don't need sensors to prevent spoilage. You need intelligence. By predicting problems and acting proactively, we save products, reduce waste, and ensure quality delivery.**

**Future scope: Add real GPS, integrate with IoT sensors, connect to cloud for fleet management, and deploy machine learning for even better predictions."**

## 📁 Project Structure

```
src/
├── types.ts                        # TypeScript type definitions
├── simulationEngine.ts             # Core prediction & routing logic
├── components/
│   ├── MapView.tsx                 # Visual map with routes
│   ├── MetricsPanel.tsx            # Temperature & freshness display
│   ├── DecisionLog.tsx             # Explainable AI decisions
│   ├── Analytics.tsx               # Route comparison & scoring
│   └── SimulationControls.tsx     # Demo controls
└── App.tsx                         # Main application
```

## 🔬 How It Works

### Temperature Prediction Logic

```typescript
if (truck is stopped) {
  tempIncrease = (minutes stopped × 0.5) + (outside temp × 0.15)
} else if (truck is slow) {
  tempIncrease = outside temp × 0.08
} else {
  tempIncrease = outside temp × 0.03
}
```

### Freshness Calculation

```typescript
if (inside temp is safe) {
  minor decay (0.05% per minute)
} else {
  tempExcess = inside temp - safe max
  decay rate = 0.5 + (tempExcess × 0.3)
}
```

### Risk Evaluation

- Freshness < 30% → +40 risk points
- Time/Freshness ratio > 1.5 → +30 risk points
- Outside temp > 35°C → +20 risk points
- Risk ≥ 50 → HIGH, ≥ 25 → MEDIUM, < 25 → LOW

### Rerouting Rules

- **HIGH risk + freshness < 25%** → Emergency cold storage
- **HIGH risk on fast route** → Switch to safe route
- **MEDIUM risk + freshness < 50%** → Switch to safe route

## 🎯 Hackathon Compliance

✅ Software-only prototype
✅ No physical sensors
✅ No IoT hardware
✅ No database (all in-memory)
✅ No cloud services
✅ No external APIs
✅ All data simulated/user-controlled
✅ Focus on logic, prediction, and decision-making

## 🌟 Demo Highlights

1. **Visual Map**: See truck movement, routes, and cold storage locations
2. **Real-time Metrics**: Temperature prediction, freshness battery, risk level
3. **Explainable Decisions**: Every route change explained with reasons
4. **Multiple Scenarios**: Test different conditions instantly
5. **Analytics Dashboard**: Compare routes, track events, view scores

## 🔮 Future Enhancements

- Integrate real GPS data
- Connect to actual IoT temperature sensors
- Deploy to cloud for multi-vehicle fleet management
- Machine learning for better predictions
- Historical data analysis and pattern recognition
- Mobile app for drivers
- Integration with warehouse management systems

## 📝 Technical Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## 🏆 Why This Wins

1. **Novel Approach**: Prediction over detection
2. **Practical**: Works without expensive sensor infrastructure
3. **Explainable**: Clear reasoning for all decisions
4. **Scalable**: Logic can integrate with real systems
5. **Demo-Ready**: Interactive, visual, and impressive

---

Built for a 24-hour Computer Science hackathon prototype.
