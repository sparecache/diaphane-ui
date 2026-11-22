// The README quick-start, kept here so it is type-checked with the rest of the project.
import { useState } from "react";
import Frame from "../frame/phone";
import { Screen, NavigationBar, List, ListSection, ListItem } from "../src/index";

export default function App() {
  const [wifi, setWifi] = useState(true);
  return (
    <Frame theme="dark">
      <Screen background="grouped" header={<NavigationBar title="Settings" />}>
        <List label="Settings">
          <ListSection header="Connectivity">
            <ListItem title="Wi‑Fi" icon="wifi" iconColor="blue" accessory="toggle" toggled={wifi} onToggle={setWifi} />
            <ListItem title="Bluetooth" icon="antenna.radiowaves.left.and.right" iconColor="blue" value="On" accessory="chevron" onPress={() => {}} />
          </ListSection>
        </List>
      </Screen>
    </Frame>
  );
}
