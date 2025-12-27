"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { FieldRenderer } from "../inline-renderers/public-form-renderer";

export default function PublicFormClient({ profile, form }: any) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(name: string, value: any) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);

    // 🔌 PLACEHOLDER (connect when backend endpoint is ready)
    console.log("FORM SUBMIT PAYLOAD", {
      profileId: form.profileId,
      formId: form.id,
      responses: values,
    });

    setTimeout(() => {
      toast.success("Form submitted successfully 🎉");
      setSubmitting(false);
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 pt-6 pb-16">
      {/* Profile context */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={profile.profilePhoto}
          className="w-12 h-12 rounded-full border border-white/10"
        />
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className="text-xs text-white/50">{profile.position}</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
        <div>
          <h1 className="text-xl font-extrabold">{form.title}</h1>
          {form.description && (
            <p className="text-sm text-white/60 mt-1">{form.description}</p>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {form.fields.map((field: any) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.name]}
              onChange={handleChange}
            />
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleSubmit}
          disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </main>
  );
}
