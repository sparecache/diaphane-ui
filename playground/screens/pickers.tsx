// Picker screens (ids registered in screens/index.tsx).
import { useState } from "react";
import { Form } from "../../src/components/Form";
import { Screen } from "../../src/components/Screen";
import { ListSection } from "../../src/components/ListSection";
import { Picker } from "../../src/components/Picker";
import { DatePicker } from "../../src/components/DatePicker";

/** Fixed date = 2026-11-20 10:00 UTC; the screens force UTC + en_US. */
const fixedDate = "2026-11-20T10:00:00Z";
const tz = "UTC";


const flavors = ["Chocolate", "Vanilla", "Strawberry", "Mint", "Caramel", "Pistachio", "Mango"].map((f) => ({ value: f, label: f }));
const counts = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const units = ["minutes", "hours", "days", "weeks"].map((u) => ({ value: u, label: u }));

/** Playground screen: graphical date + time in a Form section. */
export function DatePickerGraphicalScreen() {
  const [date, setDate] = useState(fixedDate);
  return (
    <Screen background="grouped">
      <Form>
        <ListSection>
          <DatePicker formRow variant="graphical" mode="dateTime" label="Date" timeLabel="Time" value={date} onChange={setDate} timeZone={tz} />
        </ListSection>
      </Form>
    </Screen>
  );
}

/** Playground screen: date wheels, date + time wheels, countdown (1 h 30 min). */
export function DatePickerWheelScreen() {
  const [date, setDate] = useState(fixedDate);
  const [dateTime, setDateTime] = useState(fixedDate);
  const [timer, setTimer] = useState("PT1H30M");
  return (
    <div className="pg-ref" style={{ paddingInline: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch" }}>
        <DatePicker variant="wheels" mode="date" label="Date" labelHidden value={date} onChange={setDate} timeZone={tz} />
        <DatePicker variant="wheels" mode="dateTime" label="Date and time" labelHidden value={dateTime} onChange={setDateTime} timeZone={tz} />
        <DatePicker variant="wheels" mode="countdown" label="Timer" labelHidden value={timer} onChange={setTimer} />
      </div>
    </div>
  );
}

/** Playground screen: navigationLink row, single wheel, two-column wheel. */
export function PickerWheelScreen() {
  const [flavor, setFlavor] = useState("Mint");
  const [count, setCount] = useState("3");
  const [unit, setUnit] = useState("hours");
  return (
    <Screen background="grouped">
      <Form>
        <ListSection>
          <Picker variant="navigationLink" label="Flavor" value={flavor} options={flavors} onNavigate={() => {}} />
        </ListSection>
        <ListSection>
          <Picker formRow variant="wheel" label="Flavor" labelHidden value={flavor} options={flavors} onChange={setFlavor} />
        </ListSection>
        <ListSection>
          <Picker
            formRow
            variant="wheel"
            label="Reminder"
            labelHidden
            value=""
            options={[]}
            columns={[{ label: "Count", options: counts, value: count }, { label: "Unit", options: units, value: unit }]}
            onColumnChange={(c, v) => (c === 0 ? setCount(v) : setUnit(v))}
          />
        </ListSection>
      </Form>
    </Screen>
  );
}
