---
name: Quiet Sanctuary
colors:
  surface: '#fff8f3'
  surface-dim: '#e6d8c6'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff2e2'
  surface-container: '#faecda'
  surface-container-high: '#f4e6d4'
  surface-container-highest: '#efe0cf'
  on-surface: '#211b10'
  on-surface-variant: '#444748'
  inverse-surface: '#372f23'
  inverse-on-surface: '#fdefdc'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5f5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dd'
  on-secondary-container: '#656461'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#281900'
  on-tertiary-container: '#a07e49'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e5e2dd'
  secondary-fixed-dim: '#c9c6c2'
  on-secondary-fixed: '#1c1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#ffdeae'
  tertiary-fixed-dim: '#e8c085'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#5d4212'
  background: '#fff8f3'
  on-background: '#211b10'
  surface-variant: '#efe0cf'
  stone: '#F4F1EC'
  sand: '#D9C9B0'
  taupe: '#A89C8C'
  forest: '#2E332E'
  charcoal: '#171717'
  gold: '#C9A46B'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '500'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  subhead-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.1em
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '300'
    lineHeight: 32px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  unit: 4px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system for this luxury travel curator is rooted in the concept of **Editorial Minimalism**. It evokes the feeling of a quiet sanctuary—a high-end, soulful retreat that prioritizes atmospheric experiences over loud declarations. The brand personality is discerning, intentional, and refined, targeting a clientele that values privacy and authentic cultural connection.

Visuals lean into a **Cinematic** aesthetic, utilizing generous whitespace, high-contrast serif typography, and a "fine-detail" approach to UI. The interface should feel like a premium travel journal, where the content is given room to breathe, and the navigation is as effortless as a curated itinerary. 

Key principles:
- **Quiet Luxury:** No unnecessary flourishes; every line and element serves a purpose.
- **Naturalism:** Soft, organic tones and natural light photography.
- **Modern Heritage:** A balance of classic elegance (serifs) with modern functionalism (geometric sans-serifs).

## Colors

The palette is derived from natural materials—stone, sand, and earth. It is designed to be a "quiet" canvas that allows high-end photography to remain the focal point.

- **Primary (Charcoal):** Used for primary text, high-contrast UI elements, and deep "midnight" backgrounds to provide a grounded, premium feel.
- **Secondary (Stone):** The primary surface color. It is warmer than pure white, providing a soft, tactile quality to the screen.
- **Tertiary (Gold):** Used sparingly for status indicators, premium markers, and interactive highlights to signify exclusivity.
- **Accent (Forest):** A deep, organic green used for secondary backgrounds or text to evoke nature and stillness.
- **Neutral (Sand/Taupe):** These tones are used for borders, dividers, and low-contrast UI details to create depth without relying on synthetic shadows.

## Typography

The typography system pairs the romantic, high-contrast elegance of **Playfair Display** with the clean, geometric precision of **Montserrat**.

- **Playfair Display (Headlines):** Set with tight letter-spacing for large displays. Use for emotional storytelling and section titles.
- **Montserrat (UI & Body):** Body copy should prioritize a "Light" or "Regular" weight to maintain the minimalist aesthetic. 
- **Subheads:** Utilize Montserrat in SemiBold with increased letter-spacing (tracking) and uppercase styling to create a distinct architectural hierarchy that feels institutional and curated.
- **Hierarchy:** Ensure a dramatic contrast between large display serifs and small, functional sans-serif labels.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** system for desktop, centered on the screen with generous external margins to simulate an editorial spread.

- **Grid:** A 12-column grid for desktop with wide 24px gutters. On mobile, a 4-column grid is used.
- **Rhythm:** Spacing follows a 4px base unit, but emphasizes the larger increments (`lg` and `xl`) to create the "Quiet Sanctuary" feel. 
- **White Space:** Whitespace is treated as a design element, not "empty" space. Large sections of **Stone** should separate content blocks to allow for mental pauses.
- **Verticality:** Long-form scrolling with cinematic full-width image breaks is preferred.

## Elevation & Depth

This design system avoids the use of synthetic drop shadows. Instead, it utilizes **Tonal Layering** and **Fine Outlines** to convey hierarchy.

- **Tonal Layers:** Elevation is achieved by stacking colors. A **Sand** card sitting on a **Stone** background indicates a secondary interactive layer.
- **Fine Outlines:** 1px solid borders in **Taupe** are used to define boundaries for inputs or cards, maintaining a flat, sophisticated editorial look.
- **Natural Light:** Depth in photography should provide the "soul" of the design, while the UI remains a 2D framework that supports the imagery.
- **Backdrop:** For mobile navigation or overlays, a subtle frost effect (Backdrop Blur) may be used, but it should remain barely perceptible to avoid a "techy" appearance.

## Shapes

The shape language is **Sharp and Architectural**. 

- **Corners:** Buttons, cards, and input fields utilize 0px (Sharp) corners. This reinforces the premium, luxury feel of high-end stationery and architectural blueprints.
- **The Circle:** The only exception to the sharp rule is the brand monogram and specific decorative icons, which are strictly circular. This contrast makes the brand mark feel like a seal of quality.
- **Dividers:** Use 1px horizontal lines in **Taupe** or **Sand** to separate content sections subtly.

## Components

### Buttons
- **Primary:** Charcoal background with Stone text. Rectangular, no border radius. High-contrast and commanding.
- **Ghost:** 1px Taupe border, Charcoal or Gold text. Used for secondary actions like "View Gallery."
- **Text Link:** Montserrat SemiBold, uppercase, with a 1px underline that appears on hover.

### Cards
- Surfaces use **Sand** or **Stone**. 
- Imagery within cards should have no rounded corners. 
- Content inside cards should be center-aligned or left-aligned with significant internal padding (minimum `md`).

### Input Fields
- Underline-only style or 1px Taupe border. 
- Labels use **label-sm** typography, positioned above the field.

### Chips / Markers
- Used for "Location" or "Experience Type."
- Small, uppercase Montserrat text with a thin border. No background fill unless active.

### Lists
- Clean, minimal lines with Taupe dividers. 
- Iconography (Curated, Authentic, etc.) should be thin-line, geometric, and monochromatic.