// Built-in icon set: a curated selection of Lucide icons (https://lucide.dev, ISC licence, see NOTICE).
// Names follow the dotted "symbol.variant" convention (e.g. "square.and.arrow.up") so designs are easy to
// port, but every glyph is Lucide artwork: no third-party platform artwork is included or required.
//
// Three render kinds, all on a 24x24 grid:
//   stroke  outline glyph (Lucide's native style)
//   solid   same glyph with some shapes filled ("heart.fill", "star.fill", …)
//   badge   filled container with the inner glyph knocked out ("checkmark.circle.fill", …)
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, ArrowUpRight, BadgeCheck, Banknote,
  BatteryFull, Bell, Bluetooth, BellDot, BellOff, Book, Bookmark, BookmarkX, Cake, Calendar, Camera, ChartColumn, ChartLine,
  ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Circle, CircleAlert,
  CircleArrowLeft, CircleCheck, CircleDollarSign, CircleDot, CircleEllipsis, CircleMinus, CirclePlus,
  CircleQuestionMark, CircleUser, CircleX, Clock, Cloud, Coffee, Copy, CreditCard, Download, Ellipsis, Eye, EyeOff,
  FastForward, File, FileText, Flag, Flame, Flower, Folder, Gift, Globe, Grid3x3, Hand, Heart, History, House,
  Image, Images, Inbox, Info, Layers, LayoutGrid, Leaf, Link, List, ListFilter, Lock, LockOpen, LogOut, Mail,
  MailOpen, MailPlus, Map, Menu, MessageCircle, MessageSquare, Mic, Minus, Moon, MoonStar, Mountain, Music,
  Navigation, Network, OctagonX, Package, Paperclip, Pause, Pencil, Phone, Play, Plane, Plus, RadioTower, Rewind,
  RotateCw, ScanQrCode, Search, Send, Settings, Share, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone,
  Hourglass, ListChecks, Pin, Target, DollarSign, Sparkles, SquarePen, Star, StarHalf, Sun, SunDim, Tag, ThumbsDown, Ticket, Trash2, TreeDeciduous, TriangleAlert, Type,
  Undo2, User, Users, Utensils, Video, Volume1, Volume2, Wallet, Waves, Wifi, X,
} from "lucide";

type LucideNode = readonly (readonly [string, { [k: string]: string | number | undefined }])[];

export interface IconDef {
  /** inner SVG markup for viewBox "0 0 24 24" */
  body: string;
  /** For "badge" icons: markup knocked out of `body` (drawn with a mask). */
  cut?: string;
  /** true if the glyph must flip horizontally in RTL */
  mirror: boolean;
  /** "stroke" icons use currentColor stroke; individual shapes may carry fill="currentColor" */
  kind: "stroke";
}

const attrs = (a: { [k: string]: string | number | undefined }) =>
  Object.entries(a).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}="${v}"`).join(" ");
const markup = (node: LucideNode, pick?: (i: number) => boolean, extra = "") =>
  node.filter((_, i) => !pick || pick(i)).map(([t, a]) => `<${t} ${attrs(a)}${extra}/>`).join("");

/** Convert a Lucide icon node into an outline icon definition. */
export function strokeIcon(node: LucideNode, mirror = false): IconDef {
  return { body: markup(node), mirror, kind: "stroke" };
}
/** Fill selected shapes (all when `fill` is omitted) in addition to the outline. */
export function solidIcon(node: LucideNode, fill?: number[], mirror = false): IconDef {
  const body = node.map(([t, a], i) => `<${t} ${attrs(a)}${!fill || fill.includes(i) ? ' fill="currentColor"' : ""}/>`).join("");
  return { body, mirror, kind: "stroke" };
}
/** Fill the `shape` nodes and knock every other node out of them. */
export function badgeIcon(node: LucideNode, shape: number[] = [0], mirror = false): IconDef {
  return {
    body: markup(node, (i) => shape.includes(i), ' fill="currentColor"'),
    cut: markup(node, (i) => !shape.includes(i)),
    mirror,
    kind: "stroke",
  };
}

const s = strokeIcon;

export const icons = {
  // navigation & arrows
  "chevron.left": s(ChevronLeft, true), "chevron.right": s(ChevronRight, true), "chevron.up": s(ChevronUp), "chevron.down": s(ChevronDown),
  "chevron.up.chevron.down": s(ChevronsUpDown), "chevron.forward": s(ChevronRight, true), "chevron.backward": s(ChevronLeft, true),
  "arrow.left": s(ArrowLeft, true), "arrow.right": s(ArrowRight, true), "arrow.up": s(ArrowUp), "arrow.down": s(ArrowDown),
  "arrow.up.right": s(ArrowUpRight), "arrow.down.right": s(ArrowDownRight), "arrow.up.arrow.down": s(ArrowUpDown),
  "arrow.clockwise": s(RotateCw, true), "arrow.uturn.backward": s(Undo2, true), "arrow.uturn.backward.circle.fill": badgeIcon(CircleArrowLeft),
  // actions
  "plus": s(Plus), "minus": s(Minus), "xmark": s(X), "checkmark": s(Check), "ellipsis": s(Ellipsis), "ellipsis.circle": s(CircleEllipsis),
  "magnifyingglass": s(Search), "square.and.arrow.up": s(Share), "square.and.arrow.down": s(Download), "square.and.pencil": s(SquarePen, true),
  "pencil": s(Pencil, true), "trash": s(Trash2), "doc.on.doc": s(Copy), "link": s(Link), "paperclip": s(Paperclip), "slider.horizontal.3": s(SlidersHorizontal),
  "line.3.horizontal": s(Menu), "line.3.horizontal.decrease": s(ListFilter, true), "list.bullet": s(List, true), "square.grid.2x2": s(LayoutGrid),
  "square.grid.3x3": s(Grid3x3), "rectangle.portrait.and.arrow.right": s(LogOut, true), "clock.arrow.circlepath": s(History),
  // objects & places
  "house": s(House), "folder": s(Folder), "doc": s(File), "doc.text": s(FileText), "tray": s(Inbox), "tray.2": s(Inbox), "calendar": s(Calendar), "clock": s(Clock),
  "camera": s(Camera), "photo": s(Image), "photo.on.rectangle": s(Images), "video": s(Video), "mic": s(Mic), "music.note": s(Music),
  "bell": s(Bell), "bell.badge": s(BellDot), "bell.slash": s(BellOff), "bookmark": s(Bookmark), "bookmark.slash": s(BookmarkX), "book": s(Book),
  "envelope": s(Mail), "envelope.open": s(MailOpen), "envelope.badge": s(MailPlus), "message": s(MessageCircle, true), "bubble.right": s(MessageSquare),
  "paperplane": s(Send, true), "phone": s(Phone), "iphone": s(Smartphone), "person": s(User), "person.2": s(Users), "person.circle": s(CircleUser), "person.crop.circle": s(CircleUser),
  "heart": s(Heart), "star": s(Star), "flag": s(Flag), "tag": s(Tag), "gift": s(Gift), "cart": s(ShoppingCart), "bag": s(ShoppingBag), "creditcard": s(CreditCard),
  "wallet.pass": s(Wallet), "banknote": s(Banknote), "dollarsign.circle": s(CircleDollarSign), "ticket": s(Ticket), "shippingbox": s(Package),
  "gearshape": s(Settings), "lock": s(Lock), "lock.open": s(LockOpen), "eye": s(Eye), "eye.slash": s(EyeOff), "sparkles": s(Sparkles),
  "location": s(Navigation), "map": s(Map), "globe": s(Globe), "network": s(Network), "wifi": s(Wifi), "bluetooth": s(Bluetooth), "antenna.radiowaves.left.and.right": s(RadioTower),
  "battery.100": s(BatteryFull), "battery.100percent": s(BatteryFull), "airplane": s(Plane),
  "cloud": s(Cloud), "sun.max": s(Sun), "sun.min": s(SunDim), "moon": s(Moon), "moon.stars": s(MoonStar), "flame": s(Flame), "leaf": s(Leaf), "tree": s(TreeDeciduous),
  "mountain.2": s(Mountain), "water.waves": s(Waves), "camera.macro": s(Flower), "hand.raised": s(Hand), "hand.thumbsdown": s(ThumbsDown),
  "cup.and.saucer": s(Coffee), "fork.knife": s(Utensils), "birthday.cake": s(Cake), "qrcode.viewfinder": s(ScanQrCode), "rectangle.stack.badge.plus": s(Layers),
  "chart.bar.xaxis": s(ChartColumn), "chart.line.uptrend.xyaxis": s(ChartLine), "chart.pie": s(ChartPie), "textformat.size.larger": s(Type), "textformat.size.smaller": s(Type),
  "target": s(Target), "dollarsign": s(DollarSign), "checklist": s(ListChecks), "exclamationmark": s(CircleAlert), "hourglass": s(Hourglass), "pin": s(Pin), "textformat": s(Type),
  "circle": s(Circle), "largecircle.fill.circle": s(CircleDot), "info.circle": s(Info), "exclamationmark.triangle": s(TriangleAlert),
  "questionmark.circle": s(CircleQuestionMark), "speaker.wave.2": s(Volume2, true), "speaker.wave.3": s(Volume2, true), "speaker": s(Volume1, true),
  "play": s(Play), "pause": s(Pause), "backward": s(Rewind, true), "forward": s(FastForward, true),

  // filled variants
  "heart.fill": solidIcon(Heart), "star.fill": solidIcon(Star),
  "star.leadinghalf.filled": { body: markup(Star) + solidIcon(StarHalf).body, mirror: true, kind: "stroke" }, "bookmark.fill": solidIcon(Bookmark), "house.fill": badgeIcon(House, [1]),
  "bell.fill": solidIcon(Bell, [0]), "bell.badge.fill": solidIcon(BellDot, [0, 2]), "person.fill": solidIcon(User), "person.2.fill": solidIcon(Users, [0, 2]),
  "play.fill": solidIcon(Play), "pause.fill": solidIcon(Pause), "backward.fill": solidIcon(Rewind, undefined, true), "forward.fill": solidIcon(FastForward, undefined, true),
  "mic.fill": solidIcon(Mic, [2]), "speaker.wave.2.fill": solidIcon(Volume2, [0], true), "speaker.wave.3.fill": solidIcon(Volume2, [0], true), "speaker.fill": solidIcon(Volume1, [0], true),
  "flag.fill": solidIcon(Flag), "flame.fill": solidIcon(Flame), "moon.fill": solidIcon(Moon), "moon.stars.fill": solidIcon(MoonStar, [2]), "sun.max.fill": solidIcon(Sun, [0]),
  "location.fill": solidIcon(Navigation), "lock.fill": solidIcon(Lock, [0]), "camera.fill": badgeIcon(Camera), "gearshape.fill": badgeIcon(Settings),
  "trash.fill": solidIcon(Trash2, [2]), "leaf.fill": solidIcon(Leaf, [0]), "tree.fill": solidIcon(TreeDeciduous, [0]), "mountain.2.fill": solidIcon(Mountain),
  "gift.fill": solidIcon(Gift, [3]), "paperplane.fill": solidIcon(Send, [0], true), "bag.fill": badgeIcon(ShoppingBag, [2]), "creditcard.fill": badgeIcon(CreditCard),
  "banknote.fill": badgeIcon(Banknote), "ticket.fill": badgeIcon(Ticket), "map.fill": solidIcon(Map), "book.fill": s(Book), "chart.pie.fill": solidIcon(ChartPie, [0]),
  "envelope.open.fill": s(MailOpen), "envelope.badge.fill": s(MailPlus), "hand.raised.fill": solidIcon(Hand, [0]), "shippingbox.fill": badgeIcon(Package, [0]),
  "cup.and.saucer.fill": solidIcon(Coffee, [2]), "birthday.cake.fill": s(Cake),
  "checkmark.circle.fill": badgeIcon(CircleCheck), "xmark.circle.fill": badgeIcon(CircleX), "plus.circle.fill": badgeIcon(CirclePlus), "minus.circle.fill": badgeIcon(CircleMinus),
  "exclamationmark.circle.fill": badgeIcon(CircleAlert), "info.circle.fill": badgeIcon(Info), "exclamationmark.triangle.fill": badgeIcon(TriangleAlert),
  "person.crop.circle.fill": badgeIcon(CircleUser), "checkmark.seal.fill": badgeIcon(BadgeCheck), "dollarsign.circle.fill": badgeIcon(CircleDollarSign),
  "xmark.octagon.fill": badgeIcon(OctagonX, [1]),
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;
