# Upstox Scanners — Product Requirements Document

**Version:** 1.0  
**Date:** 2 April 2026  
**Author:** Product Management  
**Audience:** Design, Product, Marketing, Business  
**Status:** Draft

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Users & Personas](#2-target-users--personas)
3. [Scanner Types — Taxonomy](#3-scanner-types--taxonomy)
4. [Module A — DIY Custom Screener](#4-module-a--diy-custom-screener)
5. [Module B — Pre-Built Scanners](#5-module-b--pre-built-scanners)
6. [Module C — Marketplace Scanners](#6-module-c--marketplace-scanners)
7. [Alerts & Scheduled Runs](#7-alerts--scheduled-runs)
8. [Mobile Experience — Opportunity Feed](#8-mobile-experience--opportunity-feed)
9. [Embeddable Scanners](#9-embeddable-scanners)
10. [Adoption & Engagement Strategy](#10-adoption--engagement-strategy)
11. [User Acquisition & Monetisation](#11-user-acquisition--monetisation)
12. [Touchpoints & Distribution](#12-touchpoints--distribution)
13. [User Stories & Use Cases](#13-user-stories--use-cases)
14. [Open Product Questions](#14-open-product-questions)
15. [Success Metrics](#15-success-metrics)

---

## 1. Product Vision

Build the most comprehensive, beginner-friendly yet powerful stock scanner platform for Indian equity markets that helps traders — from first-timers to full-time professionals — discover trading and investment opportunities using technical, fundamental, and derivatives-based screening.

**One-liner:** *"From signal to trade — your daily market edge."*

### 1.1 Why Scanners?

| Problem | Scanner Solution |
|---|---|
| Traders don't know where to look each morning | Pre-built morning scanners surface gap-ups, ORBs, volume shockers — ready at 9:15 AM |
| Learning a strategy is separate from executing it | Each pre-built scanner comes with a playbook: What, Why, Entry, Stop-loss, Hold duration, Risk:Reward |
| Building custom screens is too complex on most platforms | Visual condition builder with 100+ indicators — no coding, no formulas |
| Good screeners exist but aren't shared | Marketplace lets creators publish, get recognized, and grow a following |
| Alerts are an afterthought | Scheduled runs + multi-channel alerts (WhatsApp, Push, Email, Browser) convert scans into real-time actions |

### 1.2 Key Principles

1. **Actionable, not advisory** — Show signals, education, and context. Never give buy/sell recommendations.
2. **Learn by doing** — Every pre-built scanner is a mini-course. Strategy + Playbook + Live results.
3. **Beginner-first, pro-capable** — Simple entry points (Quick Scan, Pre-builts), advanced depth (DIY multi-group, multi-timeframe).
4. **Community flywheel** — Users create → publish → get likes/views → share → attract new users → more creators.
5. **Embedded everywhere** — Scanners should live wherever traders are: App, Web, Pro, blogs, social media (via embeds/iframes).

---

## 2. Target Users & Personas

### 2.1 Trading Style Personas

| Persona | Holding Period | Typical Timeframe | Scanner Needs | Example Scanners |
|---|---|---|---|---|
| **Intraday Trader** | Minutes to hours (same day) | 5m, 15m | Gap-up/down, ORB, VWAP Reclaim, Pivot levels, Volume shockers | Gap Up Opening, ORB 15-min, VWAP Reclaim |
| **BTST Trader** | Overnight (1–2 days) | Daily + Intraday confirmation | Momentum breakouts, volume surge, late-day strength | Volume Surge, Momentum Breakout, Delivery Spike |
| **Swing Trader** | 3–14 days | Daily | Consolidation breakout, pullback-to-EMA, divergences, candlestick patterns | Consolidation Breakout, Pullback to 50 EMA, Bullish Engulfing |
| **Positional Investor** | 2 weeks to months | Daily, Monthly | MACD crossovers, Cup & Handle, fundamental screens, 52W highs | MACD Crossover Monthly, Piotroski Score, High ROE |

### 2.2 User Segments (by Upstox relationship)

| Segment | Description | Product Goal |
|---|---|---|
| **Upstox User — Free** | Existing Upstox customer without Plus Pack | Nudge to Plus Pack via gated features (Plus-exclusive scanners, DIY indicator limits, unlimited alerts) |
| **Upstox User — Plus Pack** | Existing customer with active Plus subscription | Monetise via paid Alerts (₹10/day scheduled runs), increase engagement & retention |
| **Non-Upstox User — Organic** | New visitor arriving via SEO, shared scanner links, embedded iframes, or social media | Lead creation (mobile sign-in) → UCC creation → conversion to Upstox trading account |

### 2.3 Skill Level Mapping

| Difficulty Level | Who | Product Experience |
|---|---|---|
| **Beginner** | New to scanning, learning strategies | Pre-built scanners with full education, Quick Scan mode, guided filters |
| **Intermediate** | Knows indicators, wants customisation | DIY builder (Simple mode), marketplace exploration, alert setup |
| **Advanced** | Experienced quant/technical trader | DIY builder (Advanced mode with multi-group, multi-timeframe), AI query input, marketplace publishing |

---

## 3. Scanner Types — Taxonomy

```
Upstox Scanners
├── 1. DIY (Custom) Screener
│     └── User builds conditions from scratch using 100+ indicators
│
├── 2. Pre-Built Scans
│     ├── A. Indicator-Based
│     │     ├── Fundamental Screens (PE, ROE, Promoter buying, etc.)
│     │     ├── Technical Screens (RSI, MACD, Bollinger, Supertrend, etc.)
│     │     └── Options Screens (OI, PCR, Basis — planned)
│     │
│     └── B. Trading Style-Based
│           ├── Intraday (Gap, ORB, VWAP, Pivot)
│           ├── BTST (Momentum, Volume Surge, Delivery Spike)
│           ├── Swing (Breakout, Pullback, Candlestick patterns)
│           └── Positional (MACD Monthly, Cup & Handle, 52W High)
│
└── 3. Marketplace Scanners
      ├── Editor's Choice (curated by Upstox team)
      ├── Popular / Trending (by views, uses, likes)
      └── Community (all published user-created scanners)
```

---

## 4. Module A — DIY Custom Screener

### 4.1 Overview

The DIY (Do-It-Yourself) Screener is the core power feature. Users build stock screening conditions visually, without writing code or formulas. They select indicators, set comparisons, and run scans against a chosen stock universe.

### 4.2 User Flow

```
Choose Universe (Nifty 50/200/500/All)
    ↓
Add Condition(s)
  → Pick indicator from categorised sidebar
  → Choose operator (greater than, crossed above, detected, etc.)
  → Set comparison (fixed value or another indicator)
  → Optional: Add time modifier ("within last 5 bars")
    ↓
Add more conditions or groups (AND/OR logic)
    ↓
Run Scan → View results table
    ↓
Save Screener → Set name, description, visibility (public/private)
    ↓
Optional: Schedule alerts → Choose channels (WhatsApp/Push/Email)
    ↓
Optional: Share or Publish to Marketplace
```

### 4.3 Builder Modes

| Mode | Target User | Description |
|---|---|---|
| **Quick Scan** | Beginners | Pre-filled presets (e.g. "Oversold stocks near support"). One-tap customisation. Mobile-optimised. |
| **Simple (Standard)** | Beginners / Intermediate | Flat condition list. One condition per row. No groups. |
| **Advanced (Classic)** | Advanced traders | Full group-based builder. Multiple groups with independent timeframes. AND/OR connectors between groups. |
| **AI Query** (Planned) | All users | Natural language input → auto-generated conditions. E.g. "Show me Nifty 500 stocks with RSI below 30 and price above 200 EMA" |

### 4.4 Condition Building — What Users See

**Step 1: Pick an Indicator (Left Side)**
Indicators are organised into searchable categories:

| Category | Examples | Status |
|---|---|---|
| Price | Close, Open, High, Low, 52W High/Low, % changes | Available |
| Moving Averages | SMA, EMA, WMA, Hull MA, VWMA, DEMA, TEMA | Available |
| Oscillators | RSI, Stochastic, Williams %R, CCI, MFI | Available |
| MACD | MACD Line, Signal, Histogram | Available |
| Trend | ADX, Parabolic SAR, Ichimoku, Aroon | Available |
| Volatility | Bollinger Bands, ATR, Supertrend, Keltner, Donchian | Available |
| Volume | Volume, OBV, VWAP, Relative Volume, CMF | Available |
| Pivot Levels | Standard Pivots, Camarilla, CPR | Available |
| Setups | EMA/SMA Cross, MACD Cross, Supertrend Flip | Available |
| Divergence | RSI, MACD, Stochastic, OBV, CCI Divergence | Available |
| Candlestick Patterns | 20+ patterns (Engulfing, Hammer, Morning Star, etc.) | Available |
| Fundamentals | PE, ROE, Debt/Equity, Dividend Yield, etc. | Planned (Plus-gated) |
| Futures & Options | OI, PCR, Basis, Calendar Spread | Planned (Plus-gated) |

**Step 2: Choose Operator**

| Operator | Example | When to Use |
|---|---|---|
| is greater than | RSI > 70 | Current value comparison |
| is less than | Close < SMA(200) | Current value comparison |
| crossed above | EMA(9) crossed above EMA(21) | Detect crossover events |
| crossed below | Price crossed below Supertrend | Detect breakdown events |
| is increasing (for N bars) | RSI is increasing for 3 bars | Trend strength check |
| is decreasing (for N bars) | Volume is decreasing for 5 bars | Waning momentum check |
| is between | RSI is between 40 and 60 | Neutral zone filter |
| detected | Bullish Engulfing detected | Pattern presence check |

**Step 3: Set Right Side**
- **Fixed value:** RSI > **30**
- **Another indicator:** Close > **SMA(200)**
- **Indicator with multiplier:** Close > **1.02 × SMA(200)** (i.e. 2% above the SMA)

**Step 4: Optional Time Modifier**

| Modifier | Meaning | Example |
|---|---|---|
| within last N bars | Event happened at any point in last N bars | "EMA cross happened within last 5 bars" |
| exactly N bars ago | Check condition at a specific past bar | "Hammer detected exactly 2 bars ago" |
| for all of last N bars | Condition must hold true for every bar | "Close > SMA(200) for all of last 10 bars" |

### 4.5 Multi-Group Logic (Advanced Mode)

Users can create multiple condition groups. Each group can:
- Have its own **timeframe** (e.g. Group 1 = Daily, Group 2 = 15-min)
- Have its own internal **AND/OR logic**
- Be connected to other groups via **AND/OR**

**Example:**

> Group 1 (Daily, AND): RSI(14) > 30 **AND** Close > SMA(200)
>
> **AND**
>
> Group 2 (15-min, AND): Close crossed above EMA(9) **AND** Volume > 1.5× Volume SMA(20)

This finds stocks that are in a daily uptrend AND just showed a bullish intraday signal.

### 4.6 Results

After running a scan, the user sees a sortable results table:

| Column | Description |
|---|---|
| Symbol | Stock name and ticker |
| Price | Current price (₹) |
| 1D Change % | Today's price change |
| Volume | Today's volume |
| Dynamic columns | Values of the indicators used in conditions (e.g. RSI = 28.4, SMA(200) = ₹1,842) |

### 4.7 Save & Share

After running a scan, users can **Save** the screener:
- **Name & Description** — required
- **Visibility** — Private (default) or Public (published to Marketplace)
- **Schedule** — Optional: set a recurring run time
- **Alerts** — Optional: enable notifications on specified channels
- **Share** — Native share sheet (mobile) or copy link (desktop)

### 4.8 Free vs Plus Gating

| Feature | Free Users | Plus Users |
|---|---|---|
| DIY Screener access | Yes | Yes |
| Maximum saved screeners | 3 | Unlimited |
| Fundamental indicators in DIY | Locked | Unlocked |
| F&O indicators in DIY | Locked | Unlocked |
| Multi-group (Advanced mode) | Limited to 2 groups | Unlimited groups |

---

## 5. Module B — Pre-Built Scanners

### 5.1 Overview

Pre-built scanners are curated, ready-to-run screening strategies designed by the Upstox team. Each scanner is a **learning tool** as much as a **discovery tool** — bundled with education, a trading playbook, and live results.

### 5.2 Organisation

Pre-built scanners are organised along **two axes**:

**Axis 1 — By Trading Style (Persona Tabs)**

| Tab | Scanners Included |
|---|---|
| Intraday | Gap Up/Down, ORB, VWAP Reclaim, Pivot Breakout, Volume Shockers |
| BTST | Momentum Breakout, Volume Surge, Delivery Spike, Supertrend Buy |
| Swing | Consolidation Breakout, Pullback to EMA, Bullish Engulfing, Bollinger Squeeze, Golden Cross |
| Positional | MACD Crossover (Monthly), Cup & Handle, 52W High Zone, High ROE, Piotroski Score |

**Axis 2 — By Sub-Category (within each tab)**

| Sub-Category | Example Scanners |
|---|---|
| Morning Scanners | Gap Up, Gap Down, ORB 15-min |
| Live Momentum | VWAP Reclaim, Volume Surge, Intraday Momentum |
| Pattern Scanners | Bullish Engulfing, Hammer, Morning Star |
| BTST Setups | Late Day Momentum, Delivery Spike |
| Breakout Screens | Consolidation Breakout, 52W High Zone |
| Moving Average Signals | Golden Cross, Death Cross, Pullback to 50 EMA |
| Mean Reversion Screens | RSI Oversold + Support, Bollinger Band Squeeze |
| Institutional Screens | FII Buying, DII Buying, Promoter Buying |
| Value Screens | Low PE, High ROE, Debt Free |
| Dividend Screens | High Dividend Yield |

### 5.3 Scanner Detail Page — Anatomy

Each scanner detail page contains:

| Section | Purpose |
|---|---|
| **Header** | Name, persona badge, difficulty level, last updated, view/run counts |
| **Education Block** | What is this scanner? Why does it work? |
| **Playbook** | Entry rules, Stop-loss placement, Hold duration, Risk:Reward target |
| **Article / Case Study** | Deep-dive educational content (e.g. "How Consolidation Breakouts Work" with embedded TradingView charts showing real examples) |
| **Active Window** | Best time to use this scanner (e.g. "Best: 9:00–10:00 AM" for morning scanners) |
| **Results Table** | Live (or mock) results with rank, symbol, price, change, volume, signal reason |
| **Set Alert** | CTA to schedule recurring runs with notification preferences |
| **Share** | Share scanner link via social or copy link |
| **Customise in DIY** | Opens the scanner's conditions in the DIY builder for modification |

### 5.4 Education & Playbook — Format

Each pre-built scanner includes:

| Field | Example (Gap Up Opening) |
|---|---|
| **What** | "A gap up occurs when a stock opens significantly higher than its previous close due to overnight news, earnings, or broad market momentum." |
| **Why** | "Gap ups show strong buying interest before the market even opens. When volume confirms, these stocks often continue moving in the direction of the gap." |
| **Entry** | "Enter on the first 5-min candle close above the gap-up open price, with volume 2× above average." |
| **Stop Loss** | "Place stop below the opening candle low. Risk no more than 0.5–1% of capital." |
| **Hold Duration** | "Intraday — exit before 3:15 PM or when price hits resistance." |
| **Risk:Reward** | "Aim for 1:2 minimum. Target previous day high or R1 pivot." |

### 5.5 Free vs Plus Gating

| Feature | Free Users | Plus Users |
|---|---|---|
| Access to most pre-built scanners | Yes | Yes |
| Plus-exclusive scanners (e.g. Piotroski Score, Advanced Fundamentals) | Results preview only (blurred/limited rows) | Full access |
| Education & Playbook | Full access | Full access |
| Set alerts on pre-built scanners | Up to 3 alerts | Unlimited |

---

## 6. Module C — Marketplace Scanners

### 6.1 Overview

The Marketplace is a community-driven hub where users can discover, follow, and copy screeners created by other traders. It transforms Upstox Scanners from a tool into a **platform** with network effects.

### 6.2 User Flow

```
Browse Marketplace
  → Filter by: Trending / Editor's Choice / Most Used / New
  → Filter by: Trading style (Intraday/BTST/Swing/Positional)
  → Search by name, description, or tags
    ↓
View Screener Detail
  → See conditions (human-readable summary)
  → See performance stats (hit rate, views, uses, copies)
  → See creator profile (handle, followers, verified badge)
    ↓
Actions:
  → Like the screener (social signal)
  → Follow the creator
  → Copy & Customise in DIY (creates a personal copy)
  → Set Alert on this screener
  → Share screener link
```

### 6.3 Marketplace Sections

| Section | Description |
|---|---|
| **Screener of the Week** | Featured banner — one standout community screener highlighted each week by the editorial team |
| **Editor's Choice** | Curated row of high-quality screeners selected by the Upstox Scanners team |
| **Trending** | Screeners with high recent views/uses |
| **Most Used** | All-time most-used screeners |
| **New** | Recently published screeners |

### 6.4 Screener Card — What's Shown

| Element | Description |
|---|---|
| Name | Screener title |
| Description | Short summary |
| Creator | @handle, avatar, verified badge |
| Tags | Trading style + strategy tags |
| Likes | Heart count (social proof) |
| Views & Uses | How many people viewed/ran this screener |
| Copies | How many copied to their own DIY |
| Performance Badge | "High Accuracy" / "Moderate" / "New" based on historical hit rate |

### 6.5 Creator Profile

Each marketplace creator has a public profile page:

| Section | Content |
|---|---|
| **Profile Header** | Display name, @handle, bio, verified badge, follower count, screener count |
| **Published Screeners** | All public screeners by this creator, sortable by likes/uses/date |
| **Leaderboard Rank** | Creator's position on the community leaderboard |
| **Stats** | Total likes received, total views, total copies |

### 6.6 Creator Incentive System

**Product problem:** What motivates users to create and publish screeners?

| Incentive | Type | Description |
|---|---|---|
| **Public Likes & Views** | Intangible | Social proof and recognition. Like counts displayed prominently on screener cards. |
| **Verified Badge** | Intangible | Awarded to top creators — visible on all their screeners and profile. |
| **Editor's Choice Feature** | Intangible | Screener highlighted on the Marketplace homepage with editorial callout. |
| **Screener of the Week** | Intangible | One screener gets premium banner placement across the platform. |
| **Leaderboard Position** | Intangible | Public ranking of top creators by aggregate engagement (likes, views, copies). |
| **Follower Growth** | Intangible | Creators build a following. Followers get notified when the creator publishes new screeners. |
| **Copy Count as Social Currency** | Intangible | "Used by 2,400 traders" becomes a credibility signal for the creator. |
| **Share Card / OG Image** | Word-of-mouth | Auto-generated shareable image card with screener stats, for posting on Twitter/LinkedIn. |
| **Revenue Share** (Future) | Tangible | If premium marketplace is introduced, creators could earn a share of subscription revenue. |

### 6.7 Marketplace Discoverability

**Product problem:** How do we improve discoverability of marketplace scanners?

| Strategy | Details |
|---|---|
| **Smart Recommendations** | "Based on your trading style (Swing), traders like you also use…" — powered by persona and usage data |
| **Trending / Hot Tags** | Surface currently popular tags (e.g. "Breakout", "Earnings Season", "Bank Nifty") |
| **Related Scanners** | On each scanner detail page, show similar or complementary scanners |
| **Search with Auto-Suggest** | As users type, suggest matching screener names, tags, and creators |
| **Persona-Based Onboarding** | First-time users pick their trading style → marketplace defaults to relevant screeners |
| **Push Notifications** | "New popular screener in your style" — weekly digest of best marketplace additions |
| **SEO Landing Pages** | Each public screener gets its own SEO-optimised URL (e.g. `/marketplace/momentum-breakout-scanner`) |
| **Embeddable Widget** | Marketplace screeners can be embedded on blogs/websites, driving traffic back to the platform |

### 6.8 Social Sharing & Word-of-Mouth

**Product problem:** How do we incentivise users to share published screeners externally?

| Mechanism | Description |
|---|---|
| **One-Tap Share** | Native share sheet (mobile) / copy link (desktop) on every screener |
| **Auto-Generated Share Card** | Rich OG image with screener name, stats (likes, accuracy), creator handle — optimised for Twitter/LinkedIn/WhatsApp |
| **"Share to Unlock" Feature** (Proposed) | Share a screener on social media to unlock a bonus feature (e.g. extra alert slot, extended backtest) |
| **Milestone Notifications** | "Your screener hit 1,000 views! Share it to keep the momentum going." — push creator to share |
| **Referral Code in Share Links** | Track which shares lead to new sign-ups. Reward creators whose shares drive acquisition. |
| **Embed Code / iFrame** | Provide embeddable scanner widget that bloggers/influencers can put on their websites (see Section 9) |
| **Community Leaderboard** | Public leaderboard creates competitive motivation to share and promote own screeners |

---

## 7. Alerts & Scheduled Runs

### 7.1 Overview

Alerts transform scanners from a "check when you remember" tool into a **proactive trading assistant**. Users set up recurring scanner runs and receive notifications when stocks match their conditions.

### 7.2 User Flow

```
Create/Save a Screener (DIY or Pre-built)
    ↓
Enable Alerts
  → Choose schedule: Market Open / Every hour / Custom time / End of Day
  → Choose channels: WhatsApp / Push / Email / Browser
    ↓
Alert runs automatically at scheduled time
    ↓
Notification sent with matching stocks
  → Tap to view full results
  → Tap to open stock in Upstox App (deep link)
```

### 7.3 Alert Channels

| Channel | Description | Status |
|---|---|---|
| **WhatsApp** | Message with top matches | Planned |
| **Push Notification** | Mobile app push | Planned |
| **Email** | Summary email with results | Planned |
| **Browser Notification** | Desktop web push | Planned |
| **In-App** | Alert badge + inbox | Available (UI) |

### 7.4 Alerts Dashboard

The Alerts Dashboard shows:

| Section | Content |
|---|---|
| **Plan Status Bar** | "2 of 3 alerts used (Basic Plan)" with visual progress bar |
| **Active Alerts** | List of all active/paused alerts with scanner name, channels, last triggered time, trigger count |
| **Alert History** | Log of past triggers — which stock, when, at what price |
| **Actions** | Pause/Resume, Edit, Delete for each alert |
| **Upgrade CTA** | "Unlimited with Plus" button for Basic plan users |

### 7.5 Monetisation

| Plan | Alert Limit | Price |
|---|---|---|
| **Free / Basic** | 3 active alerts | Free |
| **Plus Pack** | Unlimited alerts | Included in Plus subscription |
| **Scheduled Runs** (Paid Add-on) | Per-alert, per-day charge | ₹10/day per active scheduled alert |

---

## 8. Mobile Experience — Opportunity Feed

### 8.1 Overview

The mobile experience reimagines scanners as a **feed of trading opportunities** rather than a list of tools. It is designed for the trader who opens their phone in the morning and asks: *"What should I look at today?"*

### 8.2 Components

| Component | Description |
|---|---|
| **Market Pulse Bar** | Top-of-page banner showing Nifty/Sensex/VIX with trend sentiment (Bullish/Bearish/Neutral) |
| **Persona Filter Chips** | Horizontal scroll of trading style chips (Intraday, BTST, Swing, Positional) — filters the entire feed |
| **Hero Opportunity Card** | Large featured card highlighting the top opportunity of the session (e.g. "3 stocks breaking consolidation resistance with 2× volume") |
| **Opportunity Feed** | Scrollable list of opportunities, each showing: stock(s), signal type, signal strength, source scanner |
| **Strong Signal Cards** | High-conviction opportunities highlighted with stronger visual treatment |
| **Community Pick Cards** | Trending marketplace screener surfaced in the feed |
| **Education Inline Cards** | Contextual learning nudge (e.g. "What is ORB? Learn the strategy →") |
| **Toolkit Section** | Quick-access grid: Saved Scanners, DIY Builder, Marketplace, Alerts |
| **DIY CTA** | Sticky bottom pill: "Build My Screener" |

### 8.3 Feed Logic

The feed is generated from:
1. **Pre-built scanner results** — matching stocks from each active scanner
2. **Marketplace trending** — community screeners gaining traction
3. **Time-context** — morning scanners surface early, end-of-day setups surface in the afternoon
4. **Persona** — filtered based on user's selected trading style chip

---

## 9. Embeddable Scanners

### 9.1 Overview

Embeddable Scanners allow anyone — bloggers, financial educators, influencer traders — to embed a live Upstox Scanner widget on their website using a simple iframe or embed code. This serves as both a **user acquisition tool** and a **content marketing asset**.

### 9.2 How It Works

```
Creator publishes a scanner (DIY or Marketplace)
    ↓
"Get Embed Code" option available on the scanner
    ↓
Copy iframe snippet:
  <iframe src="https://scanners.upstox.com/embed/{scanner-id}" 
          width="100%" height="600" frameborder="0" />
    ↓
Paste into blog/website
    ↓
Visitors see live scanner results on the blog
    ↓
CTA inside embed: "Open in Upstox Scanners" → drives traffic to platform
    ↓
Non-logged-in users → mobile sign-in prompt → lead capture
```

### 9.3 Embed Features

| Feature | Description |
|---|---|
| **Live Results** | Embed shows actual scan results (with some delay for non-logged-in users) |
| **Branding** | "Powered by Upstox Scanners" footer with link to platform |
| **CTA** | "Open full scanner" / "Create your own" buttons inside the embed |
| **Responsive** | Works on desktop and mobile blog layouts |
| **Customisation** | Height, theme (light only per brand guidelines), show/hide education section |
| **Lead Capture** | After 2–3 free views, prompt for mobile number sign-in within the embed |

### 9.4 Use Cases

| Scenario | Embed Usage |
|---|---|
| **Finance blogger** writes about "Top 5 Swing Trading Strategies" | Embeds Consolidation Breakout scanner + Pullback to 50 EMA scanner live in the article |
| **YouTube trader** description box | Links to embeddable scanner on their blog or Notion page |
| **Stock market Telegram group** admin | Shares an embeddable link to a community-picked scanner |
| **Financial advisor's website** | Embeds a curated "Value Stocks" scanner on their investment ideas page |

### 9.5 Acquisition Funnel

```
Blog reader sees embedded scanner
    ↓
Clicks "View full results" or "Create your own"
    ↓
Lands on Upstox Scanners (web)
    ↓
Prompted to sign in (mobile OTP)   ← Lead Created
    ↓
Explores platform, creates DIY screener
    ↓
Prompted to open Upstox trading account for alerts & trade execution   ← UCC Created
```

---

## 10. Adoption & Engagement Strategy

### 10.1 Actionable Market Signals (Not Advisory)

The platform provides **signals** — not advice. Each signal includes:
- What was detected (e.g. "Bullish Engulfing + RSI oversold")
- Educational context (what does this mean?)
- Playbook (how have traders historically acted on this?)
- Risk framing (risk:reward, stop-loss level)

This positions Upstox Scanners as a **learning + discovery platform** — just short of advisory.

### 10.2 Learning Strategy + Playbook with Each Scanner

Every pre-built scanner is paired with:

| Component | Purpose |
|---|---|
| **"What" section** | Explains the concept in plain language |
| **"Why" section** | Why this pattern matters in markets |
| **Entry rules** | Clear, non-advisory entry criteria |
| **Stop-loss guidance** | Risk management framework |
| **Hold duration** | Expected holding period |
| **Risk:Reward** | Typical R:R for this setup |
| **Case Study Article** | Real chart examples with TradingView embeds showing historical setups |
| **Active Window** | Best time of day to use this scanner (e.g. "Morning 9:00–10:00 AM") |

### 10.3 Curated Scanners & Personalisation

| Feature | Description |
|---|---|
| **Persona-based organisation** | Scanners grouped by Intraday/BTST/Swing/Positional — user picks their style |
| **"Hot Right Now"** | Dynamically surfaced scanners based on current market conditions (e.g. Volume scanners light up on high-volume days) |
| **Difficulty tagging** | Beginner/Intermediate/Advanced labels help users find appropriate complexity |
| **Curated bundles** | "Morning Trading Kit" (3 scanners for 9:15 AM), "Swing Trader's Toolkit" (5 scanners for daily analysis) |

---

## 11. User Acquisition & Monetisation

### 11.1 Monetisation Model

| Revenue Stream | Mechanism | Price Point | Target Segment |
|---|---|---|---|
| **Plus Pack Upgrade** | Gate Plus-exclusive scanners, unlimited DIY saves, unlimited alerts, advanced indicators (F&O, Fundamentals) | Existing Plus Pack pricing | Free Upstox Users |
| **Scheduled Alerts** | Paid per-alert, per-day scheduled scanner runs with multi-channel notifications | ₹10/day per active alert | Plus Users |
| **Lead → UCC Conversion** | Non-Upstox users sign in via mobile → prompted to open trading account | Trading commission revenue | Non-Upstox Users |

### 11.2 Gating & Upgrade Nudges

**For Non-Plus Upstox Users:**

| Trigger Point | Nudge |
|---|---|
| User tries to access a Plus-exclusive scanner (e.g. Piotroski Score) | Paywall screen: "This scanner is exclusive to Plus. Upgrade to unlock 15+ advanced scanners." with preview of blurred results |
| User tries to save a 4th DIY screener | "You've reached your limit of 3 saved screeners. Upgrade to Plus for unlimited saves." |
| User tries to use Fundamental/F&O indicators in DIY | Locked category in sidebar with "Plus" badge: "Unlock 80+ fundamental and derivatives indicators with Plus." |
| User tries to create a 4th alert | Alert limit bar shows "3/3 used" with "Unlimited with Plus" CTA |
| User on scanner detail page | Subtle inline upsell: "Plus members get scheduled alerts for this scanner." |

**For Non-Upstox Users (Organic Visitors):**

| Trigger Point | Action |
|---|---|
| User tries to run a pre-built scanner | Prompt: "Sign in with your mobile number to see live results" → Lead capture |
| User tries to create a DIY screener | Sign-in wall after adding first condition |
| User tries to save or set alerts | Full sign-in required |
| User views embedded scanner on external blog | After 2–3 views, prompt for mobile sign-in within embed |
| User signs in (mobile OTP) | If not an Upstox customer → CTA: "Open a free Upstox account to trade directly from your scanner results" → UCC creation |

### 11.3 New User Acquisition Channels

| Channel | Strategy |
|---|---|
| **SEO** | Each pre-built scanner and marketplace screener gets an SEO-optimised landing page. Target keywords: "nifty breakout scanner", "RSI oversold stocks today", "swing trading scanner India", etc. |
| **Content Seeding** | Publish articles on the Upstox blog tied to scanner categories: "5 Morning Scanners Every Intraday Trader Needs" — each article links to the actual live scanner. |
| **Organic / Word-of-Mouth** | Marketplace creators share their screeners on Twitter, LinkedIn, YouTube — each share drives traffic back. Auto-generated OG cards make sharing attractive. |
| **Embeddable Scanners** | Finance bloggers embed scanners → their readers become leads → conversion funnel |
| **Social Media** | Share cards with screener results — "Today's Volume Shockers" — posted daily by Upstox social accounts |

---

## 12. Touchpoints & Distribution

### 12.1 Where Scanners Live

| Touchpoint | Experience | Priority |
|---|---|---|
| **Upstox Web** (scanners.upstox.com) | Full experience — Home, Library, DIY, Marketplace, Alerts, Creator Profiles | P0 |
| **Upstox App** (Mobile) | Mobile-first Opportunity Feed + Quick Scan + Pre-built Library + Alert Management | P0 |
| **Upstox Pro Web** | Integrated scanner panel within the trading terminal — results link directly to order placement | P1 |
| **Embeddable iFrame** | Standalone scanner widget for third-party blogs/websites | P1 |
| **SEO Landing Pages** | Individual scanner pages optimised for search engines | P1 |

### 12.2 Cross-Touchpoint Flows

| Flow | Description |
|---|---|
| **Web → App** | User creates a DIY screener on web → sets alert → receives push notification on App → taps to view results → places trade in Upstox App |
| **Embed → Web → App** | Blog reader sees embedded scanner → clicks "Open in Upstox" → signs in on web → downloads app for alerts |
| **App → Pro Web** | User discovers a stock via mobile opportunity feed → opens it in Pro Web for detailed charting + order placement |
| **SEO → Web** | Google search "RSI oversold stocks India" → lands on pre-built scanner SEO page → runs scanner → signs in |

---

## 13. User Stories & Use Cases

### 13.1 DIY Screener User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| D1 | Swing trader | Build a screener with RSI < 30 AND Close > SMA(200) on Daily timeframe | I can find oversold stocks in an uptrend — mean reversion candidates |
| D2 | Intraday trader | Create a scanner that checks EMA(9) crossed above EMA(21) within last 3 bars on 15-min timeframe | I can spot fresh intraday momentum entries |
| D3 | Positional investor | Combine Daily conditions (Close > SMA(200)) with 15-min conditions (Volume > 2× average) in separate groups | I can find long-term uptrend stocks showing sudden intraday volume interest |
| D4 | Beginner trader | Use Quick Scan with a pre-set "Oversold Near Support" template | I can get started without knowing which indicators to pick |
| D5 | Any user | Save my screener with a name and description | I can reuse it tomorrow without rebuilding |
| D6 | Advanced trader | Publish my screener to the Marketplace as public | Other traders can benefit from my strategy and I get recognition |
| D7 | Any user | Share my screener via WhatsApp/Twitter with an auto-generated preview card | I can show my friends what I built |
| D8 | Free user trying to add a Fundamental indicator | See a clear upgrade prompt explaining what I get with Plus | I understand the value proposition and can decide to upgrade |
| D9 | Any user | Use natural language like "Show me Nifty 500 stocks with Bullish Engulfing near 200 EMA" | The AI generates the conditions for me and I can fine-tune them |
| D10 | Trader comparing indicators | See a side panel comparing my selected indicator's parameters and behavior | I can make informed decisions about which indicator configuration to use |

### 13.2 Pre-Built Scanner User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| P1 | Intraday trader opening my trading day | See "Morning Scanners" (Gap Up, ORB, VWAP Reclaim) at 9:15 AM | I know which stocks to watch for the first hour |
| P2 | Beginner who found the "Bullish Engulfing" scanner | Read the education block explaining what a Bullish Engulfing is, why it works, entry rules, stop-loss, and risk:reward | I learn the strategy while seeing real results — learning by doing |
| P3 | Swing trader | Browse scanners filtered by "Swing" persona and "Breakout Screens" sub-category | I quickly find scanners relevant to my trading style without scrolling through everything |
| P4 | Plus user | Run the "Piotroski Score" scanner and see full results | I have access to advanced fundamental screening that free users cannot access |
| P5 | Free user clicking on "Piotroski Score" | See a preview of blurred results with a clear "Upgrade to Plus" CTA | I understand what I'm missing and can decide to upgrade |
| P6 | Any user | See the "Active Window" label (e.g. "Best: 9:00–10:00 AM") on each scanner | I know when this scanner is most effective during the trading day |
| P7 | User who liked a pre-built scanner | Set an alert so it runs automatically at market open and sends me a WhatsApp message | I don't have to remember to check every morning |
| P8 | Any user | Read a case study article with real chart examples for "Consolidation Breakout" | I understand the pattern deeply, not just the scan results |
| P9 | Any user | Click "Customise in DIY" on a pre-built scanner | I can modify the conditions (e.g. change RSI threshold from 30 to 25) and save my version |
| P10 | Trader browsing scanners | See the "Hot Right Now" section showing scanners relevant to today's market conditions | I focus on what matters today, not a static list |

### 13.3 Marketplace User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| M1 | Trader exploring strategies | Browse the Marketplace filtered by "Trending" and "Swing" trading style | I discover popular strategies that other swing traders are using successfully |
| M2 | User on marketplace detail page | See the creator's profile, follower count, and verified status | I can assess the credibility of the person who built this screener |
| M3 | User who likes a community screener | Like it and follow the creator | I support good work and get notified when they publish new screeners |
| M4 | User who wants to use a community screener | Click "Copy & Customise in DIY" to create my own editable version | I can tweak the conditions to match my risk appetite without affecting the original |
| M5 | Creator who published a popular screener | See my like count, view count, copy count, and leaderboard position | I feel recognized and motivated to create more |
| M6 | Creator whose screener hit 1,000 views | Receive a push notification congratulating me with a "Share your screener" CTA | I'm motivated to share on social media, bringing new users to the platform |
| M7 | Finance blogger | Get an embed code (iframe) for a popular marketplace screener | I can embed a live scanner in my blog article about swing trading |
| M8 | Any user | Search for marketplace screeners by name, tag, or strategy keyword | I can find exactly what I'm looking for quickly |
| M9 | New user landing on the platform | See "Editor's Choice" screeners prominently featured | I trust the quality and start exploring without decision paralysis |
| M10 | Creator | See "Screener of the Week" banner featuring my screener | I get maximum visibility and a spike in followers |

### 13.4 Alerts User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| A1 | Intraday trader | Set an alert on "Gap Up Opening" scanner to run at 9:20 AM every trading day | I receive a push/WhatsApp notification with today's gap-up stocks every morning — no manual checking |
| A2 | Swing trader | Set an alert on my custom DIY screener to run at 3:30 PM daily | I get end-of-day scan results to plan tomorrow's trades |
| A3 | User on the Alerts Dashboard | See all my active alerts with their last trigger time and trigger count | I know which alerts are working and which need tuning |
| A4 | User who is getting too many alerts | Pause an alert temporarily without deleting it | I can resume it later when market conditions change |
| A5 | Free user who has used 3/3 alert slots | See a clear "Upgrade to Plus for unlimited alerts" prompt | I understand why I can't add more and have a clear path to upgrade |
| A6 | Any user | View alert trigger history showing which stocks matched, when, and at what price | I can review past signals and evaluate the screener's effectiveness |
| A7 | Plus user | Have no limit on active alerts | I can monitor multiple strategies simultaneously |
| A8 | User setting up an alert | Choose which days of the week the alert should run | I don't get alerts on weekends or on days I'm not trading |

### 13.5 Mobile Opportunity Feed User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| F1 | Trader opening the app in the morning | See a "Market Pulse" bar showing Nifty, Bank Nifty, and VIX direction | I immediately know the market sentiment before diving into specific stocks |
| F2 | Intraday trader | Tap the "Intraday" chip on the persona filter | The feed shows me only intraday-relevant opportunities (gap-ups, ORBs, momentum) |
| F3 | Any user | See a "Hero Opportunity Card" highlighting the top trading opportunity right now | I don't have to scroll — the most important signal is front and centre |
| F4 | User scrolling the feed | See strong signal cards with higher visual prominence | I can distinguish high-conviction opportunities from routine signals |
| F5 | Beginner | See "Education Inline Cards" in the feed explaining what ORB or VWAP means | I learn strategies in context, right alongside the trading opportunities |
| F6 | Any user | Tap on an opportunity card to see the underlying scanner's results | I go from signal → full analysis in one tap |
| F7 | Any user | See a "Community Pick" card in the feed showing a trending marketplace screener | I discover community content organically while browsing opportunities |
| F8 | User at the bottom of the feed | See a Toolkit section with quick links to Saved Scanners, DIY, Marketplace, Alerts | I can navigate to any major feature without going back to the main menu |
| F9 | Any user | See a sticky bottom pill "Build My Screener" | I'm always one tap away from creating my own custom scan |

### 13.6 Embed & Share User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| E1 | Finance blogger | Get an embeddable iframe code for the "Consolidation Breakout" scanner | I can put a live scanner in my article, adding interactive value for my readers |
| E2 | Blog reader (non-Upstox user) | See live scanner results in the embedded widget | I get immediate value without leaving the blog |
| E3 | Blog reader who wants more | Click "Open in Upstox Scanners" inside the embed | I land on the full platform and can explore more scanners |
| E4 | Blog reader who clicked through | Be prompted to sign in with my mobile number | Upstox captures my lead for future conversion |
| E5 | Marketplace creator | Copy a share link with an auto-generated preview card (OG image) | When I paste this link on Twitter or WhatsApp, it shows a rich card with my screener stats |
| E6 | Any user | Share a pre-built scanner link via the native share sheet on mobile | I can quickly send it to a friend via any app on my phone |
| E7 | Telegram group admin | Share an embeddable scanner link in my group | Group members can view live results without needing an Upstox account (initially) |

### 13.7 Acquisition & Monetisation User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| X1 | Non-Upstox user landing via Google search for "RSI oversold stocks India" | See an SEO-optimised scanner page with real results | I get immediate value and am motivated to explore the platform |
| X2 | Non-Upstox user who signed in via mobile OTP | Be prompted to open a free Upstox trading account | I can trade directly from scanner results |
| X3 | Free Upstox user | Understand exactly which features unlock with Plus at every gating point | I make an informed upgrade decision |
| X4 | Plus user who set 5 scheduled alerts | See the daily charge of ₹10/alert clearly before confirming | I understand the cost and can decide how many alerts are worth paying for |
| X5 | Upstox business team | Have scanner usage as a retention metric (DAU, scanners run/day, alerts set) | We can measure whether Scanners improves Upstox Plus retention |
| X6 | SEO/Marketing team | Have unique, keyword-rich URLs for every pre-built and marketplace scanner | Each scanner becomes a search-discoverable landing page driving organic traffic |

---

## 14. Open Product Questions

These are product decisions that need resolution with stakeholders:

| # | Question | Options / Considerations |
|---|---|---|
| 1 | **At what point do we require sign-in for non-Upstox users?** | a) When they try to run any scanner, b) After viewing 2–3 scanner results, c) When they try to save/alert, d) Different thresholds for pre-built vs DIY |
| 2 | **Should marketplace creators get any tangible incentive (e.g. revenue share, credits)?** | Likes/views/badges may be enough initially. Revenue share could come in a "Premium Marketplace" phase where creators charge for access. |
| 3 | **What is the right daily pricing for scheduled alerts?** | ₹10/day is proposed. Need to validate willingness-to-pay. Consider weekly/monthly bundles. |
| 4 | **Should embeddable scanners show real-time or delayed data?** | Real-time for logged-in users; 15-min delay for anonymous visitors (aligns with exchange data licensing). |
| 5 | **How do we handle scanner quality in the marketplace?** | Options: a) Manual curation/approval, b) Algorithmic quality score (min likes + views threshold), c) Community reporting + moderation. |
| 6 | **Should we allow "private marketplace" for paid communities?** | Influencers/educators could create screener bundles for their subscribers. This could be a future premium feature. |
| 7 | **How does Plus pack subscription interact with scanner-specific monetisation?** | Alerts as an add-on (₹10/day) vs. baked into a higher Plus tier. Need pricing strategy alignment. |
| 8 | **What is the maximum number of conditions/groups for free users in DIY?** | Proposed: 3 saved screeners, 2 groups max. Need to validate if this provides enough value to retain users while driving upgrades. |
| 9 | **How do we handle non-market-hours usage?** | Show last-scanned results with timestamp, or run against previous day's data with a clear label. |
| 10 | **Should the mobile opportunity feed replace the current Upstox app home, or be a separate tab?** | Separate tab initially. Could become a "Markets" tab component in future. |

---

## 15. Success Metrics

### 15.1 North Star Metric

**Weekly Active Scanner Users (WASU):** Number of unique users who run at least one scanner (DIY or Pre-built) per week.

### 15.2 Funnel Metrics

| Stage | Metric | Target (6 months) |
|---|---|---|
| **Awareness** | SEO landing page visits / month | 500K+ |
| **Acquisition** | New sign-ups (mobile OTP) via scanners | 50K+ / month |
| **Activation** | Users who run their first scan within first session | 70% of sign-ups |
| **Engagement** | Average scans per user per week | 5+ |
| **Retention** | D7 retention of scanner users | 40%+ |
| **Monetisation** | Plus Pack upgrades attributed to scanners | 5% of free scanner users |
| **Monetisation** | Paid alert subscriptions (₹10/day) | 10% of Plus users |

### 15.3 Feature-Specific Metrics

| Feature | Metric |
|---|---|
| **DIY** | Screeners created / week, % saved, % published to marketplace |
| **Pre-built** | Most popular scanners by runs, education read-through rate |
| **Marketplace** | Screeners published / week, avg likes/screener, copy rate, creator retention |
| **Alerts** | Alerts created / week, alert-to-trade conversion rate, WhatsApp opt-in rate |
| **Embeds** | Embed code copies / week, traffic from embeds, lead conversion from embeds |
| **Mobile Feed** | Feed scroll depth, opportunity card tap rate, scanner open rate from feed |

### 15.4 Business Metrics

| Metric | Description |
|---|---|
| **UCC creation from scanners** | Non-Upstox users who create trading accounts after using scanners |
| **Plus conversion from scanners** | Free users who upgrade to Plus after hitting a scanner paywall |
| **Revenue from alerts** | Total ₹10/day alert subscriptions |
| **Scanner-driven trading volume** | Trades placed within 30 minutes of viewing scanner results (via deep link tracking) |
| **Organic traffic share** | % of scanner traffic from SEO vs direct vs referral |

---

*End of Document*
