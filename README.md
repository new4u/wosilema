# AI Agent Guide: Am I Dead Yet? (Wo Si Le Ma?)

This document is designed to help AI agents navigate, understand, and interact with the "Am I Dead Yet?" DApp.

## 🎯 Application Purpose
This is a blockchain-based "Dead Man's Switch". Users deposit funds (Legacy) and must check in periodically (every 7 days) to prove they are alive. If they fail to check in, they are marked as "Dead", and their funds are transferred to a designated Heir.

## 🧭 Navigation Flow

### 1. Landing Page (Default)
- **Concept**: A marketing page with a built-in "Death Simulator".
- **Key Element**: `button` with text "LAUNCH APP" or "连接钱包 (Launch App)".
- **Action**: Click "LAUNCH APP" to enter the real application.

### 2. Main Application States
The app has 3 distinct states based on user status:

#### State A: Not Connected
- **Visual**: A large "Connect Soul" box.
- **Action**: Click button labeled "连接钱包 / CONNECT".
- **Behavior**: This triggers a real wallet connection via `window.ethereum` and will request switching/adding Monad Testnet.

#### State B: Connected, Not Registered
- **Visual**: "You Don't Exist" message.
- **Required Inputs**:
  - `textarea`: "Last Words" (Immutable). Must be unique.
- **Action**: Click button "出生 / DEPOSIT 0.1 MON".
- **Outcome**: User becomes "Alive" and timer starts.

#### State C: Registered (Alive)
- **Visual**: A Status Card showing "ALIVE" (Green) and a countdown timer.
- **Critical Actions**:
  - **Check In**: Click the large "我还活着 / I'M ALIVE" button with the HeartPulse icon. This resets the death timer to 7 days.
  - **Set Heir**: Current contract build does not expose a `setHeir()` method; the UI section is present but disabled.
  - **Add Estate**: Current contract build does not expose an "add funds" method; the UI section is present but disabled.

#### State D: Dead
- **Visual**: A red themed card showing "YOU DIED" / "你死了".
- **Content**: Shows the minted "Tombstone NFT" and the immutable Last Words.
- **Interaction**: No actions available (Game Over).

## ⚠️ Key DOM Attributes for Agents
- **Buttons**: Most primary actions are standard `<button>` elements. Look for text content rather than IDs.
- **Inputs**: 
  - Heir Input: `placeholder="0x..."`
  - Estate Input: `placeholder="0.0"`
  - Last Words: `textarea` element.
- **Status Indicators**:
  - Life Status: Look for text "ALIVE" (Green) or "CRITICAL" (Red) or "DECEASED".
  - Timer: The large countdown text (e.g., "6d 23h 59m...").

## 🧪 Simulation / Demo Mode
On the Landing Page (`/`), there is a "Death Simulator" (`#sim-card`).
- **Goal**: Demonstrate the check-in mechanic.
- **Controls**:
  - "签到 (Check In)": Resets the simulator timer to 10s.
  - "加速到死 (Fast Fwd)": Instantly drops timer to 0.5s to trigger death.
  - "重生 (Try Again)": Resets the simulator after death.

## 📝 Rules of Engagement
1. **Be Original**: When registering, do not use generic "Hello World" last words. The app requires unique strings.
2. **Check In**: If the timer is low (< 1 day), prioritize checking in.
3. **Heir**: Ensure a valid hex address is provided for the heir.

## 💰 Denomination
All amounts displayed in the UI are denominated as **MON** (Monad native token).

End of Guide.
