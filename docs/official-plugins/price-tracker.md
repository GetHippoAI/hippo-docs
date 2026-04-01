---
sidebar_position: 3
title: Price Tracker
---

# Price Tracker Plugin

Track product prices across major Turkish e-commerce platforms. Get notified via WhatsApp when prices drop.

## Overview

| Property | Value |
|----------|-------|
| **Slug** | `price-tracker` |
| **Category** | Finance |
| **Author** | Hippo |
| **OAuth Required** | No |
| **Permissions** | `finance:read`, `notifications:send` |

## Features

- Track product prices from major Turkish e-commerce sites
- Automatic price checks at configurable intervals
- WhatsApp notifications on price drops
- Price history tracking
- Multi-product tracking

## Supported Platforms

| Platform | Domain | Status |
|----------|--------|--------|
| Trendyol | trendyol.com | Supported |
| Hepsiburada | hepsiburada.com | Supported |
| N11 | n11.com | Supported |
| Ciceksepeti | ciceksepeti.com | Supported |
| Amazon Turkey | amazon.com.tr | Supported |

## Tools

### `track_price`

Start tracking a product price.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Product URL from a supported platform |
| `targetPrice` | number | No | Target price for notification |
| `notifyOnAnyDrop` | boolean | No | Notify on any price decrease (default: true) |

**Example Usage via WhatsApp:**

> "Track this product: https://www.trendyol.com/..."

> "Tell me when this drops below 500 TL: https://www.hepsiburada.com/..."

> "Watch this iPhone price: https://www.amazon.com.tr/..."

---

### `get_tracked_prices`

View all products you are currently tracking.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeHistory` | boolean | No | Include price history (default: false) |
| `sortBy` | string | No | Sort by: `price`, `name`, `added`, `lastChecked` |

**Example Usage via WhatsApp:**

> "Show me my tracked products"

> "What prices am I tracking?"

> "List my price alerts"

---

### `stop_tracking_price`

Stop tracking a product.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trackingId` | string | Yes | Tracking ID or product URL |

**Example Usage via WhatsApp:**

> "Stop tracking the iPhone"

> "Remove the Trendyol product from tracking"

> "Cancel all price alerts"

## Setup

### Step 1: Install the Plugin

```bash
curl -X POST https://api.gethippo.ai/api/plugins/price-tracker/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grantedPermissions": ["finance:read", "notifications:send"],
    "config": {
      "notifyOnDrop": true,
      "dropThreshold": 5
    }
  }'
```

### Step 2: Configure (Optional)

Update notification preferences:

```bash
curl -X PUT https://api.gethippo.ai/api/plugins/price-tracker/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "notifyOnDrop": true,
      "dropThreshold": 10,
      "checkInterval": "hourly"
    }
  }'
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `notifyOnDrop` | boolean | `true` | Send WhatsApp notification on price drop |
| `dropThreshold` | number | `5` | Minimum % drop to trigger notification |
| `checkInterval` | string | `daily` | Check frequency: `hourly`, `daily`, `weekly` |

## Usage Examples

### Starting Price Tracking

> User: "Track this: https://www.trendyol.com/apple/iphone-15-128gb-p-123456"
>
> Hippo: "I'm now tracking the iPhone 15 128GB from Trendyol.
> - **Current price:** 42,999 TL
> - **Store:** Trendyol
>
> I'll notify you when the price drops."

### Setting Target Price

> User: "Tell me when this drops below 40,000: https://www.hepsiburada.com/iphone-15"
>
> Hippo: "Got it! I'm tracking the iPhone 15 from Hepsiburada.
> - **Current price:** 43,499 TL
> - **Target price:** 40,000 TL
>
> I'll message you as soon as it hits your target."

### Viewing Tracked Products

> User: "What prices am I tracking?"
>
> Hippo: "You're tracking 3 products:
>
> 1. **iPhone 15 128GB** - Trendyol
>    - Current: 42,999 TL
>    - Started: 43,999 TL (3 days ago)
>    - Change: -2.3%
>
> 2. **Samsung Galaxy S24** - Hepsiburada
>    - Current: 38,999 TL
>    - Target: 35,000 TL
>    - Started: 39,499 TL (1 week ago)
>
> 3. **AirPods Pro 2** - Amazon TR
>    - Current: 8,499 TL
>    - Started: 8,499 TL (2 days ago)
>    - No change yet"

### Price Drop Notification

When a price drops, you will receive a WhatsApp message:

> Hippo: "Price drop alert!
>
> **iPhone 15 128GB** on Trendyol just dropped from 42,999 TL to 39,999 TL (-7%)!
>
> [View Product](https://www.trendyol.com/...)"

### Stopping Tracking

> User: "Stop tracking the Samsung"
>
> Hippo: "I've stopped tracking the Samsung Galaxy S24 from Hepsiburada. You can always start tracking it again by sending me the link."

## How It Works

### Price Checking Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Scheduler  │────▶│   Scraper   │────▶│   Compare   │
│  (hourly/   │     │  (fetch     │     │  (check     │
│   daily)    │     │   price)    │     │   drops)    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Notify    │
                                        │  (WhatsApp) │
                                        └─────────────┘
```

1. **Scheduler** runs at the configured interval
2. **Scraper** fetches current price from the product page
3. **Compare** checks if price dropped below threshold
4. **Notify** sends WhatsApp message if conditions are met

### Data Stored

For each tracked product:

| Field | Description |
|-------|-------------|
| `url` | Product URL |
| `name` | Product name |
| `currentPrice` | Latest price |
| `initialPrice` | Price when tracking started |
| `lowestPrice` | Lowest recorded price |
| `targetPrice` | User's target price (if set) |
| `priceHistory` | Array of price/date pairs |
| `lastChecked` | Last check timestamp |

## Supported URL Formats

### Trendyol

```
https://www.trendyol.com/brand/product-name-p-12345678
https://ty.gl/abc123  (short URL)
```

### Hepsiburada

```
https://www.hepsiburada.com/product-name-p-HBCV00001234
https://www.hepsiburada.com/product-name-pm-HBCV00001234
```

### N11

```
https://www.n11.com/urun/product-name-12345678
https://urun.n11.com/category/product-name-12345678
```

### Amazon Turkey

```
https://www.amazon.com.tr/dp/B0ABCDEF12
https://www.amazon.com.tr/product-name/dp/B0ABCDEF12
```

### Ciceksepeti

```
https://www.ciceksepeti.com/product-name-kc12345678
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Unsupported URL" | URL not from supported platform | Use a link from Trendyol, Hepsiburada, N11, Amazon TR, or Ciceksepeti |
| "Product not found" | Invalid or expired product URL | Check if the product page is accessible |
| "Price unavailable" | Product out of stock or page changed | Product may be unavailable; try again later |
| "Already tracking" | Product is already being tracked | Use `get_tracked_prices` to see existing tracking |

## Limitations

- Maximum 20 products can be tracked per user
- Price checks run according to your configured interval
- Some flash sales may not be captured between checks
- Product pages that require login are not supported

## Tips

1. **Set realistic target prices** - Check historical prices on the platform
2. **Use percentage threshold** - A 5-10% drop threshold avoids minor fluctuation alerts
3. **Track during sale seasons** - Best deals during Black Friday, 11.11, and seasonal sales
4. **Check multiple platforms** - Same product may have different prices across stores

## Privacy

- Product URLs and prices are stored to provide the tracking service
- No payment information is collected
- Tracking data is deleted when you uninstall the plugin
