import { Chart } from "../../src/components/Chart";
import { Text } from "../../src/components/Text";

const steps = [["Mon", 6200], ["Tue", 8400], ["Wed", 5100], ["Thu", 9700], ["Fri", 7300], ["Sat", 11200], ["Sun", 4300]] as const;
const rate = [["Mon", 62], ["Tue", 68], ["Wed", 65], ["Thu", 71], ["Fri", 66], ["Sat", 74], ["Sun", 69]] as const;
const spend = [["Food", 420], ["Transport", 180], ["Shopping", 260], ["Bills", 340]] as const;
const toData = (rows: readonly (readonly [string, number])[]) => rows.map(([label, value]) => ({ label, value }));

/** Playground screen. */
export function ChartsScreen() {
  return (
    <div className="pg-ref" style={{ gap: 14, alignItems: "stretch" }}>
      <Text variant="headline">Steps</Text>
      <Chart kind="bar" label="Steps" data={toData(steps)} />
      <Text variant="headline">Resting heart rate</Text>
      <Chart kind="line" label="Resting heart rate" data={toData(rate)} area points />
      <Text variant="headline">Spending</Text>
      <Chart kind="donut" label="Spending" data={toData(spend)} />
    </div>
  );
}
