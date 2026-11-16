import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(OUT_DIR, { recursive: true });

const S = 'fill="none" stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="#FFFFFF" stroke="none"';

const ICONS = {
  Activity: { b: '<path d="M3 12h4l3-8 4 16 3-8h4"/>' },
  AlertOctagon: { b: '<path d="M8.2 2.5h7.6L21.5 8.2v7.6L15.8 21.5H8.2L2.5 15.8V8.2z"/><path d="M12 7.5v5"/><path d="M12 16.2v.6"/>' },
  AlertTriangle: { b: '<path d="M12 3.2 2.4 20.4h19.2z"/><path d="M12 9.5v4.6"/><path d="M12 17.2v.6"/>' },
  Archive: { b: '<rect x="2.5" y="4" width="19" height="4.4" rx="1.2"/><path d="M4.4 8.4v10.4a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4V8.4"/><path d="M10 12.4h4"/>' },
  ArrowLeft: { b: '<path d="M20.5 12h-17"/><path d="M10 5.5 3.5 12l6.5 6.5"/>' },
  ArrowRight: { b: '<path d="M3.5 12h17"/><path d="M14 5.5 20.5 12 14 18.5"/>' },
  BadgeCheck: { b: '<path d="M12 2.4 14.4 4l2.8-.4.9 2.7 2.5 1.4-.9 2.7.9 2.7-2.5 1.4-.9 2.7-2.8-.4L12 21.6 9.6 20l-2.8.4-.9-2.7-2.5-1.4.9-2.7-.9-2.7 2.5-1.4.9-2.7L9.6 4z"/><path d="M8.8 12.1 11 14.3l4.3-4.5"/>' },
  BarChart3: { b: '<path d="M3 3v17.5h18"/><path d="M8 17.5v-5.4"/><path d="M13 17.5V7.2"/><path d="M18 17.5V10"/>' },
  Bell: { b: '<path d="M6.2 9.4a5.8 5.8 0 0 1 11.6 0c0 4.6 1.9 5.7 1.9 5.7H4.3s1.9-1.1 1.9-5.7"/><path d="M10 18.4a2 2 0 0 0 4 0"/>' },
  BellOff: { b: '<path d="M6.2 9.4a5.8 5.8 0 0 1 8.6-5"/><path d="M17.8 10.2c.3 4 1.9 4.9 1.9 4.9H7.2"/><path d="M4 4l16 16"/>' },
  BookMarked: { b: '<path d="M6.2 3h11.6a.9.9 0 0 1 .9.9v16.2a.9.9 0 0 1-.9.9H6.2z"/><path d="M12.6 3v7l2.4-1.7L17.4 10V3"/>' },
  BookOpen: { b: '<path d="M12 6.6C10.4 5.1 7.9 4.1 4 4.1v13.8c3.9 0 6.4 1 8 2.5"/><path d="M12 6.6c1.6-1.5 4.1-2.5 8-2.5v13.8c-3.9 0-6.4 1-8 2.5"/><path d="M12 6.6v13.8"/>' },
  Bookmark: { b: '<path d="M6.2 3.2h11.6v17.6L12 16.3 6.2 20.8z"/>' },
  Calendar: { b: '<rect x="3" y="5" width="18" height="16" rx="2.2"/><path d="M3 10.2h18"/><path d="M8 3.2v3.8"/><path d="M16 3.2v3.8"/>' },
  Check: { b: '<path d="M4.2 12.6 9.4 17.8 19.8 6.6"/>' },
  CheckCheck: { b: '<path d="M2.4 12.6 6.2 16.4 12.6 9"/><path d="M11 15.8l1.6 1.7 8.9-9.3"/>' },
  CheckCircle2: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M8 12.3 10.8 15.1 16.4 9.2"/>' },
  ChevronDown: { b: '<path d="M5.2 8.8 12 15.6l6.8-6.8"/>' },
  ChevronLeft: { b: '<path d="M15.2 5.2 8.4 12l6.8 6.8"/>' },
  ChevronRight: { b: '<path d="M8.8 5.2 15.6 12l-6.8 6.8"/>' },
  CircleDot: { b: '<circle cx="12" cy="12" r="8.9"/><circle cx="12" cy="12" r="3"/>' },
  Clock: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M12 6.8v5.5l3.6 2.1"/>' },
  CloudUpload: { b: '<path d="M7.4 18.6a4.2 4.2 0 0 1-.6-8.4 6.2 6.2 0 0 1 11.9.3 3.9 3.9 0 0 1-.6 8.1"/><path d="M12 21.2v-8.4"/><path d="M8.9 15.6 12 12.5l3.1 3.1"/>' },
  Compass: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M15.8 8.2 13.4 13.4 8.2 15.8l2.4-5.2z"/>' },
  Copy: { b: '<rect x="9" y="9" width="11.6" height="11.6" rx="2.2"/><path d="M5.4 15H4.4a1.4 1.4 0 0 1-1.4-1.4V4.4A1.4 1.4 0 0 1 4.4 3h9.2a1.4 1.4 0 0 1 1.4 1.4v1"/>' },
  CreditCard: { b: '<rect x="2.4" y="5" width="19.2" height="14" rx="2.4"/><path d="M2.4 10h19.2"/><path d="M6.2 15h4.2"/>' },
  Crown: { b: '<path d="M3.4 18.6h17.2"/><path d="M4.2 8.4 7.9 11.6 12 5.2l4.1 6.4 3.7-3.2-1.6 10.2H5.8z"/>' },
  Database: { b: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>' },
  Download: { b: '<path d="M12 3.2v12"/><path d="M7 10.6 12 15.6l5-5"/><path d="M4 20.4h16"/>' },
  ExternalLink: { b: '<path d="M14 3.6h6.4V10"/><path d="M20.4 3.6 12 12"/><path d="M18 13.6V19a1.4 1.4 0 0 1-1.4 1.4H5A1.4 1.4 0 0 1 3.6 19V7.4A1.4 1.4 0 0 1 5 6h5.4"/>' },
  Eye: { b: '<path d="M2.2 12S5.9 5.4 12 5.4 21.8 12 21.8 12 18.1 18.6 12 18.6 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3.1"/>' },
  EyeOff: { b: '<path d="M3.6 3.6 20.4 20.4"/><path d="M9.6 5.9A9.9 9.9 0 0 1 12 5.6c6.1 0 9.8 6.4 9.8 6.4a17.4 17.4 0 0 1-3.6 4.3"/><path d="M6.3 8A17 17 0 0 0 2.2 12s3.7 6.4 9.8 6.4c1.3 0 2.5-.3 3.5-.7"/><path d="M9.9 9.9a3.1 3.1 0 0 0 4.3 4.3"/>' },
  FileText: { b: '<path d="M6.2 2.8h8l4.2 4.2v14.2H6.2z"/><path d="M14.2 2.8v4.2h4.2"/><path d="M9 13h6"/><path d="M9 17h6"/>' },
  Flag: { b: '<path d="M5.2 21.2V3"/><path d="M5.2 4.2h11.6l-1.7 3.7 1.7 3.8H5.2z"/>' },
  Flame: { b: '<path d="M12 21.2a5 5 0 0 0 5-5c0-4.2-5-7.2-5-13 0 5.8-5 8.8-5 13a5 5 0 0 0 5 5z"/>' },
  Globe: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M3.1 12h17.8"/><path d="M12 3.1c2.5 2.6 3.8 5.6 3.8 8.9S14.5 18.3 12 20.9c-2.5-2.6-3.8-5.6-3.8-8.9S9.5 5.7 12 3.1z"/>' },
  Headphones: { b: '<path d="M4.2 14.4v-2.2a7.8 7.8 0 0 1 15.6 0v2.2"/><rect x="2.6" y="13.4" width="4.6" height="7" rx="2.1"/><rect x="16.8" y="13.4" width="4.6" height="7" rx="2.1"/>' },
  HeartHandshake: { b: '<path d="M12 20.6s-7.2-4.3-7.2-9.2A4.1 4.1 0 0 1 12 8.9a4.1 4.1 0 0 1 7.2 2.5c0 4.9-7.2 9.2-7.2 9.2z"/>' },
  HelpCircle: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M9.5 9.6a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2.1-2.5 3.6"/><path d="M12 17v.6"/>' },
  Home: { b: '<path d="M3 11 12 3.2 21 11"/><path d="M5.4 9.4v11.2h13.2V9.4"/><path d="M10 20.6v-6h4v6"/>' },
  Image: { b: '<rect x="3" y="4.2" width="18" height="15.6" rx="2.2"/><circle cx="8.6" cy="9.8" r="1.8"/><path d="M21 16.2 15.8 11 7 19.8"/>' },
  Info: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M12 11v5.2"/><path d="M12 7.8v.6"/>' },
  KeyRound: { b: '<circle cx="8.2" cy="15.4" r="4"/><path d="M11 12.6 20.4 3.2"/><path d="M17.2 6.2l2.6 2.6"/>' },
  Laptop: { b: '<rect x="4" y="5" width="16" height="11" rx="1.8"/><path d="M2 20h20"/><path d="M9 20h6"/>' },
  LayoutDashboard: { b: '<rect x="3" y="3" width="7.2" height="8.2" rx="1.6"/><rect x="13.8" y="3" width="7.2" height="5.2" rx="1.6"/><rect x="13.8" y="11.2" width="7.2" height="9.8" rx="1.6"/><rect x="3" y="14.2" width="7.2" height="6.8" rx="1.6"/>' },
  Link: { b: '<path d="M10.2 13.2a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7l-1.1 1.1"/><path d="M13.8 10.8a4 4 0 0 0-6-.5l-2 2a4 4 0 0 0 5.7 5.7l1.1-1.1"/>' },
  Loader2: { b: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>' },
  Lock: { b: '<rect x="4.2" y="10" width="15.6" height="11" rx="2.2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>' },
  LogIn: { b: '<path d="M15 3h4a1.4 1.4 0 0 1 1.4 1.4v15.2A1.4 1.4 0 0 1 19 21h-4"/><path d="M10 8 14 12l-4 4"/><path d="M14 12H3.4"/>' },
  LogOut: { b: '<path d="M9 3H5A1.4 1.4 0 0 0 3.6 4.4v15.2A1.4 1.4 0 0 0 5 21h4"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9.6"/>' },
  Mail: { b: '<rect x="2.6" y="5" width="18.8" height="14" rx="2.2"/><path d="M3.2 7.2 12 13.2l8.8-6"/>' },
  Map: { b: '<path d="M3 6.6 9 4.2l6 2.4 6-2.4v13.2l-6 2.4-6-2.4-6 2.4z"/><path d="M9 4.2V19.8"/><path d="M15 6.6v13.2"/>' },
  MapPin: { b: '<path d="M12 21.2s7-6.1 7-11.2a7 7 0 1 0-14 0c0 5.1 7 11.2 7 11.2z"/><circle cx="12" cy="10" r="2.6"/>' },
  Megaphone: { b: '<path d="M4 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2h2l7 4.2V4.8L7.2 9H5.2A1.2 1.2 0 0 0 4 10.2z"/><path d="M17.6 8.8a4 4 0 0 1 0 6.4"/>' },
  Menu: { b: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>' },
  MessageCircle: { b: '<path d="M21 12a8.6 8.6 0 0 1-12.5 7.7L3.4 21l1.4-5.1A8.6 8.6 0 1 1 21 12z"/>' },
  MessageSquare: { b: '<path d="M4 5h16a1.2 1.2 0 0 1 1.2 1.2v9.6A1.2 1.2 0 0 1 20 17H9.2L4 21V6.2A1.2 1.2 0 0 1 5.2 5z"/>' },
  Minus: { b: '<path d="M5 12h14"/>' },
  Moon: { b: '<path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8 8.6 8.6 0 1 0 20.2 14.6z"/>' },
  Palette: { b: '<path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.7 3.2-3.3 3.2h-2.2a1.9 1.9 0 0 0-1.4 3.2c.6.8.2 2.6-2.1 2.6z"/><circle cx="7.8" cy="10.2" r="1.2"/><circle cx="12" cy="7.6" r="1.2"/><circle cx="16.2" cy="10.2" r="1.2"/>' },
  Pause: { b: '<rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/>' },
  Play: { b: '<path d="M7.4 4.6 19 12 7.4 19.4z"/>' },
  Plus: { b: '<path d="M12 5v14"/><path d="M5 12h14"/>' },
  QrCode: { b: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3z"/><path d="M20 14h1.2v3H20z"/><path d="M14 20h3v1.2h-3z"/><path d="M19.2 19.2H21V21h-1.8z"/>' },
  Repeat: { b: '<path d="M4 9.2V7.4a2 2 0 0 1 2-2h12"/><path d="M15.2 2.6 18 5.4l-2.8 2.8"/><path d="M20 14.8v1.8a2 2 0 0 1-2 2H6"/><path d="M8.8 21.4 6 18.6l2.8-2.8"/>' },
  RotateCcw: { b: '<path d="M3.6 4.2v5h5"/><path d="M4.4 9.2A8.2 8.2 0 1 1 4 13.4"/>' },
  Save: { b: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 4v5.4h7V4"/><rect x="8" y="12.8" width="8" height="7.2"/>' },
  ScrollText: { b: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/>' },
  Search: { b: '<circle cx="11" cy="11" r="7"/><path d="M20.2 20.2 16.4 16.4"/>' },
  Send: { b: '<path d="M21 3 3 10.4l7.6 3L14 21z"/><path d="M10.6 13.4 21 3"/>' },
  Settings: { b: '<circle cx="12" cy="12" r="3.2"/><path d="M19.3 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.4 1a7.7 7.7 0 0 0-1.7-1L14.8 3h-4l-.4 3.1a7.7 7.7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.4 3.1h4l.4-3.1c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4z"/>' },
  Share2: { b: '<circle cx="18" cy="5.2" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.8" r="2.6"/><path d="M8.3 10.7 15.7 6.5"/><path d="M8.3 13.3l7.4 4.2"/>' },
  Shield: { b: '<path d="M12 2.6 20 5.6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/>' },
  ShieldAlert: { b: '<path d="M12 2.6 20 5.6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/><path d="M12 8v4.2"/><path d="M12 15.4v.6"/>' },
  ShieldCheck: { b: '<path d="M12 2.6 20 5.6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/><path d="M8.6 12.2 11 14.6l4.4-4.6"/>' },
  SlidersHorizontal: { b: '<path d="M3.6 8h9.2"/><path d="M17.4 8h3"/><circle cx="15.2" cy="8" r="2.2"/><path d="M3.6 16h3.6"/><path d="M11.8 16h8.6"/><circle cx="9.6" cy="16" r="2.2"/>' },
  Smartphone: { b: '<rect x="7" y="2.2" width="10" height="19.6" rx="2.6"/><path d="M11 18.4h2"/>' },
  Sparkles: { b: '<path d="M11 2.8 12.9 8 18 9.9 12.9 11.8 11 17 9.1 11.8 4 9.9 9.1 8z"/><path d="M18 14.4l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>', f: true },
  Star: { b: '<path d="M12 3 14.7 8.6 20.8 9.5 16.4 13.8 17.4 19.9 12 17 6.6 19.9 7.6 13.8 3.2 9.5 9.3 8.6z"/>', f: true },
  Target: { b: '<circle cx="12" cy="12" r="8.9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>' },
  Trash2: { b: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6.2 7 7.2 20.2h9.6L17.8 7"/><path d="M10 11v5.8"/><path d="M14 11v5.8"/>' },
  TrendingUp: { b: '<path d="M3.2 17 9.4 10.8l3.8 3.8 7.4-7.4"/><path d="M15 7.2h5.6v5.6"/>' },
  User: { b: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.4a7.5 7.5 0 0 1 15 0"/>' },
  UserPlus: { b: '<circle cx="9.6" cy="8" r="3.8"/><path d="M2.6 20.4a7 7 0 0 1 13-3.3"/><path d="M19 8.6v5"/><path d="M21.5 11.1h-5"/>' },
  Users: { b: '<circle cx="9.2" cy="8" r="3.6"/><path d="M2.6 20.2a6.6 6.6 0 0 1 13.2 0"/><path d="M16.2 4.9a3.6 3.6 0 0 1 0 6.6"/><path d="M17.6 13.8a6.6 6.6 0 0 1 3.8 6.4"/>' },
  Vibrate: { b: '<rect x="8" y="4" width="8" height="16" rx="2.2"/><path d="M4.4 9v6"/><path d="M2 11v2"/><path d="M19.6 9v6"/><path d="M22 11v2"/>' },
  Volume2: { b: '<path d="M4 9.6h3.2L11.2 6v12L7.2 14.4H4z"/><path d="M15 9.2a4 4 0 0 1 0 5.6"/><path d="M17.6 6.6a7.6 7.6 0 0 1 0 10.8"/>' },
  VolumeX: { b: '<path d="M4 9.6h3.2L11.2 6v12L7.2 14.4H4z"/><path d="M15.4 9.6 20.4 14.6"/><path d="M20.4 9.6 15.4 14.6"/>' },
  X: { b: '<path d="M6 6 18 18"/><path d="M18 6 6 18"/>' },
  XCircle: { b: '<circle cx="12" cy="12" r="8.9"/><path d="M9 9l6 6"/><path d="M15 9l-6 6"/>' },
  ListChecks: { b: '<path d="M3 6.5h8"/><path d="M3 12h8"/><path d="M3 17.5h8"/><path d="M14.6 6.4 16.2 8 20 4.2"/><path d="M14.6 11.9 16.2 13.5 20 9.7"/><path d="M14.6 17.4 16.2 19 20 15.2"/>' },
  Pencil: { b: '<path d="M4 20.2 4.9 16.4 15.9 5.4a2 2 0 0 1 2.8 0l1 1a2 2 0 0 1 0 2.8L8.7 20.2z"/><path d="M14 7.3 17.2 10.5"/>' },
  Pin: { b: '<path d="M9.2 3h5.6l-1 5.8 3.2 3.2H6.9l3.2-3.2z"/><path d="M12 12.6V21"/>' },
  Maximize: { b: '<path d="M4 9.2V4h5.2"/><path d="M20 9.2V4h-5.2"/><path d="M4 14.8V20h5.2"/><path d="M20 14.8V20h-5.2"/>' },
  Minimize: { b: '<path d="M9.2 4v5.2H4"/><path d="M14.8 4v5.2H20"/><path d="M9.2 20v-5.2H4"/><path d="M14.8 20v-5.2H20"/>' },
  Timer: { b: '<circle cx="12" cy="13.6" r="7.4"/><path d="M12 9.6v4.2l2.6 1.6"/><path d="M9.6 2.6h4.8"/><path d="M12 2.6v3.6"/>' },
  StickyNote: { b: '<path d="M4.2 4h15.6v9.8L13.8 20H4.2z"/><path d="M19.8 13.8h-6v6"/>' },
  Zap: { b: '<path d="M13.2 2.4 4.6 14.2h6.8l-1 7.4 8.8-12h-7z"/>' },
  Upload: { b: '<path d="M12 20.2V8.2"/><path d="M7 12.6 12 7.6l5 5"/><path d="M4 4h16"/>' }
};

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

const size = 128;
const results = [];

for (const [name, spec] of Object.entries(ICONS)) {
  const attrs = spec.f ? F : S;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${attrs}>` +
    spec.b +
    `</svg>`;
  const file = `${toKebab(name)}.webp`;
  await sharp(Buffer.from(svg))
    .webp({ quality: 92, alphaQuality: 100, lossless: false })
    .toFile(path.join(OUT_DIR, file));
  results.push(file);
}

console.log(`generated ${results.length} icons`);
console.log(results.join(" "));
