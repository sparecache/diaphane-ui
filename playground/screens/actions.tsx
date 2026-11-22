import { Button, type ButtonVariant, type ButtonSize } from "../../src/components/Button";
import { IconButton } from "../../src/components/IconButton";

const styles: ButtonVariant[] = ["glassProminent", "glass", "borderedProminent", "bordered", "borderless", "plain"];

export function ButtonStylesScreen() {
  return (
    <div className="pg-ref" style={{ gap: 16 }}>
      {styles.map((v) => (
        <div key={v} className="pg-row">
          <Button variant={v} label="Button" />
          <Button variant={v} label="Delete" role="destructive" />
          <Button variant={v} label="Disabled" disabled />
        </div>
      ))}
      <div className="pg-row">
        <Button variant="borderedProminent" shape="roundedRectangle" label="Rounded" />
        <Button variant="bordered" label="Capsule" />
        <IconButton variant="glass" icon="plus" label="Add" />
        <IconButton variant="glassProminent" icon="plus" label="Add" />
        <IconButton variant="bordered" icon="plus" label="Add" />
      </div>
      <div className="pg-row">
        <Button variant="borderedProminent" icon="plus" label="Add" />
        <Button variant="glass" icon="square.and.arrow.up" label="Share" />
      </div>
    </div>
  );
}

const sizes: ButtonSize[] = ["small", "small", "regular", "large", "large"];

export function ButtonSizesScreen() {
  return (
    <div className="pg-ref" style={{ gap: 12, alignItems: "stretch" }}>
      {sizes.map((s, i) => (
        <div key={i} className="pg-row">
          <Button variant="borderedProminent" size={s} label="Button" />
          <Button variant="bordered" size={s} label="Button" />
          <Button variant="glass" size={s} label="Button" />
        </div>
      ))}
      <Button variant="borderedProminent" size="large" fullWidth label="Continue" />
      <Button variant="glassProminent" size="large" fullWidth label="Continue" />
    </div>
  );
}
