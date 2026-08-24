---
name: Nexus System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  surface-border: '#E5E7EB'
  status-success: '#10B981'
  status-error: '#EF4444'
  status-warning: '#F59E0B'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
  space-2xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is built for a professional, high-performance ecosystem where efficiency and clarity are paramount. The brand personality is systematic, reliable, and forward-thinking, catering to users who manage complex workflows and require a stable, unobtrusive interface.

The design style follows a **Corporate / Modern** aesthetic with subtle influences of **Minimalism**. It prioritizes a highly organized information hierarchy, using generous whitespace to reduce cognitive load. The visual language is defined by precision, using a clean geometric structure and a refined color palette to establish a trustworthy and functional environment.

Key visual principles:
- **Clarity over Decoration:** Every element serves a functional purpose.
- **Systematic Consistency:** Predictable patterns across all modules.
- **Professional Polish:** High attention to alignment, consistent spacing, and typographic rhythm.

## Colors

The color strategy uses a high-contrast monochromatic base with strategic hits of functional color. The primary color is a deep, authoritative black used for key branding and high-emphasis text. The secondary color is a neutral slate gray, providing soft contrast for secondary information.

The tertiary blue is reserved for interactive states and primary calls to action, ensuring they remain distinct from static content. Backgrounds utilize a near-white neutral to maintain a fresh, airy feel while providing enough contrast for white cards and containers. 

Functional "named colors" are used strictly for semantic feedback: green for success, red for errors, and amber for warnings, ensuring accessibility and quick recognition of system states.

## Typography

The typography system is powered exclusively by **Inter**, leveraging its systematic and utilitarian nature. The scale is designed for high legibility in data-dense environments.

- **Headlines:** Use tighter letter spacing and semi-bold weights to create a strong visual anchor.
- **Body Text:** Standardizes on a 16px base for optimal reading comfort. Line heights are kept generous (1.5x) to ensure text-heavy sections remain approachable.
- **Labels:** Small caps or medium weights are used for metadata, navigation, and form labels to differentiate them from prose.
- **Mobile Scaling:** Large display titles scale down significantly on mobile devices to prevent awkward line breaks and maintain a tight vertical rhythm.

## Layout & Spacing

The layout is based on a **Fluid Grid** system that adapts to the viewport while maintaining consistent internal rhythms.

- **Grid System:** A 12-column grid is used for desktop (1440px+), transitioning to an 8-column grid for tablets, and a 4-column grid for mobile.
- **Spacing Logic:** This design system utilizes a 4px base unit. All margins, paddings, and component heights must be multiples of 4px.
- **Gutter & Margins:** Gutters are fixed at 24px to ensure content separation. Page margins expand from 16px on mobile to 40px on large displays to provide breathing room.
- **Component Spacing:** Use `space-md` (16px) as the default padding for cards and containers, and `space-sm` (8px) for internal element grouping.

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layers** and **Low-contrast outlines**. This avoids the visual clutter of heavy shadows while maintaining a sense of structural depth.

- **Surface Levels:** The base background is the neutral color. Primary containers (cards, modals) use a pure white surface.
- **Outlines:** Most containers use a 1px solid border (`#E5E7EB`). This provides crisp definition without the weight of a shadow.
- **Elevated States:** For components that require a sense of "lift" (e.g., dropdowns, modals, or active drag states), use a single, highly diffused ambient shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Interactive Depth:** Buttons and clickable cards do not use shadows on hover; instead, they utilize subtle background color shifts to indicate interactivity.

## Shapes

The shape language is **Soft** and restrained. This ensures the interface feels modern and approachable without becoming overly playful or "bubbly."

- **Standard Radius:** 0.25rem (4px) is the default for most components like buttons, input fields, and small tags.
- **Container Radius:** Larger components like cards or dashboard panels use `rounded-lg` (8px) to soften the overall layout.
- **Full Rounding:** Only used for profile avatars or status indicators to create a distinct visual contrast against the otherwise rectilinear grid.

## Components

- **Buttons:** Primary buttons are solid black with white text. Secondary buttons use a light gray ghost style with a subtle border. Padding should be `12px 20px` for medium sizes.
- **Input Fields:** Use a 1px border (`#E5E7EB`) with `body-sm` typography. Focus states are indicated by a 2px blue tertiary border or a subtle outer glow.
- **Chips & Tags:** Use `label-sm` font. They should have a light gray background and a 4px border radius.
- **Cards:** White background with a 1px border. No shadow by default. Inner padding is strictly `24px` to maintain consistency with the grid gutter.
- **Lists:** Clean, border-bottom separated rows. Use `body-md` for primary list text and `body-sm` with the secondary color for sub-text or descriptions.
- **Checkboxes & Radios:** Minimalist styling using the tertiary blue for the active state. The "checked" icon should be a simple white checkmark.
- **Data Tables:** High-density layout. Headers should use `label-md` with a subtle gray background. Rows alternate with extremely faint tints or simple 1px dividers.