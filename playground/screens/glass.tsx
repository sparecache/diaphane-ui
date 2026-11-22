import { Button } from "../../src/components/Button";
import { IconButton } from "../../src/components/IconButton";
import { Card } from "../../src/components/Card";
import { Glass, type GlassProps } from "../../src/components/Glass";
import { Text } from "../../src/components/Text";
import "./glass.css";

const at = (x: number, y: number) => ({ left: x, top: y });

/** Playground screen: glass over colour bands and black/white stripes. */
export function GlassLabScreen() {
  return (
    <div className="pg-glass">
      <div className="pg-glass__bands" />
      <div className="pg-glass__stripes" />
      <span className="pg-glass__at pg-glass__title" style={at(201, 300)}>Glass</span>
      <span className="pg-glass__at" style={at(90, 110)}><Button variant="glass" label="Glass" /></span>
      <span className="pg-glass__at" style={at(201, 110)}><IconButton variant="glass" icon="plus" label="Add" /></span>
      <span className="pg-glass__at" style={at(312, 110)}><Button variant="glassProminent" label="Prominent" /></span>
      <span className="pg-glass__at" style={at(201, 175)}><Button variant="glass" size="large" label="Large glass" /></span>
      <span className="pg-glass__at pg-glass__card" style={at(201, 370)}><Card variant="glass"><span>Glass card</span></Card></span>
      <span className="pg-glass__at pg-glass__capsule" style={at(201, 500)}><Card variant="glass"><span>Capsule</span></Card></span>
      <span className="pg-glass__at" style={at(80, 590)}><IconButton variant="glass" size="large" icon="xmark" label="Close" /></span>
      <span className="pg-glass__at" style={at(201, 590)}><Button variant="glass" label="Glass" /></span>
      <span className="pg-glass__at" style={at(322, 590)}><Button variant="glassProminent" label="Prominent" /></span>
      <span className="pg-glass__at pg-glass__card" style={at(201, 700)}><Card variant="glass"><span>Glass card</span></Card></span>
    </div>
  );
}

const levels: [string, Pick<GlassProps, "variant" | "tint">][] = [
  ["Regular", { variant: "regular" }], ["Clear", { variant: "clear" }],
  ["Tinted", { variant: "regular", tint: "blue" }], ["Clear tint", { variant: "clear", tint: "blue" }],
];

/** Playground screen: each Glass level as a 170 × 56 capsule. */
export function GlassLevelsScreen() {
  return (
    <div className="pg-glass">
      <div className="pg-glass__bands" />
      <div className="pg-glass__stripes" />
      {levels.flatMap(([name, g], i) => [130, 510].flatMap((y0) => [
        <span key={`${name}${y0}l`} className="pg-glass__at pg-glass__level" style={at(105, y0 + i * 76)}><Glass {...g}><Text>{name}</Text></Glass></span>,
        <span key={`${name}${y0}r`} className="pg-glass__at pg-glass__level" style={at(297, y0 + i * 76)}><Glass {...g} /></span>,
      ]))}
    </div>
  );
}
