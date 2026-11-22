import { createContext, useContext, useEffect, useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, Stack, Text, Button, IconButton, Media, SearchField, SegmentedControl, Rating,
  Stepper, Sheet, List, ListSection, ListItem, Banner, EmptyState,
} from "../../src/index";
import { account, ME } from "./account";

import lamp from "./art/lamp.svg";
import loungeChair from "./art/lounge-chair.svg";
import mug from "./art/mug.svg";
import planter from "./art/planter.svg";
import glassPendant from "./art/glass-pendant.svg";
import floorCushion from "./art/floor-cushion.svg";
import servingBoard from "./art/serving-board.svg";
import hangingPots from "./art/hanging-pots.svg";

/** Online shop flow: home grid with search and categories -> product detail -> bag sheet with steppers and check out. */
interface Product { id: number; name: string; cat: number; price: number; rating: number; reviews: number; art: string; about: string }
const CATS = ["All", "Light", "Seating", "Table", "Garden"];
const COLOURS = ["Sand", "Sage", "Ink"];
const SIZES = ["Small", "Medium", "Large"];
const PRODUCTS: Product[] = [
  { id: 1, name: "Arc Table Lamp", cat: 1, price: 64, rating: 4.5, reviews: 212, art: lamp, about: "A soft, warm glow for reading corners and bedside tables. The shade is hand-finished and the base is weighted so it stays put." },
  { id: 2, name: "Oak Lounge Chair", cat: 2, price: 249, rating: 5, reviews: 98, art: loungeChair, about: "Solid oak with a curved back that holds you just right. Comes with a washable cushion and arrives ready to use." },
  { id: 3, name: "Stoneware Mug", cat: 3, price: 18, rating: 4, reviews: 540, art: mug, about: "Thick, glazed stoneware that keeps coffee warm. Dishwasher safe, and every piece has its own small variation." },
  { id: 4, name: "Clay Planter", cat: 4, price: 32, rating: 4.5, reviews: 131, art: planter, about: "A matte clay pot with a drainage hole and a matching saucer. Great for herbs, ferns and small trailing plants." },
  { id: 5, name: "Glass Pendant", cat: 1, price: 89, rating: 4, reviews: 64, art: glassPendant, about: "A blown glass shade on a long fabric cord. Hang it over a dining table or a quiet staircase." },
  { id: 6, name: "Linen Floor Cushion", cat: 2, price: 56, rating: 4.5, reviews: 77, art: floorCushion, about: "Generous, supportive and easy to move around. The cover is stonewashed linen and comes off for cleaning." },
  { id: 7, name: "Serving Board", cat: 3, price: 27, rating: 5, reviews: 305, art: servingBoard, about: "A smooth walnut board for bread, cheese and everything in between. Oiled by hand and ready for the table." },
  { id: 8, name: "Hanging Pot Set", cat: 4, price: 41, rating: 4, reviews: 58, art: hangingPots, about: "Three pots with jute hangers in graduated sizes. Bring a little green to a bright window." },
];

interface Line { id: number; colour: string; size: string; qty: number }
interface Shop { lines: Line[]; add: (l: Omit<Line, "qty">) => void; setQty: (i: number, q: number) => void; clear: () => void; favs: number[]; toggleFav: (id: number) => void; bagOpen: boolean; setBagOpen: (o: boolean) => void }
const ShopContext = createContext<Shop>(null!);
const useShop = () => useContext(ShopContext);
const money = (n: number) => `$${n.toFixed(2)}`;
const find = (id: number) => PRODUCTS.find((p) => p.id === id)!;

function ShopProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([{ id: 1, colour: "Sand", size: "Medium", qty: 1 }, { id: 3, colour: "Sage", size: "Small", qty: 2 }]);
  const [favs, setFavs] = useState<number[]>([4]);
  const [bagOpen, setBagOpen] = useState(false);
  const add = (l: Omit<Line, "qty">) => setLines((ls) => (ls.some((x) => x.id === l.id && x.colour === l.colour && x.size === l.size) ? ls.map((x) => (x.id === l.id && x.colour === l.colour && x.size === l.size ? { ...x, qty: x.qty + 1 } : x)) : [...ls, { ...l, qty: 1 }]));
  const setQty = (i: number, q: number) => setLines((ls) => ls.flatMap((x, j) => (j !== i ? [x] : q > 0 ? [{ ...x, qty: q }] : [])));
  const clear = () => setLines([]);
  const toggleFav = (id: number) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  return (
    <ShopContext.Provider value={{ lines, add, setQty, clear, favs, toggleFav, bagOpen, setBagOpen }}>
      {children}
    </ShopContext.Provider>
  );
}


export default function ShopFlow() {
  return <ShopProvider><NavigationStack backLabel="Back"><Home /></NavigationStack></ShopProvider>;
}

/** Opens straight on a product page (used for the README preview and the playground). */
function OpenDetail({ id }: { id: number }) {
  const nav = useNavigation();
  useEffect(() => { nav?.push(<Detail id={id} />); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Home />;
}
export function ShopDetailFlow() {
  return <ShopProvider><NavigationStack backLabel="Shop"><OpenDetail id={2} /></NavigationStack></ShopProvider>;
}

function useBagAction() {
  const { lines, setBagOpen } = useShop();
  const n = lines.reduce((s, l) => s + l.qty, 0);
  return { icon: "bag" as const, label: n ? `Bag, ${n} items` : "Bag", onPress: () => setBagOpen(true) };
}

function Home() {
  const nav = useNavigation();
  const { favs, toggleFav } = useShop();
  const bag = useBagAction();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(0);
  const items = PRODUCTS.filter((p) => (cat === 0 || p.cat === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => items.slice(i * 2, i * 2 + 2));
  return (
    <Screen header={<NavigationBar title="Shop" subtitle={`Picked for ${ME.first}`} trailing={[bag]} account={account()} />}>
      <Stack gap="4" padding="inline">
        <Stack padding="1">{null}</Stack>
        <SearchField placement="inline" label="Search products" value={q} onChange={setQ} placeholder="Search the shop" />
        <SegmentedControl label="Category" segments={CATS.map((label) => ({ label }))} selected={cat} onChange={setCat} />
        {items.length === 0 ? (
          <EmptyState variant="search" title="No Results for “{query}”" query={q} description="Try a different word or category." />
        ) : (
          <Stack gap="5">
            {rows.map((row, r) => (
              <Stack key={r} direction="horizontal" gap="3" align="start">
                {row.map((p) => (
                  <Stack key={p.id} grow gap="2">
                    <Media ratio="1:1" radius="medium" src={p.art} alt={p.name} onPress={() => nav?.push(<Detail id={p.id} />)} />
                    <Stack gap="none">
                      <Stack direction="horizontal" gap="1" align="center" justify="between">
                        <Text variant="subheadline" weight="semibold" lines={1}>{p.name}</Text>
                        <IconButton variant="plain" size="small" icon={favs.includes(p.id) ? "heart.fill" : "heart"} label={favs.includes(p.id) ? `Remove ${p.name} from favourites` : `Favourite ${p.name}`} selected={favs.includes(p.id)} onPress={() => toggleFav(p.id)} />
                      </Stack>
                      <Stack gap="2">
                        <Text variant="subheadline" color="secondary">{money(p.price)}</Text>
                        <Stack direction="horizontal" gap="1" align="center">
                          <Rating size="small" value={p.rating} label={`${p.rating} out of 5`} />
                          <Text variant="caption1" color="secondary">{p.reviews}</Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
                {row.length === 1 && <Stack grow>{null}</Stack>}
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
      <BagSheet />
    </Screen>
  );
}

function Detail({ id }: { id: number }) {
  const p = find(id);
  const { add, favs, toggleFav, setBagOpen } = useShop();
  const bag = useBagAction();
  const [colour, setColour] = useState(0);
  const [size, setSize] = useState(1);
  const [added, setAdded] = useState(false);
  const fav = favs.includes(id);
  return (
    <Screen
      header={<NavigationBar title="" displayMode="inline" trailing={[{ icon: fav ? "heart.fill" : "heart", label: fav ? "Remove from favourites" : "Add to favourites", onPress: () => toggleFav(id) }, bag]} />}
      bottomBar={
        <Stack padding="margin">
          <Button size="large" fullWidth icon="bag" label={`Add to Bag · ${money(p.price)}`} onPress={() => { add({ id, colour: COLOURS[colour]!, size: SIZES[size]! }); setAdded(true); }} />
        </Stack>
      }
    >
      <Stack gap="5">
        <Stack padding="inline"><Media ratio="4:3" radius="large" src={p.art} alt={p.name} /></Stack>
        <Stack padding="margin" gap="5">
          <Stack gap="2">
            <Stack direction="horizontal" justify="between" align="baseline">
              <Text variant="title2" weight="bold" as="h1">{p.name}</Text>
              <Text variant="title3" weight="semibold">{money(p.price)}</Text>
            </Stack>
            <Stack direction="horizontal" gap="2" align="center">
              <Rating value={p.rating} label={`${p.rating} out of 5`} />
              <Text variant="footnote" color="secondary">{p.rating.toFixed(1)} · {p.reviews} reviews</Text>
            </Stack>
            <Text variant="body" color="secondary" paragraph>{p.about}</Text>
          </Stack>
          <Stack gap="2">
            <Text variant="headline">Colour</Text>
            <SegmentedControl label="Colour" segments={COLOURS.map((label) => ({ label }))} selected={colour} onChange={setColour} />
          </Stack>
          <Stack gap="2">
            <Text variant="headline">Size</Text>
            <SegmentedControl label="Size" segments={SIZES.map((label) => ({ label }))} selected={size} onChange={setSize} />
          </Stack>
        </Stack>
      </Stack>
      <Banner open={added} tone="success" icon="checkmark.circle.fill" title="Added to your bag" actionLabel="View Bag" onAction={() => { setAdded(false); setBagOpen(true); }} onDismiss={() => setAdded(false)} dismissLabel="Dismiss" />
      <BagSheet />
    </Screen>
  );
}

function BagSheet() {
  const { lines, setQty, clear, bagOpen, setBagOpen } = useShop();
  const [placed, setPlaced] = useState(false);
  const subtotal = lines.reduce((s, l) => s + find(l.id).price * l.qty, 0);
  const checkOut = () => { clear(); setBagOpen(false); setPlaced(true); };
  return (
    <>
      <Sheet open={bagOpen} onClose={() => setBagOpen(false)} title="Your Bag" detent="large" showGrabber cancelLabel="Close" onCancel={() => setBagOpen(false)}>
        {lines.length === 0 ? (
          <EmptyState icon="bag" title="Your bag is empty" description="Items you add will show up here." />
        ) : (
          <Stack gap="4">
            <List label="Bag items">
              <ListSection>
                {lines.map((l, i) => {
                  const p = find(l.id);
                  return (
                    <ListItem key={`${l.id}-${l.colour}-${l.size}`} prominent leading={<Media ratio="1:1" radius="small" width={64} src={p.art} alt={p.name} />} title={p.name} subtitle={`${l.colour} · ${l.size}`} value={money(p.price * l.qty)}
                      detail={<Stepper label={`Qty ${l.qty}`} value={l.qty} min={0} max={9} onChange={(q) => setQty(i, q)} valueText={`${l.qty} items`} />} />
                  );
                })}
              </ListSection>
            </List>
            <Stack padding="margin" gap="3">
              <Stack direction="horizontal" justify="between" align="baseline">
                <Text variant="headline">Subtotal</Text>
                <Text variant="title3" weight="bold">{money(subtotal)}</Text>
              </Stack>
              <Text variant="footnote" color="secondary">Shipping and taxes are added at check out.</Text>
              <Button size="large" fullWidth label="Check Out" onPress={checkOut} />
            </Stack>
          </Stack>
        )}
      </Sheet>
      <Banner open={placed} tone="success" icon="checkmark.circle.fill" title="Order placed" message="Thank you. A receipt is on its way." onDismiss={() => setPlaced(false)} dismissLabel="Dismiss" />
    </>
  );
}
