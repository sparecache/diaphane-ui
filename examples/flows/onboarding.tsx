import { useEffect, useRef, useState } from "react";
import welcomePlan from "./art/welcome-plan.svg";
import welcomeTrack from "./art/welcome-track.svg";
import welcomeStyle from "./art/welcome-style.svg";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, Stack, Text, Button, Media, Glass, PageControl, Form, ListSection, TextField,
  SegmentedControl, Banner, EmptyState,
} from "../../src/index";

/** Onboarding flow: welcome carousel (3 pages) -> sign in / create account (pushed) -> success. */
const PAGES: { art: string; title: string; copy: string; tag: string; note: string }[] = [
  { art: welcomePlan, title: "Plan your day with ease", copy: "Everything you need for today, gathered in one calm place.", tag: "Today", note: "3 things to do, next up is a morning walk" },
  { art: welcomeTrack, title: "Stay on track, gently", copy: "Small reminders and simple goals that fit around your life.", tag: "This week", note: "5 day streak, keep it going" },
  { art: welcomeStyle, title: "Make it yours", copy: "Choose your colours, your pace and what shows up first.", tag: "Your style", note: "Pick a colour and a daily rhythm" },
];

export default function OnboardingFlow() {
  return (
    <NavigationStack backLabel="Back">
      <Welcome />
    </NavigationStack>
  );
}

function Welcome() {
  const nav = useNavigation();
  const [page, setPage] = useState(0);
  const p = PAGES[page]!;
  const last = page === PAGES.length - 1;
  const start = () => nav?.push(<SignIn />);
  return (
    <Screen
      header={<NavigationBar title="" displayMode="inline" trailing={last ? [] : [{ label: "Skip", onPress: start }]} />}
      bottomBar={
        <Stack padding="margin" gap="3">
          <Button size="large" fullWidth label={last ? "Get Started" : "Continue"} onPress={last ? start : () => setPage(page + 1)} />
          <Button variant="borderless" fullWidth label="I Already Have an Account" onPress={start} />
        </Stack>
      }
    >
      <Stack grow justify="center" padding="margin" gap="6" align="center">
        <Media ratio="1:1" radius="large" src={p.art} alt={p.title}>
          <Stack gap="5" align="center">
            <PageControl label="Welcome pages" count={PAGES.length} current={page} onChange={setPage} background />
            <Glass variant="regular" shape="rect" cornerRadius={18}>
              <Stack padding="3" gap="1">
                <Text variant="caption1" weight="semibold" color="secondary">{p.tag}</Text>
                <Text variant="subheadline" weight="semibold">{p.note}</Text>
              </Stack>
            </Glass>
          </Stack>
        </Media>
        <Stack gap="2" align="center">
          <Text variant="title1" weight="bold" align="center" as="h1">{p.title}</Text>
          <Text variant="body" color="secondary" align="center">{p.copy}</Text>
        </Stack>
      </Stack>
    </Screen>
  );
}

function SignIn() {
  const nav = useNavigation();
  const [mode, setMode] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const create = mode === 1;
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const passOk = password.length >= 8;
  const submit = () => {
    setTouched(true);
    if (!emailOk || !passOk || loading) return;
    setLoading(true);
    timer.current = window.setTimeout(() => { setLoading(false); nav?.push(<Done create={create} />); }, 1200);
  };
  return (
    <Screen background="grouped" header={<NavigationBar title={create ? "Create Account" : "Sign In"} displayMode="inline" />}>
      <Stack gap="4">
        <Stack padding="margin" gap="4">
          <Stack gap="1">
            <Text variant="title2" weight="bold" as="h2">{create ? "Let's get you set up" : "Welcome back"}</Text>
            <Text variant="subheadline" color="secondary">{create ? "It only takes a minute." : "Sign in to pick up where you left off."}</Text>
          </Stack>
          <SegmentedControl label="Account" segments={[{ label: "Sign In" }, { label: "Create Account" }]} selected={mode} onChange={setMode} />
        </Stack>
        <Form label={create ? "Create account" : "Sign in"} onSubmit={submit}>
          <ListSection footer={create ? "Use at least 8 characters." : undefined}>
            <TextField variant="form" type="email" label="Email" placeholder="name@example.com" value={email} onChange={setEmail}
              invalid={touched && !emailOk} errorText={touched && !emailOk ? "Enter a valid email address." : undefined} />
            <TextField variant="form" type="password" label="Password" placeholder="Required" value={password} onChange={setPassword}
              invalid={touched && !passOk} errorText={touched && !passOk ? "Use at least 8 characters." : undefined} />
          </ListSection>
        </Form>
        <Stack padding="margin" gap="3" align="center">
          <Button size="large" fullWidth label={create ? "Create Account" : "Sign In"} loading={loading} onPress={submit} />
          <Button variant="bordered" size="large" fullWidth icon="person.crop.circle" label="Continue with a Passkey" onPress={() => nav?.push(<Done create={create} />)} />
          <Text variant="footnote" color="secondary" align="center">By continuing, you agree to the Terms of Use and the Privacy Policy.</Text>
        </Stack>
      </Stack>
    </Screen>
  );
}

function Done({ create }: { create: boolean }) {
  const nav = useNavigation();
  const [shown, setShown] = useState(true);
  return (
    <Screen header={<NavigationBar title="" displayMode="inline" />}>
      <Banner open={shown} tone="success" icon="checkmark.circle.fill" title={create ? "Account created" : "Signed in"} message="Your details are saved." onDismiss={() => setShown(false)} dismissLabel="Dismiss" />
      <EmptyState icon="checkmark.circle.fill" title="You're all set" description="Your space is ready. Take a look around whenever you like." actions={[{ label: "Start Exploring", onPress: () => nav?.popToRoot() }]} />
    </Screen>
  );
}
