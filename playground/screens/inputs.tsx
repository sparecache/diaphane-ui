// Input screens (ids registered in screens/index.tsx).
import { Form } from "../../src/components/Form";
import { ListSection } from "../../src/components/ListSection";
import { ListItem } from "../../src/components/ListItem";
import { Toggle } from "../../src/components/Toggle";
import { TextField } from "../../src/components/TextField";
import { FieldError } from "../../src/components/FieldError";
import { Slider } from "../../src/components/Slider";
import { Stepper } from "../../src/components/Stepper";
import { Picker } from "../../src/components/Picker";
import { DatePicker } from "../../src/components/DatePicker";



/** Fixed date: 2026-11-20 10:00 UTC. */
const fixedDate = "2026-11-20T10:00:00Z";

/** Playground screen. */
export function FormControlsScreen() {
  return (
    <div className="pg-ref grouped">
      <Form>
        <ListSection header="Toggles">
          <ListItem title="Wi‑Fi" accessory="toggle" toggled />
          <ListItem title="Bluetooth" accessory="toggle" toggled={false} />
          <ListItem title="Disabled On" accessory="toggle" toggled disabled />
        </ListSection>
        <ListSection header="Values">
          <Stepper formRow label="Quantity: 3" value={3} />
          <Slider formRow label="Value" value={0.4} />
          <Picker formRow label="Sort By" value="Date" options={[{ value: "Date", label: "Date" }, { value: "Name", label: "Name" }]} />
          <DatePicker formRow label="Date" value={fixedDate} mode="date" locale="en-GB" />
          <DatePicker formRow label="Time" value={fixedDate} mode="time" locale="en-GB" />
        </ListSection>
        <ListSection>
          <Picker
            formRow
            variant="segmented"
            label="Range"
            labelHidden
            value="1"
            options={[{ value: "0", label: "Day" }, { value: "1", label: "Week" }, { value: "2", label: "Month" }]}
          />
        </ListSection>
      </Form>
    </div>
  );
}

/** Playground screen. */
export function SlidersScreen() {
  return (
    <div className="pg-ref">
      <div style={{ display: "flex", flexDirection: "column", gap: 28, alignSelf: "stretch" }}>
        <Slider label="Value" value={0} />
        <Slider label="Value" value={0.5} />
        <Slider label="Value" value={1} />
        <Slider label="Volume" value={0.3} minIcon="speaker.fill" maxIcon="speaker.wave.3.fill" />
        <Slider label="Value" value={0.6} step={0.25} />
        <Slider label="Value" value={0.5} disabled />
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Stepper label="Value" labelHidden value={1} />
          <Stepper label="Value" labelHidden value={0} min={0} max={5} />
          {/* The switch is laid out 61pt wide but drawn 63pt, overhanging 2pt. */}
          <div style={{ width: 61 }}><Toggle label="On" labelHidden checked /></div>
          <div style={{ width: 61 }}><Toggle label="Off" labelHidden checked={false} /></div>
        </div>
      </div>
    </div>
  );
}

/** Playground screen. */
export function TextFieldsFormScreen() {
  return (
    <div className="pg-ref grouped">
      <Form>
        <ListSection header="Account">
          <TextField label="Name" labelHidden placeholder="Name" value="" />
          <TextField label="Email" labelHidden type="email" placeholder="Email" value="jane@example.com" />
          <TextField label="Password" labelHidden type="password" placeholder="Password" value="secret12" />
        </ListSection>
        <ListSection>
          <TextField label="Phone" type="tel" placeholder="Required" value="" required invalid />
        </ListSection>
        <FieldError text="Enter a valid phone number." />
        <ListSection header="Notes">
          <TextField label="Notes" labelHidden placeholder="Add a note" value="" multiline minLines={3} maxLines={5} />
        </ListSection>
      </Form>
    </div>
  );
}

/** Playground screen. */
export function TextFieldsStandaloneScreen() {
  return (
    <div className="pg-ref">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignSelf: "stretch" }}>
        <TextField variant="roundedBorder" label="Rounded border" labelHidden placeholder="Rounded border" value="" />
        <TextField variant="roundedBorder" label="Filled" labelHidden placeholder="Filled" value="Text value" />
        <TextField variant="plain" label="Plain" labelHidden placeholder="Plain" value="" />
        <TextField
          variant="roundedBorder"
          type="search"
          label="Search"
          labelHidden
          placeholder="Search"
          value=""
          trailingIcon="mic.fill"
          trailingIconLabel="Dictate"
        />
      </div>
    </div>
  );
}
