import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: any;
  value: any;
  onChange: (name: string, value: any) => void;
}) {
  const commonProps = {
    required: field.required,
  };

  switch (field.type) {
    /* ---------------- TEXT INPUTS ---------------- */
    case "text":
    case "email":
    case "number":
    case "date":
      return (
        <div className="space-y-1">
          <label className="text-sm text-white/70">{field.label}</label>
          <Input
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            {...commonProps}
          />
        </div>
      );

    /* ---------------- TEXTAREA ---------------- */
    case "textarea":
      return (
        <div className="space-y-1">
          <label className="text-sm text-white/70">{field.label}</label>
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            {...commonProps}
          />
        </div>
      );

    /* ---------------- SELECT ---------------- */
    case "select":
      return (
        <div className="space-y-1">
          <label className="text-sm text-white/70">{field.label}</label>
          <select
            className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    /* ---------------- RADIO ---------------- */
    case "radio":
      return (
        <div className="space-y-2">
          <p className="text-sm text-white/70">{field.label}</p>
          {field.options?.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(field.name, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      );

    /* ---------------- CHECKBOX ---------------- */
    case "checkbox":
      return (
        <div className="space-y-2">
          <p className="text-sm text-white/70">{field.label}</p>
          {field.options?.map((opt: string) => {
            const current: string[] = value || [];
            const checked = current.includes(opt);

            return (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? current.filter((v) => v !== opt)
                      : [...current, opt];
                    onChange(field.name, next);
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );

    /* ---------------- FALLBACK ---------------- */
    default:
      return (
        <div className="space-y-1">
          <label className="text-sm text-white/70">{field.label}</label>
          <Input
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        </div>
      );
  }
}
