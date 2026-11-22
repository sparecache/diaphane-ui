import { useState } from "react";
import { Screen, NavigationBar, List, ListSection, ListItem, Avatar } from "../src/index";

/** Reference screen: Settings — large title, profile row, toggles, values and navigation rows. */
export default function SettingsExample() {
  const [airplane, setAirplane] = useState(false);
  const [vpn, setVpn] = useState(true);
  return (
    <Screen background="grouped" header={<NavigationBar title="Settings" />}>
      <List label="Settings">
        <ListSection>
          <ListItem
            prominent
            leading={<Avatar initials="JD" name="Jane Doe" size="large" />}
            title="Jane Doe"
            subtitle="Account, sync, and more"
            accessory="chevron"
            onPress={() => {}}
          />
        </ListSection>
        <ListSection>
          <ListItem title="Airplane Mode" icon="airplane" iconColor="orange" accessory="toggle" toggled={airplane} onToggle={setAirplane} />
          <ListItem title="Wi‑Fi" icon="wifi" iconColor="blue" value={airplane ? "Off" : "Home"} accessory="chevron" onPress={() => {}} />
          <ListItem title="Bluetooth" icon="antenna.radiowaves.left.and.right" iconColor="blue" value="On" accessory="chevron" onPress={() => {}} />
          <ListItem title="Cellular" icon="antenna.radiowaves.left.and.right" iconColor="green" accessory="chevron" onPress={() => {}} />
          <ListItem title="VPN" icon="network" iconColor="indigo" accessory="toggle" toggled={vpn} onToggle={setVpn} />
        </ListSection>
        <ListSection>
          <ListItem title="Notifications" icon="bell.badge.fill" iconColor="red" accessory="chevron" onPress={() => {}} />
          <ListItem title="Sounds & Haptics" icon="speaker.wave.3.fill" iconColor="pink" accessory="chevron" onPress={() => {}} />
          <ListItem title="Focus" icon="moon.fill" iconColor="indigo" accessory="chevron" onPress={() => {}} />
          <ListItem title="Screen Time" icon="hourglass" iconColor="indigo" accessory="chevron" onPress={() => {}} />
        </ListSection>
        <ListSection footer="Software Update installs overnight while your phone is charging.">
          <ListItem title="General" icon="gearshape.fill" iconColor="gray" badge={1} accessory="chevron" onPress={() => {}} />
          <ListItem title="Display & Brightness" icon="sun.max.fill" iconColor="blue" accessory="chevron" onPress={() => {}} />
          <ListItem title="Privacy & Security" icon="hand.raised.fill" iconColor="blue" accessory="chevron" onPress={() => {}} />
        </ListSection>
      </List>
    </Screen>
  );
}
