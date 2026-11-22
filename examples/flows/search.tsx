import { useMemo, useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, SearchField, List, ListSection, ListItem, SegmentedControl, Stack, Menu,
  Button, Sheet, Form, Slider, Picker, EmptyState, Media, Text, Badge, Glass, type MenuItem,
} from "../../src/index";

/** Search & filter flow — Market: bottom search with recents, scope, sort menu, filter sheet, empty results, product detail. */
interface Product { id: number; name: string; category: "Fruit" | "Vegetables" | "Bakery"; price: number; rating: number; organic: boolean; inStock: boolean; tone: "red" | "orange" | "yellow" | "green" | "purple" | "teal" | "pink" | "indigo" | "blue" | "gray" }
const PRODUCTS: Product[] = [
  { id: 1, name: "Red Pears", category: "Fruit", price: 4.99, rating: 4.8, organic: true, inStock: true, tone: "red" },
  { id: 2, name: "Valencia Oranges", category: "Fruit", price: 3.49, rating: 4.4, organic: false, inStock: true, tone: "orange" },
  { id: 3, name: "Bananas", category: "Fruit", price: 1.29, rating: 4.1, organic: true, inStock: true, tone: "yellow" },
  { id: 4, name: "Blueberries", category: "Fruit", price: 5.99, rating: 4.7, organic: true, inStock: false, tone: "indigo" },
  { id: 5, name: "Baby Spinach", category: "Vegetables", price: 3.99, rating: 4.5, organic: true, inStock: true, tone: "green" },
  { id: 6, name: "Heirloom Tomatoes", category: "Vegetables", price: 5.49, rating: 4.6, organic: false, inStock: true, tone: "red" },
  { id: 7, name: "Purple Carrots", category: "Vegetables", price: 2.99, rating: 4.2, organic: true, inStock: true, tone: "purple" },
  { id: 8, name: "Avocados", category: "Vegetables", price: 6.49, rating: 4.3, organic: false, inStock: false, tone: "green" },
  { id: 9, name: "Sourdough Loaf", category: "Bakery", price: 7.5, rating: 4.9, organic: false, inStock: true, tone: "orange" },
  { id: 10, name: "Almond Croissants", category: "Bakery", price: 4.25, rating: 4.7, organic: false, inStock: true, tone: "yellow" },
];
const SCOPES = ["All", "Fruit", "Vegetables", "Bakery"] as const;
type Sort = "relevance" | "price-asc" | "price-desc" | "rating";
interface Filters { maxPrice: number; minRating: string; organic: boolean; inStock: boolean }
const NO_FILTERS: Filters = { maxPrice: 10, minRating: "any", organic: false, inStock: false };
const money = (v: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);

export default function SearchFlow() {
  return (
    <NavigationStack backLabel="Market">
      <Market />
    </NavigationStack>
  );
}

function Market() {
  const nav = useNavigation();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(["apples", "sourdough", "spinach"]);
  const [scope, setScope] = useState(0);
  const [sort, setSort] = useState<Sort>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);

  const active = (filters.maxPrice < 10 ? 1 : 0) + (filters.minRating !== "any" ? 1 : 0) + (filters.organic ? 1 : 0) + (filters.inStock ? 1 : 0);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const r = PRODUCTS.filter((p) =>
      (scope === 0 || p.category === SCOPES[scope]) && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      p.price <= filters.maxPrice && (filters.minRating === "any" || p.rating >= Number(filters.minRating)) &&
      (!filters.organic || p.organic) && (!filters.inStock || p.inStock));
    if (sort === "price-asc") r.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r.sort((a, b) => b.price - a.price);
    if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [query, scope, sort, filters]);

  const submit = (q: string) => { const t = q.trim().toLowerCase(); if (t) setRecent((r) => [t, ...r.filter((x) => x !== t)].slice(0, 5)); };
  const sortItems: MenuItem[] = [{
    section: "Sort By",
    items: ([["relevance", "Relevance"], ["price-asc", "Price: Low to High"], ["price-desc", "Price: High to Low"], ["rating", "Rating"]] as const)
      .map(([v, label]) => ({ label, checked: sort === v, onPress: () => { setSort(v); setSortOpen(false); } })),
  }];

  return (
    <Screen
      background="grouped"
      header={
        <NavigationBar
          title="Market"
          trailing={[{ icon: "line.3.horizontal.decrease", label: active ? `Filters, ${active} active` : "Filters", variant: active ? "glassProminent" : "glass", onPress: () => { setDraft(filters); setFilterOpen(true); } }]}
        />
      }
      bottomBar={<SearchField value={query} placeholder="Fruit, vegetables, bread…" onChange={setQuery} onSubmit={submit} onCancel={() => setQuery("")} clearLabel="Clear text" cancelLabel="Close search" />}
    >
      <Stack padding="inline" gap="3">
        <SegmentedControl label="Category" segments={SCOPES.map((label) => ({ label }))} selected={scope} onChange={setScope} />
        <Stack direction="horizontal" justify="between" align="center">
          <Text variant="footnote" color="secondary">{results.length} {results.length === 1 ? "item" : "items"}{active ? ` · ${active} ${active === 1 ? "filter" : "filters"}` : ""}</Text>
          <Menu
            open={sortOpen}
            onOpenChange={setSortOpen}
            label="Sort"
            layout="medium"
            trigger={<Button variant="borderless" size="small" icon="arrow.up.arrow.down" label="Sort" onPress={() => setSortOpen(true)} />}
            items={sortItems}
          />
        </Stack>
      </Stack>

      {!query && recent.length > 0 && scope === 0 && !active && (
        <List label="Recent searches">
          <ListSection header="Recent Searches">
            {recent.map((r) => (
              <ListItem key={r} icon="clock.arrow.circlepath" iconColor="gray" title={r} onPress={() => setQuery(r)}
                trailingActions={[{ label: "Remove", icon: "trash", tone: "destructive", onPress: () => setRecent((x) => x.filter((y) => y !== r)) }]} />
            ))}
            <ListItem title="Clear Recent Searches" role="action" onPress={() => setRecent([])} />
          </ListSection>
        </List>
      )}

      {results.length ? (
        <List label="Results">
          <ListSection header={query ? `Results for “${query}”` : "All Products"}>
            {results.map((p) => (
              <ListItem
                key={p.id}
                prominent
                leading={<Media ratio="1:1" radius="small" width={44} tone={p.tone} icon={p.category === "Bakery" ? "birthday.cake.fill" : "leaf.fill"} />}
                title={p.name}
                subtitle={`${p.category} · ★ ${p.rating}${p.organic ? " · Organic" : ""}${p.inStock ? "" : " · Out of stock"}`}
                value={money(p.price)}
                accessory="chevron"
                onPress={() => nav?.push(<ProductDetail product={p} />)}
              />
            ))}
          </ListSection>
        </List>
      ) : (
        <EmptyState
          variant="search"
          title="No Results"
          query={query || undefined}
          description={active ? "Try removing some filters." : "Check the spelling or try a new search."}
          actions={active ? [{ label: "Clear Filters", variant: "bordered", onPress: () => setFilters(NO_FILTERS) }] : undefined}
        />
      )}

      <Sheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        detent="medium"
        detents={["medium", "large"]}
        showGrabber
        title="Filters"
        cancelLabel="Cancel"
        onCancel={() => setFilterOpen(false)}
        confirmLabel="Apply"
        onConfirm={() => { setFilters(draft); setFilterOpen(false); }}
      >
        <Form label="Filters">
          <ListSection header="Price">
            <Slider label="Maximum price" value={draft.maxPrice} min={1} max={10} step={0.5} onChange={(maxPrice) => setDraft({ ...draft, maxPrice })} valueText={draft.maxPrice >= 10 ? "Any" : `Up to ${money(draft.maxPrice)}`} minIcon="dollarsign" maxIcon="dollarsign.circle" formRow />
          </ListSection>
          <ListSection>
            <Picker label="Rating" value={draft.minRating} options={[{ value: "any", label: "Any" }, { value: "4", label: "4★ & up" }, { value: "4.5", label: "4.5★ & up" }]} onChange={(minRating) => setDraft({ ...draft, minRating })} formRow />
            <ListItem title="Organic only" icon="leaf.fill" iconColor="green" accessory="toggle" toggled={draft.organic} onToggle={(organic) => setDraft({ ...draft, organic })} />
            <ListItem title="In stock" icon="shippingbox.fill" iconColor="blue" accessory="toggle" toggled={draft.inStock} onToggle={(inStock) => setDraft({ ...draft, inStock })} />
          </ListSection>
          <ListSection>
            <ListItem title="Reset Filters" role="action" onPress={() => setDraft(NO_FILTERS)} />
          </ListSection>
        </Form>
      </Sheet>
    </Screen>
  );
}

function ProductDetail({ product: p }: { product: Product }) {
  const [qty, setQty] = useState(0);
  return (
    <Screen
      header={<NavigationBar title={p.name} displayMode="inline" trailing={[{ icon: "heart", label: "Favorite", onPress: () => {} }]} />}
      bottomBar={
        <Stack padding="margin">
          <Button variant="glassProminent" size="large" fullWidth disabled={!p.inStock} label={!p.inStock ? "Out of Stock" : qty ? `In Bag (${qty}) · ${money(p.price * qty)}` : `Add to Bag · ${money(p.price)}`} onPress={() => setQty((q) => q + 1)} />
        </Stack>
      }
    >
      <Stack padding="margin" gap="4">
        <Stack>
          <Media ratio="4:3" radius="large" tone={p.tone} icon={p.category === "Bakery" ? "birthday.cake.fill" : "leaf.fill"} alt={p.name} />
        </Stack>
        <Stack gap="1">
          <Stack direction="horizontal" gap="2" align="center">
            <Text variant="title2" weight="bold">{p.name}</Text>
            {p.organic && <Badge value="Organic" tone="accent" />}
          </Stack>
          <Text color="secondary">{p.category} · ★ {p.rating} (128 ratings)</Text>
          <Text variant="title3" weight="semibold">{money(p.price)}</Text>
        </Stack>
        <Glass variant="regular" shape="rect" cornerRadius={20}>
          <Stack padding="4" gap="1">
            <Text variant="headline">Fresh from local farms</Text>
            <Text variant="subheadline" color="secondary">Delivered within 2 hours. Free delivery on orders over $35.</Text>
          </Stack>
        </Glass>
      </Stack>
    </Screen>
  );
}
