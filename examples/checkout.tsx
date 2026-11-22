import { useState } from "react";
import {
  Screen, NavigationBar, Form, ListSection, ListItem, TextField, Picker, Button, Stack, Alert, Banner,
} from "../src/index";

const DELIVERY = [
  { value: "standard", label: "Standard (Free)" },
  { value: "express", label: "Express ($9.99)" },
  { value: "pickup", label: "Pick Up in Store" },
];

/** Reference screen: Checkout — grouped form, validation, picker, confirm Alert, loading Button, success Banner. */
export default function CheckoutExample() {
  const [name, setName] = useState("Jane Doe");
  const [address, setAddress] = useState("12 Market Street");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState("standard");
  const [gift, setGift] = useState(false);
  const [promo, setPromo] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const promoInvalid = promo.length > 0 && promo.toUpperCase() !== "GLASS10";
  const phoneInvalid = phone.length > 0 && phone.replace(/\D/g, "").length < 10;
  const shipping = delivery === "express" ? 9.99 : 0;
  const discount = promo.toUpperCase() === "GLASS10" ? 10 : 0;
  const total = 119 + shipping + (gift ? 5 : 0) + 10.71 - discount;
  const money = (n: number) => `$${n.toFixed(2)}`;

  const place = () => {
    setConfirming(false);
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setPlaced(true); }, 1200);
  };

  return (
    <>
      <Screen background="grouped" header={<NavigationBar title="Checkout" displayMode="inline" backLabel="Bag" onBack={() => {}} />}>
        <Form label="Checkout" onSubmit={() => setConfirming(true)}>
          <ListSection header="Shipping">
            <TextField label="Name" labelHidden placeholder="Full Name" value={name} onChange={setName} required />
            <TextField label="Address" labelHidden placeholder="Street Address" value={address} onChange={setAddress} required />
            <TextField
              label="Phone"
              labelHidden
              type="tel"
              placeholder="Phone (Optional)"
              value={phone}
              onChange={setPhone}
              invalid={phoneInvalid}
              errorText={phoneInvalid ? "Enter a 10-digit phone number." : undefined}
            />
          </ListSection>
          <ListSection header="Delivery" footer="Express orders placed before 2 PM ship the same day.">
            <Picker label="Method" options={DELIVERY} value={delivery} onChange={setDelivery} formRow />
            <ListItem title="Gift Wrap" subtitle="Add a note and recycled paper (+$5.00)" accessory="toggle" toggled={gift} onToggle={setGift} />
          </ListSection>
          <ListSection header="Payment">
            <ListItem title="Visa •••• 4242" icon="creditcard.fill" iconColor="blue" accessory="chevron" onPress={() => {}} />
            <TextField
              label="Promo Code"
              labelHidden
              placeholder="Promo Code"
              value={promo}
              onChange={setPromo}
              invalid={promoInvalid}
              errorText={promoInvalid ? "This code isn't valid." : undefined}
              hint={promoInvalid ? undefined : "Try GLASS10 for $10 off."}
            />
          </ListSection>
          <ListSection header="Summary">
            <ListItem title="Subtotal" value={money(119)} />
            <ListItem title="Shipping" value={shipping ? money(shipping) : "Free"} />
            {gift && <ListItem title="Gift Wrap" value={money(5)} />}
            {discount > 0 && <ListItem title="Promo" value={`−${money(discount)}`} />}
            <ListItem title="Tax" value={money(10.71)} />
            <ListItem title="Total" value={money(total)} />
          </ListSection>
          <Stack padding="inline">
            <Button type="submit" variant="borderedProminent" size="large" fullWidth label="Place Order" loading={placing} disabled={!name || !address || phoneInvalid} />
          </Stack>
        </Form>
      </Screen>

      <Alert
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Place Order?"
        message={`Your Visa ending in 4242 will be charged ${money(total)}.`}
        actions={[
          { label: "Cancel", role: "cancel" },
          { label: "Place Order", onPress: place },
        ]}
      />
      <Banner
        open={placed}
        tone="success"
        title="Order Placed"
        message="Arriving Tuesday, November 24."
        actionLabel="View"
        onAction={() => setPlaced(false)}
        onDismiss={() => setPlaced(false)}
        dismissLabel="Dismiss"
      />
    </>
  );
}
