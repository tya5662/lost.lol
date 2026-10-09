import { LucideIcon } from "lucide-react";

export type UserRole = 'owner' | 'co-owner' | 'staff' | 'member';

export interface SiteMediaLayer { id:string; type:'image'|'video'; url:string; x:number; y:number; width:number; height:number; opacity:number; blur:number; rotation:number; zIndex:number; objectFit:'cover'|'contain'; autoplay:boolean; loop:boolean; muted:boolean; clickableUrl?:string; }

export interface SiteSettings {
  brandName:string; brandTld:string; heroBadge:string; heroTitle:string; heroSubtitle:string; primaryButton:string; secondaryButton:string;
  accentColor:string; secondaryColor:string; backgroundColor:string; panelColor:string; gridOpacity:number; glowOpacity:number;
  particles:boolean; grid:boolean; ghostMode:boolean; featureSection:boolean; mediaLayers:SiteMediaLayer[]; siteAnimations:{id:string;target:'site'|'media';mediaId?:string;name:string;duration:number;delay:number;intensity:number;enabled:boolean}[]; announcement:string; showcaseLabel:string; featuresLabel:string; signInLabel:string; createLabel:string; primaryButtonUrl:string; secondaryButtonUrl:string; heroAlignment:'left'|'center'|'right'; seoTitle:string; seoDescription:string; seoImage:string; footerText:string; effectsIntensity:number;
  navStyle?: 'glass'|'solid'|'minimal'|'floating';
  heroSize?: 'compact'|'standard'|'large'|'fullscreen';
  heroWidth?: 'narrow'|'standard'|'wide';
  headlineFont?: string;
  headlineWeight?: number;
  headlineSize?: number;
  bodySize?: number;
  pageRadius?: number;
  sectionSpacing?: number;
  noise?: boolean;
  vignette?: boolean;
  scanlines?: boolean;
  animatedGradient?: boolean;
  mouseGlow?: boolean;
  hoverLift?: boolean;
  buttonStyle?: 'solid'|'glass'|'outline'|'pill';
  buttonRadius?: number;
  showTrustBar?: boolean;
  trustText?: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  featuresTitle?: string;
  featuresDescription?: string;
  featureCards?: {title:string;description:string;icon?:string}[];
  customCss?: string;
}

export interface User {
  _id: string,
  id: number;
  username: string;
  name: string;
  description: string,
  email: string;
  profilePicture?: string
  backgroundImage?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  bio?: string;
  totalVisit?: number;
  role?: UserRole;
  premium?: boolean;
  premiumSince?: string;
  badges?: string[];
  location?: string;
  showLocation?: boolean;
  showDiscordPresence?: boolean;
  discordUsername?: string;
  discordId?: string;
  discordAvatar?: string;
  discordConnectedAt?: string;
  profileOpacity?: number;
  backgroundOpacity?: number;
  cardOpacity?: number;
  cardBlur?: number;
  profileBlur?: number;
  verified?: boolean;
  customEmojis?: {name:string;value:string}[];
  customFontFamily?: string;
  customFontName?: string;
  customFontMime?: string;
  customFontUrl?: string;
  profileGradient?: boolean;
  monochromeIcons?: boolean;
  animatedTitle?: boolean;
  usernameEffect?: string;
  backgroundEffect?: string;
  syncToBackground?: boolean;
  cursorEffect?: string;
  fontFamily?: string;
  typewriterEnabled?: boolean;
  typewriterTexts?: string[];
  pageEnterText?: string;
  pageClickSound?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioAutoplay?: boolean;
  audioCoverUrl?: string;
  audioMedia?: string;
  layout?: string;
  metadataTitle?: string;
  metadataDescription?: string;
  metadataImage?: string;
  aliases?: string[];
  secondTab?: {
    enabled?: boolean;
    title?: string;
    widgets?: unknown[];
  };
  // Enhanced profile controls — available across Free and Premium tiers.
  roleLabel?: string;
  profileLayout?: 'default'|'compact'|'wide'|'minimal'|'split';
  cardStyle?: 'glass'|'solid'|'outline'|'floating';
  cardRadius?: number;
  linkStyle?: 'glass'|'solid'|'outline'|'minimal'|'pill';
  linkRadius?: number;
  linkOpacity?: number;
  linkBlur?: number;
  linkSpacing?: number;
  avatarSize?: number;
  avatarShape?: 'circle'|'rounded'|'square';
  avatarGlow?: boolean;
  showViews?: boolean;
  showStatus?: boolean;
  showBranding?: boolean;
  accentGlow?: number;
  pageEnterEffect?: 'fade'|'rise'|'zoom'|'blur'|'none';
  clickEffect?: 'ripple'|'flash'|'scale'|'none';
  cursorTrailSize?: number;
  backgroundIntensity?: number;
  particleEffect?: 'none'|'dust'|'embers'|'stars'|'ghosts';
  typewriterSpeed?: number;
  typewriterLoop?: boolean;
  socialLinks?: {platform:string;url:string;label?:string}[];
  customCss?: string;
}

export interface Link {
  _id: number,
  id: number;
  userId?: number;
  title: string;
  url: string;
  platform: string;
  order?: number;
}

export interface ProfileSettings {
  bio: string;
  profilePicture?: File;
  backgroundMedia?: File;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: LucideIcon | string;
  placeholder: string;
  baseUrl: string;
}

export interface LinkFormData {
  title: string;
  url: string;
}