import { fetchPublicProfile } from "@/lib/services/public-profile";
import { fetchPublicForm } from "@/lib/services/forms";
import PublicFormClient from "@/components/customer/forms/public-form-client";

export default async function PublicFormPage({ params }: any) {
  const { id, formId } = await params;

  const profileData = await fetchPublicProfile(id);
  if (!profileData)
    return <div className="p-6 text-white">Profile not found</div>;

  const profile = profileData.profile;

  const formRes = await fetchPublicForm({
    profileId: profile.id,
    formId,
  });

  if (!formRes?.form || !formRes.form.is_visible) {
    return <div className="p-6 text-white/60">Form not available</div>;
  }

  return <PublicFormClient profile={profile} form={formRes.form} />;
}
