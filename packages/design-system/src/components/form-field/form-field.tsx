/**
 * FormField (issue #12) — the label/control/description/error wiring
 * pattern.
 *
 * A composition PATTERN, not a form framework: no validation rules, no
 * state management, no submission handling. The consumer owns
 * validation and expresses its result through props; FormField owns
 * the wiring that is easy to get wrong by hand:
 *
 *   - the label's `htmlFor` targets the control's `id` (an accessible
 *     name by real label association, not `aria-label`);
 *   - the control's `aria-describedby` lists the description id always
 *     and the error id exactly when an error is present — no dangling
 *     idrefs (dangling references fail axe);
 *   - an error present on the field marks the control
 *     `aria-invalid="true"` and renders the message as a `role="alert"`
 *     paragraph, so it is announced when it appears;
 *   - `required` reaches the control as the native attribute (screen
 *     readers announce it; the browser blocks empty submission) and
 *     the label shows a visible marker that is `aria-hidden` so it is
 *     not read as "star".
 *
 * Input stays independent of FormField: this pattern composes the
 * Input component (via `FormFieldControl`), never the other way
 * around. A bare `<Input>` with consumer-owned labeling is always a
 * valid alternative for one-off cases (see the docs page).
 *
 * Parts: `FormField` (wrapper + wiring context), `FormFieldControl`
 * (the composition slot for the Input), `FormFieldLabel`,
 * `FormFieldDescription`, `FormFieldError` (rendered automatically
 * from the `label`/`description`/`error` props; exported for custom
 * compositions that take their wiring into their own hands).
 *
 * Styling: layout-only CSS (`./form-field.css`) through semantic role
 * custom properties; the control's visuals come from Input itself.
 */
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cx } from "../../internal/cx";
import { Input, type InputProps } from "../input/input";

interface FormFieldContextValue {
  /** The control's id — the label's htmlFor target. */
  controlId: string;
  /** The description paragraph's id, when a description is wired. */
  descriptionId: string | undefined;
  /** The error paragraph's id, when an error is wired. */
  errorId: string | undefined;
  /** Required semantics owned by the field and applied to the control. */
  required: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField(): FormFieldContextValue {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error(
      "FormField parts must be rendered inside a <FormField> component.",
    );
  }
  return context;
}

export type FormFieldProps = ComponentProps<"div"> & {
  /** Field label content, rendered as a `<label>` wired to the control. */
  label: ReactNode;
  /** Helper text, wired to the control as its accessible description. */
  description?: ReactNode;
  /**
   * Error message. Presence marks the control `aria-invalid="true"`,
   * includes the error id in its `aria-describedby`, and renders the
   * message with `role="alert"`. Pass `undefined` when the field is
   * valid — validation ownership stays with the consumer.
   */
  error?: ReactNode;
  /** Required semantics: native `required` on the control, visible (aria-hidden) marker in the label. */
  required?: boolean;
};

/** The field wrapper: wires the parts and lays them out vertically. */
export function FormField({
  label,
  description,
  error,
  required = false,
  className,
  children,
  ...props
}: FormFieldProps) {
  const id = useId();
  const descriptionId = description !== undefined ? `${id}-description` : undefined;
  const errorId = error !== undefined ? `${id}-error` : undefined;
  const context: FormFieldContextValue = {
    controlId: id,
    descriptionId,
    errorId,
    required,
  };
  return (
    <FormFieldContext.Provider value={context}>
      <div
        {...props}
        data-invalid={error !== undefined || undefined}
        className={cx("aug-form-field", className)}
      >
        <FormFieldLabel>{label}</FormFieldLabel>
        {children}
        {description !== undefined ? (
          <FormFieldDescription>{description}</FormFieldDescription>
        ) : null}
        {error !== undefined ? <FormFieldError>{error}</FormFieldError> : null}
      </div>
    </FormFieldContext.Provider>
  );
}

export type FormFieldControlProps = Omit<
  InputProps,
  "id" | "aria-describedby" | "aria-invalid" | "invalid"
>;

/**
 * The composition slot for the field's control. Renders the Input with
 * the wiring owned by FormField: `id`, `aria-describedby`
 * (description + error when invalid), `aria-invalid` (derived from the
 * field's `error` prop), and `required`. The consumer passes the rest
 * (`type`, `value`/`onChange` or `defaultValue`, `disabled`,
 * `readOnly`, …) straight through — controlled and uncontrolled usage
 * are plain React.
 */
export function FormFieldControl(props: FormFieldControlProps) {
  const { controlId, descriptionId, errorId, required } = useFormField();
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");
  return (
    <Input
      {...props}
      id={controlId}
      required={required || props.required}
      invalid={errorId !== undefined}
      aria-describedby={describedBy === "" ? undefined : describedBy}
    />
  );
}

export type FormFieldLabelProps = ComponentProps<"label">;

/**
 * The field's label, wired to the control with `htmlFor`. Rendered
 * automatically from the `label` prop; exported for custom
 * compositions that own their wiring. The required marker is
 * `aria-hidden` — the native `required` attribute carries the
 * semantics.
 */
export function FormFieldLabel({
  className,
  children,
  ...props
}: FormFieldLabelProps) {
  const { controlId, required } = useFormField();
  return (
    <label
      {...props}
      htmlFor={props.htmlFor ?? controlId}
      className={cx("aug-form-field-label", "augur-type-control", className)}
    >
      {children}
      {required ? (
        <span className="aug-form-field-required" aria-hidden="true">
          {"*"}
        </span>
      ) : null}
    </label>
  );
}

export type FormFieldDescriptionProps = ComponentProps<"p">;

/**
 * Helper text in the metadata voice, `--muted-foreground`. Rendered
 * automatically from the `description` prop; exported for custom
 * compositions. Never carries required information alone — it
 * supplements the label.
 */
export function FormFieldDescription({
  className,
  children,
  ...props
}: FormFieldDescriptionProps) {
  const { descriptionId } = useFormField();
  return (
    <p
      {...props}
      id={props.id ?? descriptionId}
      className={cx("aug-form-field-description", "augur-type-metadata", className)}
    >
      {children}
    </p>
  );
}

export type FormFieldErrorProps = ComponentProps<"p">;

/**
 * The error message. Rendered automatically from the `error` prop with
 * `role="alert"` so its appearance is announced; exported for custom
 * compositions. The text — never color alone — names the problem
 * (theme decision D1: the brand defines no danger hue).
 */
export function FormFieldError({
  className,
  children,
  ...props
}: FormFieldErrorProps) {
  const { errorId } = useFormField();
  return (
    <p
      {...props}
      id={props.id ?? errorId}
      role="alert"
      className={cx("aug-form-field-error", "augur-type-metadata", className)}
    >
      {children}
    </p>
  );
}
