import type { FormEvent, ReactNode } from "react";
import { List } from "./List";
import "./Form.css";

export interface FormProps {
  /** ListSection elements (rows hold TextField, Toggle, Picker, ListItem…). */
  children: ReactNode;
  /** Called on submit (Return in the last field, or a submit Button). The default page reload is prevented. */
  onSubmit?: () => void;
  /** Accessible name for the form. */
  label?: string;
  testId?: string;
}

/** Settings-style form: an inset-grouped List with <form> semantics. */
export function Form({ children, onSubmit, label, testId }: FormProps) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form className="dph-form" onSubmit={submit} aria-label={label} noValidate data-testid={testId}>
      <List variant="insetGrouped">{children}</List>
    </form>
  );
}
