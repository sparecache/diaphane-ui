import { useState } from "react";
import northernLakes from "./art/northern-lakes.svg";
import desertCanyon from "./art/desert-canyon.svg";
import harbourTown from "./art/harbour-town.svg";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, List, ListSection, ListItem, Media, Glass, Rating, DatePicker, Stepper,
  Text, Stack, Button, Banner, Sheet, SectionHeader, type MediaTone,
} from "../../src/index";
import { account, ME } from "./account";

/**
 * Trip booking flow — search card (from/to rows, dates, travellers), popular destinations, results with price and rating.
 * A result pushes the trip detail (hero, highlights, itinerary); "Book Trip" opens a confirmation sheet, then a banner.
 */
interface Trip { id: string; name: string; region: string; tone: MediaTone; art: string; nights: number; price: number; rating: number; reviews: number; blurb: string; highlights: [string, string, string][]; days: [string, string][] }
const TRIPS: Trip[] = [
  {
    id: "lakes", name: "Northern Lakes", region: "Highlands", tone: "teal", art: northernLakes, nights: 5, price: 640, rating: 4.8, reviews: 312,
    blurb: "Still water, pine forest and long evenings. A slow trip for people who like early mornings.",
    highlights: [["mountain.2.fill", "Guided lakeside hikes", "Three easy routes"], ["sun.max.fill", "Sunrise boat rides", "Small groups of eight"], ["fork.knife", "Local kitchen dinners", "Included each night"]],
    days: [["Arrive and settle in", "Lodge check-in, evening walk"], ["Lake circuit", "12 km easy hike with lunch"], ["Boat day", "Sunrise ride and free afternoon"], ["Forest trail", "Guided walk to the viewpoint"], ["Slow morning", "Market visit and departure"]],
  },
  {
    id: "canyon", name: "Desert Canyon", region: "Red Plateau", tone: "orange", art: desertCanyon, nights: 4, price: 520, rating: 4.6, reviews: 187,
    blurb: "Layered rock, wide skies and cool nights. Walk the canyon floor at golden hour.",
    highlights: [["mountain.2.fill", "Canyon floor walks", "Guide and shade stops"], ["moon.stars.fill", "Night sky evening", "Stargazing with a host"], ["camera.fill", "Photo viewpoints", "Best light at sunset"]],
    days: [["Arrive at the rim", "Sunset viewpoint"], ["Canyon floor", "Half-day guided walk"], ["Rock and river", "Short drive and picnic"], ["Sunrise and depart", "Early viewpoint, then home"]],
  },
  {
    id: "harbour", name: "Harbour Town", region: "Coast", tone: "blue", art: harbourTown, nights: 3, price: 410, rating: 4.7, reviews: 254,
    blurb: "Cobbled streets, fresh bread and boats at every turn. Easy to explore on foot.",
    highlights: [["fork.knife", "Waterfront tasting walk", "Five small stops"], ["map.fill", "Old town tour", "Two hours, self-paced"], ["water.waves", "Harbour sunset sail", "Optional, 90 minutes"]],
    days: [["Arrive and stroll", "Check-in, harbour walk"], ["Old town", "Morning tour, market lunch"], ["Sail and depart", "Optional sail, late checkout"]],
  },
];
const usd = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function TravelFlow() {
  return (
    <NavigationStack backLabel="Trips">
      <Search />
    </NavigationStack>
  );
}

function Search() {
  const nav = useNavigation();
  const [depart, setDepart] = useState("2026-12-12T12:00:00Z");
  const [back, setBack] = useState("2026-12-17T12:00:00Z");
  const [people, setPeople] = useState(2);
  const [busy, setBusy] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [results, setResults] = useState(TRIPS);
  const search = () => { setBusy(true); setTimeout(() => { setResults([...TRIPS].sort((a, b) => b.rating - a.rating)); setBusy(false); }, 1200); };
  const open = (t: Trip) => nav?.push(<TripDetail trip={t} dates={`${fmt(depart)} to ${fmt(back)}`} people={people} />);

  return (
    <Screen background="grouped" header={<NavigationBar title="Trips" subtitle={`Where to next, ${ME.first}?`} trailing={[{ icon: "heart", label: "Saved trips", onPress: () => {} }]} account={account()} />}>
      <Stack gap="6">
        <Stack gap="none">
          <Stack padding="2">{null}</Stack>
          <List label="Search trips">
            <ListSection>
              <ListItem icon="location.fill" iconColor="blue" title="From" value="Harbour Town" />
              <ListItem icon="map.fill" iconColor="orange" title="To" value="Anywhere" accessory="chevron" onPress={() => {}} />
              <ListItem icon="calendar" iconColor="red" title="Depart" value={fmt(depart)} accessory="chevron" onPress={() => setPlanning(true)} />
              <ListItem icon="calendar" iconColor="green" title="Return" value={fmt(back)} accessory="chevron" onPress={() => setPlanning(true)} />
              <ListItem icon="person.2" iconColor="purple" title="Travellers" value={`${people} ${people === 1 ? "person" : "people"}`} accessory="chevron" onPress={() => setPlanning(true)} />
            </ListSection>
          </List>
          <Stack padding="inline">
            <Button variant="borderedProminent" size="large" fullWidth icon="magnifyingglass" label="Search" loading={busy} onPress={search} />
          </Stack>
        </Stack>

        <Stack gap="3">
          <Stack padding="inline"><SectionHeader title="Popular Destinations" actionLabel="See All" onAction={() => {}} /></Stack>
          <Stack direction="horizontal" scroll itemWidth={230} gap="3" padding="inline">
            {TRIPS.map((t) => (
              <Media key={t.id} ratio="4:3" radius="large" src={t.art} alt={t.name} onPress={() => open(t)}>
                <Glass variant="regular" shape="rect" cornerRadius={14}>
                  <Stack padding="2" gap="none">
                    <Text variant="subheadline" weight="semibold">{t.name}</Text>
                    <Text variant="caption1" color="secondary">From {usd(t.price)}</Text>
                  </Stack>
                </Glass>
              </Media>
            ))}
          </Stack>
        </Stack>

        <Stack gap="3">
          <Stack padding="inline"><SectionHeader title="Trips for your dates" /></Stack>
          <List label="Results">
            <ListSection footer={`${results.length} trips for ${people} ${people === 1 ? "traveller" : "travellers"}. Prices are per person.`}>
              {results.map((t) => (
                <ListItem
                  key={t.id}
                  prominent
                  leading={<Media ratio="1:1" radius="small" width={64} src={t.art} alt={t.name} />}
                  title={t.name}
                  subtitle={`${t.nights} nights · ${t.region}`}
                  detail={<Rating value={t.rating} size="small" tint="orange" label={`${t.rating} out of 5 stars`} />}
                  value={usd(t.price)}
                  accessory="chevron"
                  onPress={() => open(t)}
                />
              ))}
            </ListSection>
          </List>
        </Stack>
      </Stack>
      <Sheet open={planning} onClose={() => setPlanning(false)} detent="medium" showGrabber title="Dates and Travellers" confirmLabel="Done" onConfirm={() => setPlanning(false)}>
        <List label="Trip dates and travellers">
          <ListSection>
            <DatePicker label="Depart" value={depart} onChange={setDepart} formRow />
            <DatePicker label="Return" value={back} min={depart} onChange={setBack} formRow />
            <Stepper label="Travellers" value={people} min={1} max={9} onChange={setPeople} valueText={`${people} ${people === 1 ? "person" : "people"}`} formRow />
          </ListSection>
        </List>
      </Sheet>
    </Screen>
  );
}

function TripDetail({ trip: t, dates, people }: { trip: Trip; dates: string; people: number }) {
  const [confirm, setConfirm] = useState(false);
  const [booked, setBooked] = useState(false);
  const total = t.price * people;
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title={t.name} subtitle={t.region} displayMode="inline" />}
      bottomBar={
        <Stack padding="margin">
          <Button variant="glassProminent" size="large" fullWidth label={booked ? "Trip Booked" : `Book Trip · ${usd(total)}`} disabled={booked} onPress={() => setConfirm(true)} />
        </Stack>
      }
    >
      <Stack padding="margin" gap="3">
        <Media ratio="4:3" radius="large" src={t.art} alt={t.name}>
          <Glass variant="regular" shape="rect" cornerRadius={18}>
            <Stack padding="3" gap="1">
              <Text variant="title3" weight="bold">{t.name}</Text>
              <Stack direction="horizontal" gap="2" align="center">
                <Rating value={t.rating} size="small" tint="orange" label={`${t.rating} out of 5 stars`} />
                <Text variant="caption1" color="secondary">{t.rating} · {t.reviews} reviews</Text>
              </Stack>
            </Stack>
          </Glass>
        </Media>
        <Text variant="body" color="secondary">{t.blurb}</Text>
      </Stack>
      <List label="Trip details">
        <ListSection header="Highlights">
          {t.highlights.map(([icon, title, sub]) => <ListItem key={title} icon={icon} iconColor={t.tone} title={title} subtitle={sub} />)}
        </ListSection>
        <ListSection header="Itinerary" footer={`${t.nights} nights · ${dates}`}>
          {t.days.map(([title, sub], i) => (
            <ListItem key={title} prominent leading={<Stack align="center" gap="none"><Text variant="caption2" weight="semibold" color="accent">DAY</Text><Text variant="title3" weight="bold" design="rounded">{i + 1}</Text></Stack>} title={title} subtitle={sub} />
          ))}
        </ListSection>
      </List>
      <Sheet open={confirm} onClose={() => setConfirm(false)} detent="medium" showGrabber title="Confirm Booking" cancelLabel="Cancel" onCancel={() => setConfirm(false)} confirmLabel="Confirm" onConfirm={() => { setConfirm(false); setBooked(true); }}>
        <List label="Booking summary">
          <ListSection footer="You can cancel for free up to 7 days before departure.">
            <ListItem title="Trip" value={t.name} />
            <ListItem title="Dates" value={dates} />
            <ListItem title="Travellers" value={`${people}`} />
            <ListItem title="Total" value={usd(total)} />
          </ListSection>
        </List>
      </Sheet>
      <Banner open={booked} tone="success" icon="checkmark.circle.fill" title="Trip booked" message={`${t.name}, ${dates}. Details are in your email.`} onDismiss={() => setBooked(false)} dismissLabel="Dismiss" />
    </Screen>
  );
}
