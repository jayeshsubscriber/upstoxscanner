# Upstox Scanners — Product Requirements Document

**Version:** 1.0
**Date:** 2 April 2026
**Author:** Product Management
**Audience:** Design, Product, Marketing, Business, Leadership
**Status:** Draft

---

## Table of Contents

1. [Product Vision & Positioning](#1-product-vision--positioning)
2. [Target Users & Personas](#2-target-users--personas)
3. [Scanner Taxonomy](#3-scanner-taxonomy)
4. [Module A: DIY Custom Screener](#4-module-a-diy-custom-screener)
5. [Module B: Pre-Built Scanners](#5-module-b-pre-built-scanners)
6. [Module C: Marketplace](#6-module-c-marketplace)
7. [Module D: Alerts & Scheduled Runs](#7-module-d-alerts--scheduled-runs)
8. [Module E: Mobile Opportunity Feed](#8-module-e-mobile-opportunity-feed)
9. [Module F: Embeddable Scanners](#9-module-f-embeddable-scanners)
10. [User Stories & Use Cases](#10-user-stories--use-cases)
11. [Adoption & Engagement Strategy](#11-adoption--engagement-strategy)
12. [User Acquisition & Monetisation](#12-user-acquisition--monetisation)
13. [Touchpoints & Distribution](#13-touchpoints--distribution)
14. [Open Product Questions](#14-open-product-questions)
15. [Success Metrics](#15-success-metrics)
16. [Appendix: Indicator Catalogue](#16-appendix-indicator-catalogue)

---

## 1. Product Vision & Positioning

### 1.1 Vision

Build the most comprehensive, beginner-friendly yet powerful stock scanner platform for Indian equity markets. Help every trader — from someone opening their first demat account to a full-time professional — discover actionable trading and investment opportunities using technical, fundamental, and derivatives-based screening.

**One-liner:** *"From signal to trade — your daily market edge."*

### 1.2 Why Scanners?

| Problem Traders Face | How Scanners Solve It |
|---|---|
| "I don't know where to look each morning." | Pre-built morning scanners surface gap-ups, ORBs, volume shockers — ready at 9:15 AM |
| "I learned a strategy on YouTube but can't find stocks that match." | Each pre-built scanner is a mini-course: strategy playbook + live results. Learn by doing. |
| "Building custom screens is too complex." | Visual condition builder with 300+ indicators. No code, no formulas, no Excel. |
| "I built a great screener but no one sees it." | Marketplace lets creators publish screeners, earn recognition, grow a following. |
| "I forget to check my scanners every morning." | Scheduled runs + multi-channel alerts (WhatsApp, Push, Email) convert scans into automatic daily signals. |
| "I want to share a strategy on my blog/channel." | Embeddable iframe widget lets anyone put a live scanner on their website. |

### 1.3 Core Principles

1. **Actionable, not advisory.** Show signals, education, and context. Never give buy/sell recommendations. Every scanner result is accompanied by "Why this stock matched" — not "Buy this stock."
2. **Learn by doing.** Every pre-built scanner is a micro-course. Strategy explanation + trading playbook + live results. Users absorb strategies while seeing them in action.
3. **Beginner-first, pro-capable.** Simple entry points (Quick Scan, Pre-builts) for day-one users. Full depth (multi-group, multi-timeframe, AI query) for advanced traders.
4. **Community flywheel.** Users create screeners, publish them, get likes and views, share externally, attract new users, who become new creators. The product grows itself.
5. **Embedded everywhere.** Scanners should live wherever traders are: Upstox App, Web, Pro Web, third-party blogs and websites (via embeds), and social media (via share cards).

---

## 2. Target Users & Personas

### 2.1 Trading Style Personas

These personas define how scanner content is organised, filtered, and recommended across the platform.

| Persona | Holding Period | Typical Timeframe | What They Scan For | Example Scanners |
|---|---|---|---|---|
| **Intraday Trader** | Minutes to hours (same day exit) | 5m, 15m | Gap-ups/downs, ORB setups, VWAP reclaims, pivot breakouts, volume shockers | Gap Up Opening, ORB 15-min, VWAP Reclaim, Pivot Point Breakout |
| **BTST Trader** | Overnight (1-2 days) | Daily + intraday confirmation | Late-day momentum, closing range breakouts, volume surges, delivery spikes | 3:25 PM Momentum, Closing Range Breakout, NR7 Breakout |
| **Swing Trader** | 3-14 days | Daily | Consolidation breakouts, pullbacks to key EMAs, candlestick reversal patterns, divergences | Consolidation Breakout, Pullback to 50 EMA, Bullish Engulfing, Bollinger Squeeze |
| **Positional Investor** | 2 weeks to several months | Daily, Weekly, Monthly | MACD crossovers, 52-week highs, moving average golden crosses, fundamental quality | MACD Crossover Monthly, 52W High Zone, Golden Crossover |
| **Long-Term Investor** | Months to years | Monthly, Quarterly fundamentals | High ROE, low debt, consistent compounders, dividend aristocrats, Piotroski scores | Coffee Can Portfolio, Piotroski Score 9, Dividend Aristocrats, PEG < 1 |

### 2.2 User Segments (by Upstox Relationship)

| Segment | Who They Are | Product Goal | Key Metrics |
|---|---|---|---|
| **Non-Upstox User (Organic Visitor)** | New visitor arriving via Google search, shared scanner link, embedded iframe, or social media | **Lead creation** (mobile sign-in via OTP) then **UCC creation** (open Upstox trading account) | Sign-ups, OTP completions, UCC conversions |
| **Upstox User — Free (No Plus Pack)** | Existing Upstox customer without Plus subscription | **Nudge to Plus Pack** via gated features: Plus-exclusive scanners, limited DIY saves (max 3), restricted indicators, limited alerts (max 3) | Plus upgrade rate, feature gate hit rate |
| **Upstox User — Plus Pack** | Active Plus subscriber | **Monetise via paid Alerts** (Rs 10/day per scheduled alert), increase engagement and retention, reduce Plus churn | Alert subscriptions, scans/week, retention |

### 2.3 Lead Creation Trigger Points — When to Require Sign-In

For non-Upstox organic visitors, these are the key moments to capture a lead (mobile number via OTP):

| Trigger Point | Rationale |
|---|---|
| Trying to **run a pre-built scanner** (see live results) | The results are the core value — gating here captures intent |
| Adding the **first condition in DIY builder** and hitting "Run" | They've invested effort in building — high intent moment |
| Trying to **save or set an alert** on any scanner | Save/alert = repeat user intent — strong lead signal |
| Viewing **3+ scanner result pages** on pre-built scanners | Browsing pattern suggests genuine interest |
| Clicking "**Open in Upstox Scanners**" from an embedded widget | They came from external content — capture before they leave |
| After **2-3 free views** of an embedded scanner on a blog | Gradual gate on embedded content |

### 2.4 UCC Creation — When to Prompt Account Opening

After a non-Upstox user signs in via mobile OTP:

| Trigger Point | CTA |
|---|---|
| User views scanner results with a "Trade" button | "Open a free Upstox account to trade directly from scanner results" |
| User tries to place a trade from scanner results | Deep-link to Upstox account opening flow |
| User sets an alert and receives first notification | "Trade this signal — open your Upstox account" in the notification |
| First session after sign-in | Welcome modal with "Complete your trading account" CTA |

### 2.5 Skill Level Mapping

| Level | Who | What They See |
|---|---|---|
| **Beginner** | New to scanning, learning strategies | Pre-built scanners with full education, Quick Scan mode, guided filters, difficulty badges |
| **Intermediate** | Knows indicators, wants customisation | DIY builder (Simple mode), marketplace exploration, alert setup |
| **Advanced** | Experienced quant/technical trader | DIY builder (Advanced multi-group, multi-timeframe), AI query input, marketplace publishing |

---

## 3. Scanner Taxonomy

```
Upstox Scanners
│
├── 1. DIY (Custom) Screener
│     ├── Quick Scan (pre-filled templates for beginners)
│     ├── Simple Mode (flat condition list)
│     ├── Advanced Mode (multi-group, multi-timeframe)
│     └── AI Query (natural language to conditions)
│
├── 2. Pre-Built Scans
│     │
│     ├── A. By Indicator Type
│     │     ├── Technical Screens (RSI, MACD, Bollinger, Supertrend, etc.)
│     │     ├── Fundamental Screens (PE, ROE, Debt/Equity, Piotroski, etc.)
│     │     └── Options Screens (Open Interest, PCR, Basis — planned)
│     │
│     └── B. By Trading Style
│           ├── Intraday (Gap Up/Down, ORB, VWAP, Pivot, Volume Shockers)
│           ├── BTST (Closing Range Breakout, 3:25 PM Momentum, NR7)
│           ├── Swing (Consolidation Breakout, Pullback, Golden Cross, Darvas Box)
│           ├── Positional (52W High, MACD Monthly, Sector Rotation)
│           └── Long-Term (Coffee Can, Piotroski, Dividend Aristocrats, PEG < 1)
│
└── 3. Marketplace Scanners
      ├── Editor's Choice (curated by Upstox editorial team)
      ├── Screener of the Week (featured banner placement)
      ├── Trending (high recent views/uses)
      ├── Most Used (all-time top screeners)
      ├── New (recently published)
      └── Community (all public user-created screeners)
```

### 3.1 Pre-Built Scanner Sub-Categories

**Intraday:**
- Morning Scanners: Gap Up Opening, Gap Down Opening, ORB 15-min, Open = High, Open = Low, First 15-min Volume Shockers
- Live Momentum: Volume Shockers, VWAP Reclaim, RSI Overbought/Oversold, Intraday EMA Alignment
- Pattern Setups: Bullish Engulfing, Inside Bar Breakout, Pivot Point Breakout

**BTST:**
- Closing Range Breakout (CRB), 3:25 PM Momentum, Above All Key EMAs at Close, NR7 Breakout, Strong Close Near Day High

**Swing:**
- Breakout & Momentum: 52W High, Consolidation Breakout, Golden Crossover, Death Cross, Darvas Box, Stocks Near ATH, Price-Volume Breakout, Moving Average Bounce
- Mean Reversion: RSI Oversold, 200 DMA Support Zone, Bollinger Band Lower Band, Bullish Divergence
- Sector & Relative Strength: Sector Rotation Leaders, FII/DII Buying, Outperformers vs Nifty 50

**Long-Term / Positional:**
- Quality: Coffee Can Portfolio (10yr ROCE > 15%, Sales Growth > 10%), Piotroski Score = 9, Consistent Compounders, Bluest of Blue Chips, Magic Formula (high earnings yield + high ROIC)
- Value: Graham's Net-Net, Low PE + High Growth, PEG Ratio < 1, High Promoter Holding + Low Debt
- Dividend: Dividend Aristocrats (5+ yrs consistent payouts), High Dividend Yield (> 4%), Dividend + Low Debt
- Turnaround: Loss to Profit, Debt Reduction Champions, Capacity Expansion, Promoter Buying
- Thematic: FII Heavy Buying, Profitable Small Caps, PSU Gems, Defence & Railways, Green Energy/EV

---

## 4. Module A: DIY Custom Screener

### 4.1 Overview

The DIY Screener is the flagship power feature. Users build stock screening conditions visually — no code, no formulas, no Excel. They select indicators from a categorised catalogue, set comparison operators, and run scans against a chosen stock universe. Results stream in real-time with indicator values and signal explanations.

### 4.2 User Flow

```
Choose Universe (Nifty 50 / Nifty 200 / Nifty 500 / All NSE)
    ↓
Add Condition(s)
  → Pick indicator from categorised sidebar (300+ indicators)
  → Choose operator (greater than, crossed above, detected, etc.)
  → Set comparison (fixed value OR another indicator)
  → Optional: Set parameters (period, lookback, multiplier)
  → Optional: Add time modifier ("within last N bars")
    ↓
Add more conditions or groups (AND / OR logic)
    ↓
Run Scan → Live progress bar → Results stream in
    ↓
Save Screener → Name, description, visibility (public/private)
    ↓
Optional: Schedule alerts → Choose channels + timing
    ↓
Optional: Publish to Marketplace
    ↓
Optional: Share via URL or embed code
```

### 4.3 Builder Modes

| Mode | Target User | Description |
|---|---|---|
| **Quick Scan** | Beginners | Pre-filled strategy templates (e.g. "Oversold stocks near support"). User taps to customise one or two parameters. Mobile-optimised. |
| **Simple (Standard)** | Beginners / Intermediate | Flat condition list. One condition per row. Single group. Single timeframe. |
| **Advanced (Classic)** | Advanced traders | Full group-based builder. Multiple groups with independent timeframes. AND/OR connectors between groups. Unlimited conditions per group. |
| **AI Query** | All users | Natural language input auto-generates conditions. E.g. "Show me Nifty 500 stocks with RSI below 30 and price above 200 EMA." |

### 4.4 Condition Building

**Step 1: Pick an Indicator (Left Side)**

Users select from a searchable, categorised indicator catalogue with 300+ indicators across 12 categories (see Appendix for full catalogue). Key categories:

- Price (Close, Open, 52W High/Low, % from moving averages, Opening Range, Relative Strength)
- Moving Averages (SMA, EMA, WMA, Hull MA, VWMA, DEMA, TEMA)
- Oscillators (RSI, Stochastic, Williams %R, CCI, MFI, KDJ, Ultimate Oscillator)
- MACD (Line, Signal, Histogram)
- Trend (ADX, DI+, DI-, Parabolic SAR, Aroon)
- Volatility (Bollinger Bands, ATR, Supertrend, Keltner Channels, Ichimoku)
- Volume (OBV, VWAP, Volume SMA, Accumulation/Distribution, Relative Volume)
- Pivot Levels (Standard, Camarilla, Woodie, DeMark, Fibonacci)
- Setups (EMA/SMA Cross, MACD Cross, Supertrend Flip)
- Divergence Patterns (RSI Divergence, MACD Divergence, OBV Divergence)
- Candlestick Patterns (20+ patterns: Engulfing, Hammer, Morning Star, Harami, Inside Bar, etc.)
- Fundamentals & Valuation (PE, PB, ROE, Debt/Equity, Dividend Yield, Piotroski Score, Market Cap, etc.)

Each indicator shows:
- Category colour coding
- Customisable parameters (e.g. RSI period = 14)
- "New" badge for recently added indicators
- "Plus" badge for Plus-exclusive indicators

**Step 2: Choose Operator**

| Operator | Example | Use Case |
|---|---|---|
| is greater than | RSI > 70 | Current value comparison |
| is less than | Close < SMA(200) | Current value comparison |
| crossed above | EMA(9) crossed above EMA(21) | Detect crossover events (bullish signals) |
| crossed below | Price crossed below Supertrend | Detect breakdown events (bearish signals) |
| is increasing (for N bars) | RSI increasing for 3 bars | Momentum strength confirmation |
| is decreasing (for N bars) | Volume decreasing for 5 bars | Waning momentum detection |
| is between | RSI between 40 and 60 | Neutral zone / range filter |
| detected | Bullish Engulfing detected | Pattern presence check |

**Step 3: Set Right Side (Comparison)**

- **Fixed value:** RSI > **30**
- **Another indicator:** Close > **SMA(200)**
- **Indicator with multiplier:** Close > **1.02 x SMA(200)** (i.e. 2% above the SMA)

**Step 4: Optional Time Modifier**

| Modifier | Meaning | Example |
|---|---|---|
| within last N bars | Event happened at any point in the last N candles | "EMA cross happened within last 5 bars" |
| exactly N bars ago | Check condition at a specific past candle | "Hammer detected exactly 2 bars ago" |
| for all of last N bars | Condition must hold true on every candle in the range | "Close > SMA(200) for all of last 10 bars" |

### 4.5 Multi-Group Logic (Advanced Mode)

Users create multiple condition groups. Each group can:
- Have its own **timeframe** (e.g. Group 1 = Daily, Group 2 = 15-min)
- Have its own internal **AND/OR logic** between conditions
- Be connected to other groups via **AND/OR**

**Example:**

> **Group 1** (Daily, AND): RSI(14) > 30 AND Close > SMA(200)
>
> **AND**
>
> **Group 2** (15-min, AND): Close crossed above EMA(9) AND Volume > 1.5x Volume SMA(20)

This finds stocks in a daily uptrend that just showed a bullish intraday signal — a classic multi-timeframe confirmation setup.

### 4.6 Scan Execution & Results

**During scan:**
- Live progress bar: "Scanning 142 of 500 stocks..."
- Results stream in as matches are found (no waiting for full completion)
- User can stop scan mid-way and work with partial results

**Results table columns:**
- Symbol (stock name and ticker)
- Price (current price in Rs)
- 1D Change % (today's price change, colour-coded green/red)
- Volume (today's volume with comparison to average)
- Dynamic indicator columns (values of the indicators used in conditions — e.g. RSI = 28.4, SMA(200) = Rs 1,842)
- Signal reason tooltip ("Why this stock?" — explains which conditions matched and exact indicator values)
- Trade button (deep-link to Upstox order placement)

**Sorting:** Results can be sorted by any column (Price, Change%, Volume, indicator values).

### 4.7 Save & Share

After running a scan, users can:

| Action | Details |
|---|---|
| **Save** | Name + description + tags. Saves to user's "My Screeners" list. |
| **Set Visibility** | Private (default) or Public (published to Marketplace) |
| **Schedule Alerts** | Enable recurring runs with notification preferences (see Module D) |
| **Share Link** | Generates a unique URL: `/screeners/@username/my-scanner` |
| **Get Embed Code** | Generates iframe snippet for external websites (see Module F) |

### 4.8 Free vs Plus Gating (DIY)

| Feature | Free Users | Plus Users |
|---|---|---|
| DIY Screener access | Yes | Yes |
| Maximum saved screeners | 3 | Unlimited |
| Fundamental indicators | Locked | Unlocked |
| F&O indicators | Locked | Unlocked |
| Divergence, Ichimoku, Supertrend, CPR indicators | Locked | Unlocked |
| Multi-group (Advanced mode) | Limited to 2 groups | Unlimited groups |
| Universe: Nifty 50/200/500 | Yes | Yes |
| Universe: All NSE (~2000+ stocks) | Locked | Unlocked |

**Upgrade nudge placement:**
- Locked indicator categories show a "Plus" badge in the sidebar with tooltip: "Unlock 80+ advanced indicators with Plus"
- Attempting to save a 4th screener: "You've reached your limit of 3 saved screeners. Upgrade to Plus for unlimited."
- Selecting "All NSE" universe: Lock icon with "Scan the entire NSE with Plus"

---

## 5. Module B: Pre-Built Scanners

### 5.1 Overview

Pre-built scanners are curated, ready-to-run strategies designed by the Upstox team. Each scanner is as much a **learning tool** as a discovery tool. Every scanner is bundled with a strategy playbook and educational content — users learn a strategy while seeing it work in real-time.

### 5.2 Organisation

Pre-built scanners are organised along **two axes**:

**Axis 1 — By Trading Style (Persona Tabs)**

Users filter by: All / Intraday / BTST / Swing / Positional / Long-Term

**Axis 2 — By Sub-Category (within each tab)**

| Sub-Category | Example Scanners |
|---|---|
| Morning Scanners | Gap Up, Gap Down, ORB 15-min |
| Live Momentum | VWAP Reclaim, Volume Surge, Intraday Momentum |
| Pattern Scanners | Bullish Engulfing, Hammer, Inside Bar Breakout |
| BTST Setups | Closing Range Breakout, Late Day Momentum |
| Breakout Screens | Consolidation Breakout, 52W High Zone, Darvas Box |
| Moving Average Signals | Golden Cross, Death Cross, Pullback to 50 EMA |
| Mean Reversion | RSI Oversold + Support, Bollinger Squeeze |
| Institutional Screens | FII Buying, DII Buying, Promoter Buying |
| Value Screens | Low PE, High ROE, Debt-Free, PEG < 1 |
| Dividend Screens | High Dividend Yield, Dividend Aristocrats |
| Quality Screens | Coffee Can, Piotroski Score 9, Consistent Compounders |

### 5.3 Scanner Detail Page — Anatomy

Each scanner detail page has the following sections:

| Section | Purpose |
|---|---|
| **Header** | Scanner name, persona badge (Intraday/Swing/etc.), difficulty level (Beginner/Intermediate/Advanced), last updated timestamp, view count, run count |
| **Active Window** | Best time to use this scanner (e.g. "Best: 9:00-10:00 AM" for morning scanners, "Best: 3:00-3:30 PM" for BTST) |
| **Education Block** | "What is this scanner?" and "Why does it work?" — plain-language explanation of the strategy |
| **Trading Playbook** | Entry rules, Stop-loss placement, Hold duration, Risk:Reward target |
| **Case Study / Article** | Deep-dive educational content with real chart examples (e.g. "How Consolidation Breakouts Work") |
| **Results Table** | Live scan results: rank, symbol, price, change%, volume, signal reason |
| **"Why This Stock?" Tooltip** | Per-row breakdown of exactly which conditions matched with indicator values |
| **Universe Selector** | Choose stock universe (Nifty 50/200/500 free, All NSE for Plus) |
| **Set Alert CTA** | Button to schedule recurring runs with notification channel preferences |
| **Customise in DIY** | Opens the scanner's underlying conditions in the DIY builder for modification |
| **Share** | Share scanner link via native share sheet (mobile) or copy link (desktop) |
| **Embed** | Get iframe embed code for external websites |

### 5.4 Education & Playbook Format

Every pre-built scanner includes a structured education module:

| Field | Example (Gap Up Opening) |
|---|---|
| **What** | "A gap up occurs when a stock opens significantly higher than its previous close due to overnight news, earnings, or broad market momentum." |
| **Why** | "Gap ups show strong buying interest before the market opens. When volume confirms, these stocks often continue moving in the direction of the gap." |
| **Entry** | "Enter on the first 5-min candle close above the gap-up open price, with volume 2x above average." |
| **Stop Loss** | "Place stop below the opening candle low. Risk no more than 0.5-1% of capital." |
| **Hold Duration** | "Intraday — exit before 3:15 PM or when price hits resistance." |
| **Risk:Reward** | "Aim for 1:2 minimum. Target previous day high or R1 pivot." |

### 5.5 Time-Aware Scanners

Scanners have an "active window" — the time of day when they are most relevant. The platform surfaces the right scanners at the right time:

| Scanner Type | Active Window | Behaviour |
|---|---|---|
| Gap Up/Down | 9:00-9:30 AM | Highlighted in morning, dimmed later |
| ORB 15-min | 9:30-10:00 AM | Becomes active after first 15-min candle closes |
| Volume Shockers | 9:15 AM - 3:30 PM | Active throughout market hours |
| BTST Setups | 3:00-3:30 PM | Highlighted in last 30 minutes |
| EOD Screens | After 3:30 PM | Shown for next-day planning |

### 5.6 Free vs Plus Gating (Pre-Built)

| Feature | Free Users | Plus Users |
|---|---|---|
| Access to most pre-built scanners | Yes | Yes |
| Plus-exclusive scanners (Piotroski, Advanced Fundamentals, Institutional) | Education visible, results blurred/limited (top 3 rows only) | Full access |
| Set alerts on pre-built scanners | Up to 3 alerts total | Unlimited |
| "Customise in DIY" | Yes | Yes |

---

## 6. Module C: Marketplace

### 6.1 Overview

The Marketplace is a community-driven hub where users discover, follow, and copy screeners created by other traders. It transforms Upstox Scanners from a tool into a **platform with network effects**. The more screeners created, the more value for everyone.

### 6.2 User Flow

```
Browse Marketplace
  → Filter: Trending / Editor's Choice / Most Used / New
  → Filter: Trading style (Intraday / BTST / Swing / Positional / Long-Term)
  → Search: by screener name, description, tags, or creator handle
    ↓
View Screener Detail
  → See conditions (human-readable summary)
  → See performance stats (hit rate %, views, uses, copies)
  → See creator profile (handle, followers, verified badge, bio)
    ↓
Actions:
  → Like the screener (social signal)
  → Follow the creator (get notified of new screeners)
  → Copy & Customise in DIY (creates an editable personal copy)
  → Set Alert (schedule recurring runs)
  → Share screener link (with auto-generated OG preview card)
```

### 6.3 Marketplace Sections

| Section | Description |
|---|---|
| **Screener of the Week** | Featured banner — one standout community screener highlighted weekly by the editorial team. Maximum visibility placement. |
| **Editor's Choice** | Curated horizontal row of high-quality screeners hand-picked by the Upstox Scanners team. Badge shown on card. |
| **Trending** | Screeners with high recent views, uses, and likes (rolling 7-day window) |
| **Most Used** | All-time most-used screeners (sorted by total runs) |
| **New** | Recently published screeners (reverse chronological) |

### 6.4 Screener Card — What's Shown

Each screener card in the marketplace displays:

| Element | Details |
|---|---|
| Screener name | Title of the screener |
| Description | Short summary (1-2 lines) |
| Creator | @handle, avatar, verified badge (if applicable) |
| Tags | Trading style + strategy tags (e.g. "Swing", "Breakout", "Momentum") |
| Likes | Heart icon + count (social proof) |
| Views & Uses | Eye icon + count, Play icon + count |
| Copies | Copy icon + count (how many people forked this) |
| Performance Badge | "High Accuracy" / "Moderate" / "New" based on historical hit rate |

### 6.5 Marketplace Screener Detail Page

| Section | Content |
|---|---|
| **Creator Card** | Name, @handle, avatar, verified badge, bio, follower count, "Follow" button |
| **Screener Stats** | Likes, views, uses, copies, historical accuracy %, creation date |
| **Conditions Summary** | Human-readable description of the screener's logic |
| **Live Results** | Top 8 matching stocks (run on demand) |
| **Set Alert** | Schedule recurring runs on this screener |
| **Copy Screener** | Creates an editable copy in user's DIY builder |
| **Share** | Copy link with auto-generated OG preview card |
| **Other by Creator** | Sidebar showing other screeners by the same creator |
| **Related Screeners** | Similar or complementary screeners from other creators |

### 6.6 Creator Profile Page

Each marketplace creator has a public profile at `/profile/@username`:

| Section | Content |
|---|---|
| **Profile Header** | Display name, @handle, avatar, bio, verified badge, "Top Creator" badge (if applicable), joined date |
| **Stats** | Total followers, total likes across all screeners, total views, total uses |
| **Screeners Tab** | All published screeners by this creator (sortable by likes/uses/date) |
| **Leaderboard Tab** | Global creator leaderboard ranked by aggregate engagement (likes + views + copies) |
| **Follow/Unfollow** | Button to follow the creator and receive notifications when they publish new screeners |

### 6.7 Creator Incentive System

**Product problem:** What is the user's incentive to create and publish screeners?

| Incentive | Type | Description |
|---|---|---|
| **Public Likes & Views** | Intangible | Social proof and recognition. Like counts displayed prominently on cards and profile. |
| **Verified Badge** | Intangible | Awarded to top creators meeting quality thresholds. Visible on all their screeners and profile. |
| **Editor's Choice Feature** | Intangible | Screener highlighted on Marketplace homepage with editorial callout. Drives massive visibility. |
| **Screener of the Week** | Intangible | Premium banner placement across the entire platform for one week. |
| **Leaderboard Position** | Intangible | Public ranking of top creators. Competitive motivation. "Top Creator" badge for leaders. |
| **Follower Growth** | Intangible | Creators build a following. Followers get notified on new publications. Building an audience is a strong long-term incentive. |
| **Copy Count as Social Currency** | Intangible | "Used by 2,400 traders" becomes a credibility signal. Useful for building personal brand. |
| **Auto-Generated Share Card (OG Image)** | Word-of-mouth | Rich preview card with screener name, stats, creator handle — optimised for Twitter/LinkedIn/WhatsApp sharing. |
| **Milestone Notifications** | Engagement | "Your screener hit 1,000 views!" — nudges creator to share and keep momentum. |
| **Revenue Share** (Future) | Tangible | In a "Premium Marketplace" phase, creators could charge for access to their screeners and earn revenue share. |

### 6.8 Social Sharing & Word-of-Mouth Mechanisms

**Product problem:** How do we nudge users to share published screeners on social media?

| Mechanism | Description |
|---|---|
| **One-Tap Share** | Native share sheet (mobile) / copy link (desktop) on every screener |
| **Auto-Generated OG Card** | Rich preview image with screener name, accuracy badge, creator handle, likes count — designed for social media. When users paste the link on Twitter/LinkedIn/WhatsApp, the card renders automatically. |
| **"Share to Unlock" Feature** (Proposed) | Share a screener externally to unlock a bonus (extra alert slot, extended universe, temporary Plus feature access) |
| **Milestone Notifications** | "Your screener hit 500 views! Share it to keep going." — triggers creator sharing behaviour |
| **Referral Tracking in Share Links** | Each share link includes a referral parameter. Track which shares drive new sign-ups. Reward high-performing sharers. |
| **Embed Code / iFrame** | Bloggers and influencers embed scanners directly on their websites (see Module F) |
| **Community Leaderboard** | Public leaderboard creates competitive motivation. Creators promote their own screeners to climb rankings. |

### 6.9 Marketplace Discoverability

**Product problem:** How do we improve discoverability of marketplace scanners?

| Strategy | Details |
|---|---|
| **Smart Recommendations** | "Based on your style (Swing), traders like you also use..." — powered by persona + usage data |
| **Trending Tags** | Surface currently popular tags (e.g. "Breakout", "Earnings Season", "Bank Nifty") |
| **Related Scanners** | On each scanner detail page, show similar or complementary scanners |
| **Search with Auto-Suggest** | As users type, suggest matching screener names, tags, and creators |
| **Persona-Based Onboarding** | First-time users pick their trading style. Marketplace defaults to relevant screeners. |
| **Weekly Digest Push** | "New popular screener in your style" — weekly notification with best marketplace additions |
| **SEO Landing Pages** | Each public screener gets its own SEO-optimised URL (e.g. `/marketplace/momentum-breakout-scanner`) |
| **Embeddable Widget** | Marketplace screeners can be embedded on blogs — drives traffic back to platform |

---

## 7. Module D: Alerts & Scheduled Runs

### 7.1 Overview

Alerts transform scanners from a "check when you remember" tool into a **proactive trading assistant**. Users set up recurring scanner runs and receive notifications with matching stocks. This is the primary recurring monetisation lever after Plus pack.

### 7.2 User Flow

```
Create/Save a Screener (DIY or Pre-built or Marketplace copy)
    ↓
Click "Set Alert"
  → Choose schedule:
      • Run frequency: Every 1/5/15 minutes (intraday), or specific time of day
      • Run days: All market days, or custom weekdays (Mon-Fri selector)
  → Choose notification channels:
      • WhatsApp (Plus only)
      • Push notification (Plus only)
      • Email (Free)
      • Browser notification (Free)
    ↓
Alert runs automatically at scheduled time
    ↓
Notification sent with matching stocks
  → Tap to view full results
  → Tap stock to open in Upstox App (deep link to trade)
```

### 7.3 Alert Channels

| Channel | Description | Availability |
|---|---|---|
| **Email** | Summary email with top matching stocks and key indicator values | Free |
| **Browser Push** | Desktop web push notification with stock count | Free |
| **WhatsApp** | Message with top matches, price, signal reason | Plus only |
| **App Push Notification** | Mobile push with stock count and top pick | Plus only |
| **In-App Inbox** | Alert badge + inbox list inside the platform | Free |

### 7.4 Alerts Dashboard

The Alerts Dashboard (`/alerts`) is the central hub for managing all alerts:

| Section | Content |
|---|---|
| **Plan Status Bar** | "2 of 3 alerts used (Basic Plan)" with visual progress. Plus users see "Unlimited" |
| **Active Alerts Tab** | List of active/paused alerts showing: scanner name, channels enabled, last triggered time, triggers this week |
| **Alert History Tab** | Chronological log of past 30 triggers — which stocks matched, when, at what price |
| **Per-Alert Actions** | Toggle pause/resume, Edit schedule/channels, Delete |
| **Channel Setup Guide** | Card showing all available channels with setup instructions. Plus-gated channels marked with lock. |
| **Upgrade CTA** | "Unlimited Alerts with Plus" button for Basic plan users |
| **Empty State** | When no alerts set, shows "Browse scanners to set your first alert" with link to scanner library |

### 7.5 Monetisation

| Plan | Alert Limit | Channels | Price |
|---|---|---|---|
| **Free / Basic** | 3 active alerts | Email + Browser Push | Free |
| **Plus Pack** | Unlimited alerts | All channels (WhatsApp, App Push, Email, Browser) | Included in Plus |
| **Scheduled Runs (Paid Add-on)** | Per-alert, per-day charge for automated scheduled runs | All channels | Rs 10/day per active scheduled alert |

---

## 8. Module E: Mobile Opportunity Feed

### 8.1 Overview

The mobile experience reimagines scanners as a **feed of trading opportunities** rather than a list of tools. It answers the trader's morning question: *"What should I look at today?"*

Instead of navigating to individual scanners, the mobile feed aggregates results from all relevant scanners into a single, scrollable, time-contextual stream of signals.

### 8.2 Feed Components

| Component | Description |
|---|---|
| **Market Pulse Bar** (Sticky) | Top-of-screen bar showing: Nifty 50 value + %, Bank Nifty value + %, market mood icon (Bullish/Bearish/Neutral), advancing/declining stocks breadth indicator |
| **Persona Filter Chips** | Horizontal scroll of trading style chips: All / Intraday / BTST / Swing / Positional / Long-Term. Filters the entire feed. |
| **Hero Opportunity Card** | Large featured card showing the single best trade signal right now. Includes: stock symbol, price, change%, volume, source scanner name, signal description, entry/stop-loss/risk-reward from education module, direction indicator (bullish/bearish/neutral). |
| **Opportunity Feed** | Scrollable mixed feed of signal cards (see 8.3) |
| **"Load More Signals"** | Pagination button at the bottom of the current feed batch |
| **Sticky Action Pill** (Bottom) | Always-visible pill at screen bottom for quick access to DIY builder |

### 8.3 Feed Item Types

The opportunity feed is a **mixed feed** combining different card types for engagement and education:

| Card Type | Description | Visual Treatment |
|---|---|---|
| **Strong Signal Card** | High-conviction trade from a popular scanner. Shows stock, price, change%, signal description, scanner source. | Highlighted with accent border/gradient |
| **Regular Opportunity Card** | Standard matched stock from any scanner. | Normal card styling |
| **Education Inline Card** | Contextual learning nudge: "Did you know? Learn about consolidation breakouts." Dismissible. | Distinct styling, dismissible X |
| **Community Pick Card** | Trending marketplace screener by a verified creator. Shows creator name, screener accuracy badge. | Community badge, creator avatar |

### 8.4 Feed Logic

The feed is generated from:
1. **Pre-built scanner results** — matching stocks from active scanners, ordered by signal strength
2. **Marketplace trending** — community screeners gaining traction, surfaced as Community Pick cards
3. **Time-context** — morning scanners surface early (9:00-10:00 AM), BTST setups surface late (3:00-3:30 PM)
4. **Persona filter** — all content filtered by the user's selected trading style chip
5. **Education spacing** — education cards interspersed every 5-7 signal cards for learning reinforcement

### 8.5 Mobile Navigation

| Element | Location | Function |
|---|---|---|
| Market Pulse Bar | Top (sticky) | Live market data at a glance |
| Persona Chips | Below pulse bar | Filter feed by trading style |
| Feed | Main content area | Scrollable opportunity stream |
| Action Pill | Bottom (sticky) | Quick access to DIY builder |

---

## 9. Module F: Embeddable Scanners

### 9.1 Overview

Embeddable Scanners allow anyone — bloggers, financial educators, YouTube traders, Telegram group admins — to embed a live Upstox Scanner widget on their website using a simple iframe code. This serves as both a **user acquisition tool** (drives traffic to the platform) and a **content marketing asset** (makes third-party content more interactive and valuable).

### 9.2 How It Works

```
Creator publishes a scanner (DIY, Pre-built, or Marketplace)
    ↓
"Get Embed Code" option on the scanner detail page
    ↓
Copy iframe snippet:
  <iframe src="https://scanners.upstox.com/embed/{scanner-id}"
          width="100%" height="600" frameborder="0" />
    ↓
Paste into blog / website / Notion page
    ↓
Visitors see live scanner results embedded on the page
    ↓
CTA inside embed: "Open in Upstox Scanners" → drives traffic to platform
    ↓
Non-logged-in users → mobile sign-in prompt → lead capture
```

### 9.3 Embed Widget Features

| Feature | Description |
|---|---|
| **Live Results** | Embed shows actual scan results. Logged-in users get real-time data. Anonymous visitors get 15-min delayed data. |
| **Branding** | "Powered by Upstox Scanners" footer with link to platform |
| **CTA Buttons** | "Open full scanner" and "Create your own" buttons inside the embed |
| **Responsive** | Works on both desktop and mobile blog layouts |
| **Customisation** | Configurable: height, show/hide education section |
| **Lead Capture** | After 2-3 free views, prompt for mobile number sign-in within the embed |
| **Referral Tracking** | Embed includes referral source parameter to track which blogs drive sign-ups |

### 9.4 Embed Use Cases

| Scenario | How the Embed is Used |
|---|---|
| **Finance blogger** writes "Top 5 Swing Trading Strategies" | Embeds Consolidation Breakout + Pullback to 50 EMA scanners live in the article |
| **YouTube trader's** blog or description box | Links to embeddable scanner on their personal site or Notion page |
| **Telegram group** admin | Shares embeddable link so group members see live results |
| **Financial advisor's** website | Embeds a curated "Value Stocks" scanner on their investment ideas page |
| **Stock market course** creator | Embeds scanners in course modules as interactive examples |

### 9.5 Acquisition Funnel via Embeds

```
Blog reader sees embedded scanner widget on a finance article
    ↓
Gets immediate value — sees live scanner results
    ↓
Clicks "View full results" or "Create your own"
    ↓
Lands on Upstox Scanners platform (web)
    ↓
Prompted to sign in with mobile OTP   ← LEAD CREATED
    ↓
Explores platform, creates a DIY screener, saves it
    ↓
Prompted to open Upstox trading account   ← UCC CREATED
    ↓
Sets alerts, trades from scanner results   ← MONETISATION
```

---

## 10. User Stories & Use Cases

### 10.1 DIY Screener User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| D1 | Swing trader | Build a screener with RSI < 30 AND Close > SMA(200) on Daily timeframe | I can find oversold stocks in an uptrend — mean reversion candidates |
| D2 | Intraday trader | Create a scanner that checks EMA(9) crossed above EMA(21) within last 3 bars on 15-min timeframe | I can spot fresh intraday momentum entries |
| D3 | Positional investor | Combine Daily conditions (Close > SMA(200)) with 15-min conditions (Volume > 2x average) in separate groups connected by AND | I can find long-term uptrend stocks showing sudden intraday volume interest (multi-timeframe confirmation) |
| D4 | Beginner trader | Use Quick Scan with a pre-set "Oversold Near Support" template | I can get started without knowing which indicators to pick |
| D5 | Any user | Save my screener with a name, description, and tags | I can reuse it tomorrow without rebuilding from scratch |
| D6 | Advanced trader | Publish my screener to the Marketplace as public | Other traders can benefit from my strategy and I get recognition (likes, views, followers) |
| D7 | Any user | Share my screener via WhatsApp/Twitter with an auto-generated preview card | I can show my friends what I built and attract them to the platform |
| D8 | Free user trying to add a Fundamental indicator in DIY | See a clear, specific upgrade prompt explaining what Plus unlocks | I understand the value and can decide to upgrade |
| D9 | Any user | Use natural language like "Show me Nifty 500 stocks with Bullish Engulfing near 200 EMA" in the AI query box | The system generates conditions for me automatically and I can fine-tune them |
| D10 | Trader comparing indicators | See a side panel showing the actual indicator values for each matched stock | I can make informed decisions about which stocks to investigate further |
| D11 | Any user | Stop a scan mid-way if I already see enough results | I don't have to wait for a full 500-stock scan to finish |
| D12 | User building conditions | Search for an indicator by name in the sidebar | I can quickly find the indicator I need without scrolling through 12 categories |
| D13 | Free user | Scan Nifty 50 and Nifty 500 universes | I get meaningful results even without Plus |
| D14 | Plus user | Scan the entire NSE universe (~2000+ stocks) | I find opportunities across the full market, including small-caps and micro-caps |

### 10.2 Pre-Built Scanner User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| P1 | Intraday trader opening my trading day | See "Morning Scanners" (Gap Up, ORB, VWAP Reclaim) highlighted at 9:15 AM | I know which stocks to watch for the first hour of trading |
| P2 | Beginner who found "Bullish Engulfing" scanner | Read the education block explaining what a Bullish Engulfing is, why it works, entry rules, stop-loss, and risk:reward | I learn the strategy while seeing real results — learning by doing |
| P3 | Swing trader | Browse scanners filtered by "Swing" persona and "Breakout Screens" sub-category | I quickly find relevant scanners without scrolling through everything |
| P4 | Plus user | Run the "Piotroski Score" scanner and see full results with all matched stocks | I access advanced fundamental screening unavailable to free users |
| P5 | Free user clicking on "Piotroski Score" | See the education module in full + a preview of blurred/limited results + a clear "Upgrade to Plus" CTA | I understand what I'm missing and see value in upgrading |
| P6 | Any user | See the "Active Window" label (e.g. "Best: 9:00-10:00 AM") on each scanner | I know when this scanner is most effective during the trading day |
| P7 | User who found a useful pre-built scanner | Set an alert so it runs automatically every morning at 9:20 AM and sends me a WhatsApp message | I don't have to remember to check manually every morning |
| P8 | Any user | Read a case study article with real chart examples for "Consolidation Breakout" | I understand the pattern deeply, beyond just seeing a list of matching stocks |
| P9 | Any user | Click "Customise in DIY" on a pre-built scanner | I can modify conditions (e.g. change RSI threshold from 30 to 25) and save my own version |
| P10 | Trader browsing scanners | See scanners organised by difficulty level (Beginner/Intermediate/Advanced) | I pick scanners appropriate for my skill level |
| P11 | User looking at results | Click "Why this stock?" on a specific result row | I see exactly which conditions matched and the indicator values that triggered the signal |
| P12 | User on scanner results page | Click "Trade" next to a stock | I go directly to Upstox order placement without switching apps |

### 10.3 Marketplace User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| M1 | Trader exploring strategies | Browse the Marketplace filtered by "Trending" + "Swing" trading style | I discover popular strategies that other swing traders are using successfully |
| M2 | User on marketplace detail page | See the creator's profile, follower count, verified status, and total screener stats | I can assess the credibility of the person who built this screener |
| M3 | User who likes a community screener | Like it and follow the creator | I support good work and get notified when they publish new screeners |
| M4 | User who wants to adapt a community screener | Click "Copy & Customise in DIY" to create my own editable version | I can tweak conditions to match my risk appetite without affecting the original |
| M5 | Creator who published a popular screener | See my like count, view count, copy count, and leaderboard position on my profile | I feel recognized and motivated to create more quality screeners |
| M6 | Creator whose screener hit 1,000 views | Receive a push notification congratulating me with a "Share your screener" CTA | I'm motivated to share on social media, which brings new users to the platform |
| M7 | Finance blogger | Get an embed code (iframe) for a popular marketplace screener | I can embed a live scanner in my blog, adding interactive value for my readers |
| M8 | Any user | Search for marketplace screeners by name, tag, or strategy keyword | I can find exactly what I'm looking for quickly |
| M9 | New user landing on the platform | See "Editor's Choice" screeners prominently featured with quality badges | I trust the platform's quality and start exploring without decision paralysis |
| M10 | Creator | See my screener featured as "Screener of the Week" banner | I get maximum visibility and a spike in followers and engagement |
| M11 | Any user browsing a screener | See the historical accuracy / performance badge (High / Moderate / New) | I can judge how well this screener has worked in the past |
| M12 | User on a creator's profile | See a leaderboard of top creators globally | I discover other high-quality creators to follow |

### 10.4 Alerts & Scheduled Runs User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| A1 | Intraday trader | Set an alert on "Gap Up Opening" scanner to run at 9:20 AM every trading day | I receive a WhatsApp notification with today's gap-up stocks every morning — no manual checking needed |
| A2 | Swing trader | Set an alert on my custom DIY screener to run at 3:30 PM daily | I get end-of-day scan results automatically to plan tomorrow's trades |
| A3 | User on the Alerts Dashboard | See all my active alerts with their last trigger time and trigger count this week | I know which alerts are working and which need tuning |
| A4 | User who is getting too many alerts | Pause an alert temporarily without deleting it | I can resume it later when market conditions change |
| A5 | Free user who has used 3/3 alert slots | See a clear "Upgrade to Plus for Unlimited Alerts" prompt with visual progress bar | I understand why I can't add more and have a clear path to upgrade |
| A6 | Any user | View alert trigger history showing which stocks matched, when, and at what price | I can review past signals and evaluate the screener's effectiveness over time |
| A7 | Plus user | Have no limit on the number of active alerts | I can monitor multiple strategies simultaneously across different trading styles |
| A8 | User setting up an alert | Choose which days of the week the alert should run (e.g. only Mon-Fri) | I don't get unnecessary alerts on weekends or holidays |
| A9 | User receiving an alert notification | Tap the notification to see full scanner results immediately | I can act on the signal quickly during market hours |
| A10 | Plus user with scheduled alerts | Understand the per-day pricing (Rs 10/alert/day) before confirming | I can decide how many scheduled alerts are worth the cost |

### 10.5 Mobile Opportunity Feed User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| F1 | Trader opening the app in the morning | See a "Market Pulse" bar showing Nifty, Bank Nifty direction, and advancing/declining breadth | I immediately know the market sentiment before looking at specific stocks |
| F2 | Intraday trader | Tap the "Intraday" chip on the persona filter | The feed shows only intraday-relevant opportunities (gap-ups, ORBs, momentum signals) |
| F3 | Any user | See a "Hero Opportunity Card" highlighting the top trading opportunity right now | I don't have to scroll — the most important signal is front and centre |
| F4 | User scrolling the feed | See "Strong Signal" cards with higher visual prominence than regular cards | I can distinguish high-conviction opportunities from routine matches |
| F5 | Beginner | See "Education Inline Cards" in the feed explaining what ORB or VWAP means | I learn strategies in context, right alongside the actual trading opportunities |
| F6 | Any user | Tap on an opportunity card to see the underlying scanner's full results | I go from signal to full analysis in one tap |
| F7 | Any user | See "Community Pick" cards in the feed showing trending marketplace screeners | I discover community content organically while browsing opportunities |
| F8 | User who doesn't find education cards relevant | Dismiss an education card so it doesn't appear again | My feed stays focused on signals I care about |
| F9 | Any user | See a sticky bottom pill "Build My Screener" | I'm always one tap away from creating my own custom scanner |
| F10 | User at 3:15 PM | See the feed shift to BTST and end-of-day setups | The feed is time-aware and shows me what's relevant right now |

### 10.6 Embeddable Scanner User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| E1 | Finance blogger | Get an embeddable iframe code for the "Consolidation Breakout" scanner | I can put a live, interactive scanner in my article — much more engaging than a static screenshot |
| E2 | Blog reader (non-Upstox user) | See live scanner results in the embedded widget on the blog I'm reading | I get immediate value without leaving the blog |
| E3 | Blog reader who wants more | Click "Open in Upstox Scanners" inside the embed | I land on the full platform to explore more scanners and features |
| E4 | Blog reader who clicked through | Be prompted to sign in with my mobile number | Upstox captures me as a lead for future conversion to a trading account |
| E5 | Marketplace creator | Copy a share link with an auto-generated OG preview card | When I paste this link on Twitter/LinkedIn/WhatsApp, it shows a rich card with my screener stats, driving clicks |
| E6 | Any user on mobile | Share a pre-built scanner via the native share sheet | I can quickly send it to a friend via any app on my phone |
| E7 | Telegram group admin | Share an embeddable scanner link in my community | Group members can view live results without needing an Upstox account (initially) — building trust before sign-up |
| E8 | Stock market course creator | Embed multiple scanners in my course modules | My students interact with live scanners while learning strategies — much better than textbook examples |

### 10.7 User Acquisition & Monetisation User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| X1 | Non-Upstox user landing via Google search for "RSI oversold stocks India" | See an SEO-optimised scanner page with real, useful results | I get immediate value and am motivated to explore the platform further |
| X2 | Non-Upstox user who signed in via mobile OTP | Be prompted to open a free Upstox trading account with a clear value proposition | I can trade directly from scanner results instead of manually switching to another broker |
| X3 | Free Upstox user | See exactly which features unlock with Plus at every gating point | I make an informed upgrade decision based on real usage limitations I've hit |
| X4 | Plus user who wants to set up 5 scheduled alerts | See the daily charge of Rs 10/alert clearly before confirming | I understand the cost and can decide how many alerts are worth paying for |
| X5 | Upstox business team | Track scanner usage as a retention and engagement metric (DAU, scans/day, alerts set) | We can measure whether Scanners improves Plus retention and trading activity |
| X6 | SEO/Marketing team | Have unique, keyword-rich URLs for every pre-built and marketplace scanner | Each scanner becomes a search-discoverable landing page driving organic traffic (e.g. "nifty breakout scanner", "RSI oversold stocks today") |
| X7 | Non-Upstox user arriving from an embedded widget on a blog | Experience a smooth funnel: see results in embed, click to platform, sign in with OTP, explore, prompted to open account | The entire acquisition journey from third-party content to Upstox customer is seamless |
| X8 | Marketplace creator with a large Twitter following | Share my screener link with OG preview card and see new sign-ups attributed to my share | I feel rewarded for driving growth, and Upstox can track organic acquisition channels |

### 10.8 Cross-Platform User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| C1 | User who built a DIY screener on web | See it on my phone in the Upstox App | I can check results on the go without rebuilding |
| C2 | User who received an alert push notification on mobile | Tap to see full results and then tap "Trade" on a stock | I go from notification to trade execution in two taps |
| C3 | Pro Web user | See scanner results integrated into my trading terminal | I can spot opportunities and place orders without switching tabs |
| C4 | User who discovered a stock via the mobile opportunity feed | Open it in Pro Web for detailed charting and order placement | I can do deeper technical analysis before trading |

---

## 11. Adoption & Engagement Strategy

### 11.1 Actionable Market Signals (Not Advisory)

The platform provides **signals** — never advice. Every signal includes:
- What was detected (e.g. "Bullish Engulfing + RSI oversold on Daily")
- Educational context (what does this pattern mean?)
- Historical playbook (how have traders historically acted on this?)
- Risk framing (risk:reward ratio, stop-loss level, hold duration)

This positions Upstox Scanners as a **learning + discovery platform** — actionable and educational, just short of advisory. This is critical for regulatory compliance.

### 11.2 Learning Strategy + Playbook with Every Scanner

Every pre-built scanner is paired with a complete education module:

| Component | Purpose |
|---|---|
| "What" section | Explains the concept in plain language a beginner can understand |
| "Why" section | Why this pattern or setup matters in real markets |
| Entry rules | Clear, non-advisory criteria for when traders typically enter |
| Stop-loss guidance | Risk management framework — where to place a stop and why |
| Hold duration | Expected holding period for this type of setup |
| Risk:Reward | Typical R:R ratio, framed educationally |
| Case Study Article | Real chart examples showing historical setups with annotations |
| Active Window | Best time of day to use this specific scanner |

This "learn by doing" approach means every scan is also a lesson. Users don't just get a list of stocks — they understand **why** those stocks showed up and **what to do** with the information.

### 11.3 Curated Scanners & Personalisation

| Feature | Description |
|---|---|
| **Persona-based organisation** | Scanners grouped by trading style (Intraday/BTST/Swing/Positional/Long-Term). User picks their style once and the platform remembers. |
| **Difficulty tagging** | Beginner/Intermediate/Advanced labels on every scanner. Beginners see simpler scanners first. |
| **Time-aware surfacing** | Morning scanners highlighted at 9:15 AM, BTST setups at 3:00 PM, EOD screens after close. "Hot Right Now" dynamically adapts. |
| **Curated bundles** | "Morning Trading Kit" (3 intraday scanners for market open), "Swing Trader's Toolkit" (5 daily-timeframe scanners). |
| **"Hot Right Now"** | Dynamically surfaced scanners based on current market conditions (e.g. Volume scanners on high-volume days, VIX-based scanners on volatile days). |

### 11.4 Community Flywheel

The Marketplace creates a self-reinforcing growth loop:

```
User creates a quality screener
    ↓
Publishes to Marketplace → gets likes, views, copies
    ↓
Sees engagement → shares on Twitter/LinkedIn/WhatsApp (with OG card)
    ↓
New users arrive via shared link → sign up → explore platform
    ↓
Some new users create their own screeners → publish → cycle continues
```

**Key flywheel accelerators:**
- Auto-generated OG share cards make sharing effortless and attractive
- Milestone notifications ("1,000 views!") nudge creators to share at peak moments
- Leaderboard creates competitive motivation
- Editor's Choice / Screener of the Week gives editorial boost to quality content
- Embed code lets creators put scanners on their own websites, blogs, and courses

---

## 12. User Acquisition & Monetisation

### 12.1 Monetisation Model

| Revenue Stream | Mechanism | Price Point | Target Segment |
|---|---|---|---|
| **Plus Pack Upgrade** | Gate Plus-exclusive scanners, unlimited DIY saves, unlimited alerts, advanced indicators (F&O, Fundamentals, Divergence, Ichimoku), All NSE universe | Existing Plus Pack pricing | Free Upstox Users |
| **Scheduled Alert Add-on** | Paid per-alert, per-day charge for automated scheduled scanner runs with multi-channel notifications | Rs 10/day per active scheduled alert | Plus Users |
| **Lead to UCC Conversion** | Non-Upstox users sign in via mobile OTP, prompted to open free Upstox trading account | Trading commission revenue | Non-Upstox Organic Users |
| **Brokerage Revenue Uplift** | Scanner results link directly to trade execution in Upstox. More signals = more trades. | Per-trade brokerage | All Upstox Users |

### 12.2 Gating & Upgrade Nudges — Non-Plus Upstox Users

| Trigger Point | What the User Sees |
|---|---|
| Accessing a Plus-exclusive scanner (e.g. Piotroski Score) | Education module visible. Results preview with blurred/limited rows (top 3 only). Clear CTA: "This scanner is exclusive to Plus. Upgrade to unlock 15+ advanced scanners." |
| Trying to save a 4th DIY screener | "You've reached your limit of 3 saved screeners. Upgrade to Plus for unlimited saves." |
| Trying to use Fundamental/F&O/Divergence/Ichimoku indicators in DIY | Locked category in indicator sidebar with "Plus" badge. Tooltip: "Unlock 80+ advanced indicators with Plus." |
| Trying to create a 4th alert | Alert limit bar shows "3/3 used" with "Unlimited Alerts with Plus" CTA |
| Trying to scan "All NSE" universe | Lock icon on "All NSE" with "Scan the full market with Plus" |
| Trying to use WhatsApp or App Push notification channels | Channel shown with lock icon. "Get WhatsApp alerts with Plus." |
| On any scanner detail page | Subtle inline upsell: "Plus members get scheduled alerts for this scanner." |

### 12.3 Gating — Non-Upstox Organic Visitors

| Trigger Point | What Happens |
|---|---|
| Trying to run any pre-built scanner | "Sign in with your mobile number to see live results" — OTP sign-in wall |
| Trying to run DIY scan | Sign-in wall after adding conditions and clicking "Run" |
| Trying to save or set alerts | Full sign-in required |
| Viewing embedded scanner on external blog | After 2-3 free views, sign-in prompt within the embed |
| After successful sign-in (if not an Upstox customer) | CTA: "Open a free Upstox account to trade directly from your scanner results" → UCC creation funnel |

### 12.4 New User Acquisition Channels

| Channel | Strategy |
|---|---|
| **SEO** | Every pre-built scanner and marketplace screener gets an SEO-optimised landing page with keyword-rich URL. Target: "nifty breakout scanner", "RSI oversold stocks today", "swing trading scanner India", "intraday stocks today", "gap up stocks today" etc. |
| **Content Seeding** | Publish articles on the Upstox blog tied to scanner categories: "5 Morning Scanners Every Intraday Trader Needs", "How to Use Piotroski Score to Find Quality Stocks". Each article deep-links to the live scanner. |
| **Organic / Word-of-Mouth** | Marketplace creators share screener links on Twitter, LinkedIn, YouTube. Each share drives traffic back. Auto-generated OG cards + referral tracking. |
| **Embeddable Scanners** | Finance bloggers and course creators embed live scanners on their websites. Blog readers become leads. |
| **Social Media** | Daily "Today's Volume Shockers" or "Morning Gap Ups" share cards posted by Upstox social accounts. Link to live scanner page. |

---

## 13. Touchpoints & Distribution

### 13.1 Where Scanners Live

| Touchpoint | Experience | Priority |
|---|---|---|
| **Upstox Web** (scanners.upstox.com) | Full experience: Home, Scanner Library, DIY Builder, Marketplace, Alerts Dashboard, Creator Profiles | P0 |
| **Upstox App** (Mobile) | Mobile-first Opportunity Feed + Quick Scan + Pre-built Library + Alert Management | P0 |
| **Upstox Pro Web** | Integrated scanner panel within the trading terminal. Results link directly to order placement. | P1 |
| **Embeddable iFrame** | Standalone scanner widget for third-party blogs, websites, courses, Notion pages | P1 |
| **SEO Landing Pages** | Individual, keyword-optimised pages per scanner for search engine discovery | P1 |

### 13.2 Cross-Touchpoint Flows

| Flow | Journey |
|---|---|
| **Web to App** | User creates a DIY screener on web → sets alert → receives push notification on app → taps to view results → places trade in Upstox App |
| **Embed to Web to App** | Blog reader sees embedded scanner → clicks "Open in Upstox" → signs in on web → downloads app for alerts and trading |
| **App to Pro Web** | User discovers a stock via mobile opportunity feed → opens it in Pro Web for detailed charting + order placement |
| **SEO to Web** | Google search "RSI oversold stocks India" → lands on pre-built scanner SEO page → runs scanner → signs in → becomes a lead |
| **Social to Web** | User sees OG share card on Twitter → clicks → lands on marketplace screener → signs in → explores platform |

---

## 14. Open Product Questions

These are product decisions that require input from stakeholders:

| # | Question | Options / Considerations |
|---|---|---|
| 1 | **At what point do we require sign-in for non-Upstox users?** | a) When they try to run any scanner, b) After viewing 2-3 scanner results, c) When they save/alert, d) Different thresholds for pre-built vs DIY. Trade-off: Too early = bounce. Too late = missed lead. |
| 2 | **Should marketplace creators get tangible incentives (revenue share, credits)?** | Likes/views/badges may be enough at launch. Revenue share could come in a "Premium Marketplace" phase where creators charge for access. Needs validation of creator motivation. |
| 3 | **What is the right pricing for scheduled alerts?** | Rs 10/day is proposed. Consider: willingness-to-pay validation, weekly/monthly bundles (Rs 49/week, Rs 149/month?), free tier for the first alert. |
| 4 | **Should embeddable scanners show real-time or delayed data?** | Real-time for logged-in Upstox users. 15-min delay for anonymous visitors (aligns with exchange data licensing rules). |
| 5 | **How do we maintain quality in the marketplace?** | Options: a) Manual editorial curation/approval, b) Algorithmic quality score (min likes + views threshold for visibility), c) Community reporting + moderation. Likely a combination. |
| 6 | **Should we allow "private marketplace" for paid communities?** | Influencers/educators create screener bundles for their paid subscribers. Could be a future premium feature with revenue share. |
| 7 | **How does Plus pack interact with alert pricing?** | Alerts at Rs 10/day as an add-on vs. baked into a higher Plus tier. Need pricing strategy alignment with Plus team. |
| 8 | **What are the exact limits for free users in DIY?** | Proposed: 3 saved screeners, 2 groups max, no fundamentals/F&O indicators, Nifty 50/500 only. Need to validate these provide enough value to retain while driving upgrades. |
| 9 | **How do we handle non-market-hours usage?** | Options: Show last-scanned results with timestamp, run against previous day's closing data with clear "as of" label, or show "market closed" state with next-session countdown. |
| 10 | **Should the mobile opportunity feed replace the Upstox app home, or live as a separate tab?** | Separate "Scanners" tab initially. Could become a "Markets" tab component in future if engagement proves strong. |
| 11 | **How do we prevent low-quality screener spam in the marketplace?** | Minimum conditions threshold to publish? Review queue? Automated detection of trivial screeners? |
| 12 | **Should "Share to Unlock" be implemented?** | Pro: drives organic sharing. Con: feels coercive. Need to test user sentiment. Alternative: share earns bonus feature access but isn't required. |

---

## 15. Success Metrics

### 15.1 North Star Metric

**Weekly Active Scanner Users (WASU):** Number of unique users who run at least one scanner (DIY, Pre-built, or Marketplace) per week.

### 15.2 Funnel Metrics

| Stage | Metric | 6-Month Target |
|---|---|---|
| **Awareness** | SEO landing page visits / month | 500K+ |
| **Acquisition** | New sign-ups (mobile OTP) via scanners / month | 50K+ |
| **Activation** | % of sign-ups who run their first scan within first session | 70% |
| **Engagement** | Average scans per active user per week | 5+ |
| **Retention** | D7 retention of scanner users | 40%+ |
| **Monetisation — Plus** | Plus Pack upgrades attributed to scanner feature gates | 5% of free scanner users |
| **Monetisation — Alerts** | Paid alert subscriptions (Rs 10/day) | 10% of Plus users |
| **UCC Conversion** | Non-Upstox sign-ups who open a trading account | 15% of organic leads |

### 15.3 Feature-Specific Metrics

| Feature | Key Metrics |
|---|---|
| **DIY Builder** | Screeners created/week, % saved (vs abandoned), % published to marketplace, avg conditions per screener |
| **Pre-Built Scanners** | Most popular scanners by run count, education section read-through rate, "Customise in DIY" click rate |
| **Marketplace** | Screeners published/week, avg likes/screener, copy rate, creator retention (% who publish 2+ screeners) |
| **Alerts** | Alerts created/week, alert-to-trade conversion rate (alert notification → trade placed within 30 min), WhatsApp opt-in rate |
| **Embeds** | Embed codes copied/week, traffic from embeds, lead conversion rate from embedded widgets |
| **Mobile Feed** | Feed scroll depth, opportunity card tap rate, scanner open rate from feed, time-in-feed per session |

### 15.4 Business Metrics

| Metric | Description |
|---|---|
| **UCC creation from scanners** | Non-Upstox users who create trading accounts after discovering scanners |
| **Plus conversion from scanners** | Free users who upgrade to Plus after hitting a scanner paywall |
| **Alert subscription revenue** | Total Rs 10/day scheduled alert revenue |
| **Scanner-driven trading volume** | Trades placed within 30 minutes of viewing scanner results (tracked via deep links) |
| **Organic traffic share** | % of scanner traffic from SEO vs direct vs referral vs embed |
| **Creator-driven acquisition** | New sign-ups attributable to shared marketplace screener links |
| **Embed-driven acquisition** | New sign-ups attributable to embedded scanner widgets on third-party sites |

---

## 16. Appendix: Indicator Catalogue

### 16.1 Technical Indicators (Available)

| Category | Indicators |
|---|---|
| **Price** (18) | Close, Open, High, Low, Previous Close, Previous High, Previous Low, 52W High, 52W Low, 1D Change %, 5D Change %, 1M Change %, % from SMA, % from EMA, Close Position in Range, Opening Range High, Opening Range Low, Relative Strength vs Nifty/Sector |
| **Moving Averages** (7) | SMA, EMA, WMA, Hull Moving Average, Volume-Weighted MA (VWMA), Double EMA (DEMA), Triple EMA (TEMA) |
| **Oscillators** (10) | RSI, Stochastic %K, Stochastic %D, Stochastic RSI, Williams %R, CCI, MFI, KDJ (K/D/J lines), Ultimate Oscillator |
| **MACD** | MACD Line, Signal Line, Histogram (customisable fast/slow/signal periods) |
| **Trend** (3) | ADX, DI+, DI- |
| **Volatility** (6+) | ATR, Bollinger Bands (Upper/Middle/Lower), Keltner Channels, Supertrend, Ichimoku (Tenkan/Kijun/Senkou A/Senkou B/Chikou) |
| **Volume** (6) | OBV, VWAP, Volume SMA, Accumulation/Distribution, Volume Rate of Change, Relative Volume |
| **Pivot Levels** (4 variants) | Standard Pivots, Camarilla, Woodie, DeMark, Fibonacci — each with S1/S2/S3/R1/R2/R3 levels |
| **Setups** | EMA/SMA Cross, MACD Cross, Supertrend Flip |
| **Divergence** | RSI Divergence (Bullish/Bearish), MACD Divergence (Bullish/Bearish) |
| **Candlestick Patterns** (20+) | Bullish Engulfing, Bearish Engulfing, Hammer, Inverted Hammer, Morning Star, Evening Star, Harami, Inside Bar, Doji, Spinning Top, Marubozu, and more |

### 16.2 Fundamental & Valuation Indicators (70+ items, Plus-gated)

| Namespace | Indicators |
|---|---|
| **Valuation** | PE Ratio, Forward PE, Price-to-Book (PB), Price-to-Sales (PS), Dividend Yield, EV/EBITDA, PEG Ratio |
| **Financial Ratios** | ROE, ROA, ROCE, Debt/Equity, Current Ratio, Quick Ratio, Interest Coverage |
| **Profitability** | Operating Profit Margin, Net Profit Margin, EPS, PAT, EBITDA |
| **Income & Growth** | Sales Growth (QoQ/YoY), Profit Growth, EPS Growth |
| **Balance Sheet** | Total Assets, Current Assets, Total Liabilities, Shareholders' Equity |
| **Cash Flow** | Operating Cash Flow, Free Cash Flow, CFO/PAT |
| **Shareholding** | Promoter Holding %, FII Holding %, DII Holding %, Change in Promoter Holding |
| **Market** | Market Cap, Book Value per Share, Face Value |

### 16.3 Futures & Options Indicators (Planned, Plus-gated)

| Indicator | Description |
|---|---|
| Open Interest (OI) | Total outstanding contracts |
| OI Change % | Change in open interest (buildup/unwinding) |
| Put-Call Ratio (PCR) | Ratio of put OI to call OI |
| Basis | Futures price minus spot price |
| Implied Volatility | Options-derived expected volatility |
| Max Pain | Strike price where options sellers have minimum loss |

---

*End of Document*
