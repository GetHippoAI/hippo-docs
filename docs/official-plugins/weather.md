---
sidebar_position: 4
title: Weather
---

# Weather Plugin

Get current weather conditions and forecasts for any location worldwide.

## Overview

| Property | Value |
|----------|-------|
| **Slug** | `weather` |
| **Category** | Utility |
| **Author** | Hippo |
| **OAuth Required** | No |
| **Permissions** | `location:read` |

## Features

- Current weather conditions (temperature, humidity, wind)
- Multi-day forecasts
- Weather for any city worldwide
- Automatic unit conversion based on user locale
- Severe weather alerts

## Tools

### `get_weather`

Get weather information for a location.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | Yes | City name (can include country, e.g., "Paris, France") |
| `forecast` | boolean | No | Include multi-day forecast (default: false) |
| `days` | number | No | Number of forecast days (default: 5, max: 7) |

**Example Usage via WhatsApp:**

> "What's the weather in Istanbul?"

> "Weather forecast for London"

> "Is it going to rain in Ankara tomorrow?"

> "Temperature in New York"

## Setup

### Step 1: Install the Plugin

```bash
curl -X POST https://api.gethippo.ai/api/plugins/weather/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grantedPermissions": ["location:read"]
  }'
```

No additional configuration is required. The plugin uses OpenWeatherMap as the data provider.

## Usage Examples

### Current Weather

> User: "What's the weather in Istanbul?"
>
> Hippo: "Here's the current weather in Istanbul:
>
> **Temperature:** 18C (feels like 16C)
> **Condition:** Partly cloudy
> **Humidity:** 65%
> **Wind:** 12 km/h from the northwest
>
> It's a pleasant day - perfect for being outdoors!"

### Weather Forecast

> User: "Weather forecast for Izmir"
>
> Hippo: "Here's the 5-day forecast for Izmir:
>
> **Today (Tue):** 22C, Sunny
> **Wednesday:** 24C, Clear
> **Thursday:** 21C, Cloudy
> **Friday:** 19C, Light rain
> **Saturday:** 20C, Partly cloudy
>
> Looks like rain is expected on Friday - you might want to carry an umbrella."

### Specific Weather Questions

> User: "Will it rain in Ankara tomorrow?"
>
> Hippo: "Looking at tomorrow's forecast for Ankara:
>
> - **Condition:** Clear skies
> - **Precipitation chance:** 5%
> - **Temperature:** High 15C, Low 8C
>
> No rain expected tomorrow!"

### Temperature Only

> User: "Temperature in Berlin"
>
> Hippo: "The current temperature in Berlin is 12C (feels like 10C)."

### International Locations

> User: "Weather in Tokyo, Japan"
>
> Hippo: "Current weather in Tokyo, Japan:
>
> **Temperature:** 20C
> **Condition:** Light rain
> **Humidity:** 78%
> **Wind:** 8 km/h
>
> It's a bit rainy there right now."

## Weather Data

### Current Conditions

| Data Point | Description |
|------------|-------------|
| Temperature | Actual and "feels like" temperature |
| Condition | Weather description (sunny, cloudy, rain, etc.) |
| Humidity | Relative humidity percentage |
| Wind | Speed and direction |
| Pressure | Atmospheric pressure |
| Visibility | Visibility distance |
| UV Index | UV radiation level |

### Forecast Data

| Data Point | Description |
|------------|-------------|
| High/Low | Daily temperature range |
| Condition | Expected weather condition |
| Precipitation | Chance of rain/snow |
| Wind | Expected wind conditions |
| Sunrise/Sunset | Times for the day |

## Localization

The Weather plugin automatically adjusts units based on your locale:

| Locale | Temperature | Wind Speed | Distance |
|--------|-------------|------------|----------|
| `tr-TR` | Celsius | km/h | km |
| `en-US` | Fahrenheit | mph | miles |
| `en-GB` | Celsius | mph | miles |
| `de-DE` | Celsius | km/h | km |

## Data Provider

Hippo uses **OpenWeatherMap** as the primary weather data provider:

- Real-time weather data
- 7-day forecasts
- Global coverage
- Updated every 10 minutes

:::info Data Accuracy
Weather data is provided by OpenWeatherMap and updated frequently. Forecasts become less accurate further into the future. For critical planning, always check multiple sources.
:::

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "City not found" | Invalid or misspelled city name | Check spelling or add country (e.g., "Paris, France") |
| "Weather unavailable" | Temporary API issue | Try again in a few minutes |
| "Location ambiguous" | Multiple cities with same name | Be more specific (add country or region) |

## Tips

### Getting Accurate Results

1. **Be specific with city names:**
   - Instead of "Paris" use "Paris, France" or "Paris, Texas"
   - Include country for common city names

2. **Use native spellings:**
   - "Munchen" or "Munich" both work
   - "Istanbul" or "Constantinople" both resolve correctly

3. **Ask natural questions:**
   - "Do I need an umbrella today?"
   - "Should I wear a jacket in London?"
   - "Is it cold in Moscow right now?"

## Limitations

- Forecasts limited to 7 days
- No historical weather data
- No minute-by-minute precipitation data
- Some very small towns may not be in the database

## Privacy

- Location queries are not stored beyond the current conversation
- No location tracking or history
- Weather data is fetched in real-time and not cached per user
