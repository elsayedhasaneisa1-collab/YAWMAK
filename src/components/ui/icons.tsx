import React from "react";

export interface GlyphProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

function glyph(file: string) {
  function Glyph({ className = "", style, size, ...rest }: GlyphProps) {
    return (
      <span
        aria-hidden="true"
        data-icon={file}
        className={`yawmak-icon ${className}`.trim()}
        style={{
          ...style,
          ...(size ? { width: size, height: size } : null),
          WebkitMaskImage: `url(/icons/${file}.webp)`,
          maskImage: `url(/icons/${file}.webp)`,
        }}
        {...rest}
      />
    );
  }
  Glyph.displayName = `YawmakIcon(${file})`;
  return Glyph;
}

export const Activity = glyph("activity");
export const AlertOctagon = glyph("alert-octagon");
export const AlertTriangle = glyph("alert-triangle");
export const Archive = glyph("archive");
export const ArrowLeft = glyph("arrow-left");
export const ArrowRight = glyph("arrow-right");
export const BadgeCheck = glyph("badge-check");
export const BarChart3 = glyph("bar-chart3");
export const Bell = glyph("bell");
export const BellOff = glyph("bell-off");
export const BookMarked = glyph("book-marked");
export const BookOpen = glyph("book-open");
export const Bookmark = glyph("bookmark");
export const Calendar = glyph("calendar");
export const Check = glyph("check");
export const CheckCheck = glyph("check-check");
export const CheckCircle2 = glyph("check-circle2");
export const ChevronDown = glyph("chevron-down");
export const ChevronLeft = glyph("chevron-left");
export const ChevronRight = glyph("chevron-right");
export const CircleDot = glyph("circle-dot");
export const Clock = glyph("clock");
export const CloudUpload = glyph("cloud-upload");
export const Compass = glyph("compass");
export const Copy = glyph("copy");
export const CreditCard = glyph("credit-card");
export const Crown = glyph("crown");
export const Database = glyph("database");
export const Download = glyph("download");
export const ExternalLink = glyph("external-link");
export const Eye = glyph("eye");
export const EyeOff = glyph("eye-off");
export const FileText = glyph("file-text");
export const Flag = glyph("flag");
export const Flame = glyph("flame");
export const Globe = glyph("globe");
export const Headphones = glyph("headphones");
export const HeartHandshake = glyph("heart-handshake");
export const HelpCircle = glyph("help-circle");
export const Home = glyph("home");
export const Image = glyph("image");
export const Info = glyph("info");
export const KeyRound = glyph("key-round");
export const Laptop = glyph("laptop");
export const LayoutDashboard = glyph("layout-dashboard");
export const Link = glyph("link");
export const Loader2 = glyph("loader2");
export const Lock = glyph("lock");
export const LogIn = glyph("log-in");
export const LogOut = glyph("log-out");
export const Mail = glyph("mail");
export const Map = glyph("map");
export const MapPin = glyph("map-pin");
export const Megaphone = glyph("megaphone");
export const Menu = glyph("menu");
export const MessageCircle = glyph("message-circle");
export const MessageSquare = glyph("message-square");
export const Minus = glyph("minus");
export const Moon = glyph("moon");
export const Palette = glyph("palette");
export const Pause = glyph("pause");
export const Play = glyph("play");
export const Plus = glyph("plus");
export const QrCode = glyph("qr-code");
export const Repeat = glyph("repeat");
export const RotateCcw = glyph("rotate-ccw");
export const Save = glyph("save");
export const ScrollText = glyph("scroll-text");
export const Search = glyph("search");
export const Send = glyph("send");
export const Settings = glyph("settings");
export const Share2 = glyph("share2");
export const Shield = glyph("shield");
export const ShieldAlert = glyph("shield-alert");
export const ShieldCheck = glyph("shield-check");
export const SlidersHorizontal = glyph("sliders-horizontal");
export const Smartphone = glyph("smartphone");
export const Sparkles = glyph("sparkles");
export const Star = glyph("star");
export const Target = glyph("target");
export const Trash2 = glyph("trash2");
export const TrendingUp = glyph("trending-up");
export const User = glyph("user");
export const UserPlus = glyph("user-plus");
export const Users = glyph("users");
export const Vibrate = glyph("vibrate");
export const Volume2 = glyph("volume2");
export const VolumeX = glyph("volume-x");
export const X = glyph("x");
export const XCircle = glyph("x-circle");
export const ListChecks = glyph("list-checks");
export const Pencil = glyph("pencil");
export const Pin = glyph("pin");
export const Maximize = glyph("maximize");
export const Minimize = glyph("minimize");
export const Timer = glyph("timer");
export const StickyNote = glyph("sticky-note");
export const Zap = glyph("zap");
export const Upload = glyph("upload");
