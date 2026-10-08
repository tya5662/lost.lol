<div align="center">

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

# 🌐 Bio-Link Profile Template

A customizable bio-link profile page inspired by my [guns.lol template](https://guns.lol/templates/a51af3a4-ffc7-49e0-8866-b44683d075ff) · 👤 [Visit my profile at guns.lol](https://guns.lol/jefer).  
Everything you want to change lives in **one single file**: `js/config.js`.

[**Live Demo**](https://gunslol-template.pages.dev/)

</div>

---

## ✨ Features

- 🎬 **Video background** with audio that starts on click
- 🌧️ **Animated rain particles** with mouse parallax
- ✨ **Sparkle cursor trail**
- 📺 **Analog interference effect** on the name (TV static style)
- ⌨️ **Typewriter** on the status text (types, deletes, repeats)
- 🃏 **3D card tilt** on mouse move (works on mobile too)
- 🎭 **Discord presence** section (static, no API needed)
- 🏅 **Badges / roles** with hover tooltips
- 🔗 **Social links** with glow effect
- 🖱️ **Custom cursor**
- 🔤 **Custom font** support (just drop your `.otf` file)
- ⚙️ **100% configurable** from a single file

---

## 📁 Project Structure

```
gunslol-template/
├── index.html              # Page structure — no need to edit
├── css/
│   └── style.css           # Visual styles — no need to edit
├── js/
│   ├── config.js           ✏️ THE ONLY FILE YOU NEED TO EDIT
│   └── script.js           # Page logic — no need to edit
└── assets/
    ├── avatar.jpg          # Your profile photo
    ├── background.mp4      # Background video
    ├── cursor.png          # Custom cursor image
    ├── favicon.png         # Browser tab icon
    ├── badges/             # Your badge/role GIFs or PNGs
    ├── fonts/              # Your custom font (rename to fuente.otf)
    └── icons/
        ├── instagram.png   # Social link icons
        ├── spotify.png
        ├── tiktok.png
        └── status/         # Discord status icons
            ├── online.png
            ├── idle.png (inactive.png)
            ├── dnd.png (busy.png)
            └── offline.png
```

---

## 🚀 Getting Started

**1.** Clone or download this repository  
**2.** Drop your files into the `assets/` folder  
**3.** Open `js/config.js` and fill in your info  
**4.** Open `index.html` with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or upload to GitHub Pages

That's it. No installs, no build steps, no dependencies.

---

## ⚙️ Configuration (`js/config.js`)

Everything is grouped into clear sections:

### 👤 Profile
| Field | What it does |
|---|---|
| `profileName` | Your name on the card |
| `nameTooltip` | Text that appears when hovering your name |
| `nameEffect` | `"noise"` = TV interference \| `"none"` = plain |
| `statusText` | Text below your name (typewriter effect) |
| `tabTitle` | Animated title in the browser tab |
| `entrySymbol` | Symbol shown on the entry screen |

### 🖼️ Files
| Field | What it does |
|---|---|
| `avatar` | Path to your profile photo |
| `backgroundVideo` | Path to your background video (`.mp4`) |
| `customCursor` | Path to your cursor image |
| `avatarDecoration` | Animated Discord ring (URL or `""` to disable) |

### 🏅 Badges
```js
badges: [
  { icon: "assets/badges/owner.png", label: "Owner" },
  { icon: "assets/badges/verified.png", label: "Verified" },
]
```
- Add or remove as many as you want
- `label` is the tooltip text shown on hover
- Supports `.png`, `.gif`, `.webp`

### 💬 Discord
| Field | What it does |
|---|---|
| `discordUsername` | Your Discord username |
| `discordStatus` | Text shown below your username |
| `discordAvatar` | Path to your Discord profile photo |
| `discordPresenceStatus` | `"online"` \| `"idle"` \| `"dnd"` \| `"offline"` |

### 🔗 Social Links
```js
socialLinks: [
  { name: "Instagram", url: "https://instagram.com/you", icon: "assets/icons/instagram.png" },
  { name: "GitHub",    url: "https://github.com/you",    icon: "assets/icons/github.png"    },
]
```
- Add, remove or reorder links freely
- Use any `.png` as an icon

### 🎨 Card & Colors
| Field | What it does |
|---|---|
| `cardBorderRadius` | How round the card corners are (`"85px"` = pill shape) |
| `cardBackground` | Card background color (use `rgba()` to keep it transparent) |
| `cardTiltIntensity` | How dramatic the 3D tilt is (0 = disabled) |
| `usernameGlow` | Glow color behind your name (`"none"` to disable) |
| `iconGlowColor` | Glow color behind the social icons |

### 🌧️ Particles & Cursor
| Field | What it does |
|---|---|
| `particleColor` | Color of the rain dots |
| `particleCount` | How many dots fall at once |
| `particleParallaxStrength` | How much they shift with the mouse (0 = off) |
| `shootingStarColors` | Colors of the cursor sparkles |
| `shootingStarSize` | Size of each sparkle |

---

## 🖼️ What Images Can You Add?

| Image | Where to put it | Recommended size |
|---|---|---|
| Profile photo | `assets/avatar.jpg` | At least 200×200px, square |
| Background video | `assets/background.mp4` | Any resolution, keep the file size reasonable |
| Custom cursor | `assets/cursor.png` | 32×32px or 64×64px, transparent background |
| Browser tab icon | `assets/favicon.png` | 32×32px |
| Badges / roles | `assets/badges/` | Any size, `.gif` works for animated |
| Social icons | `assets/icons/` | 96×96px, transparent background |
| Discord status icons | `assets/icons/status/` | 48×48px, transparent background |
| Custom font | `assets/fonts/fuente.otf` | `.otf`, `.ttf` or `.woff2` |

> **Tip for icons:** Remove the black background before using them so the glow effect works correctly.  
> **Tip for the cursor:** The hotspot (click point) is set by `customCursorHotspot` in `config.js`.

---

## 💡 Tips

- **Video not playing?** Make sure the file is named `background.mp4` and placed inside `assets/`. Some browsers need the file to be served (use Live Server, not just opening the file directly).
- **Font not loading?** Rename your font file to `fuente.otf` and drop it in `assets/fonts/`. The page falls back to the default font if the file is missing — no errors.
- **Badge GIF has a white background?** You need to remove it before using it. Any image editor or online tool like [remove.bg](https://www.remove.bg) works.
- **Want more social links?** Just copy one of the existing lines in `socialLinks` and change the URL and icon path.
- **Card too wide on mobile?** Lower the `cardMaxWidth` value in `config.js`.

---

## 📄 License

This project is open source and free to use. Credit is appreciated but not required.

---

<div align="center">

Made with 🖤 — based on my <a href="https://guns.lol/templates/a51af3a4-ffc7-49e0-8866-b44683d075ff">guns.lol template</a>

🔗 Check out my live profile: <a href="https://guns.lol/jefer">guns.lol/jefer</a>

</div>