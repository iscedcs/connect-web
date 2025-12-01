"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import SubmissionList from "./submission-list";
import SubmissionModal from "./submission-modal";

export default function FormSubmissionsPage({
  accessToken,
  profileId,
  formId,
}: any) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const url = `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.forms.one
        .replace("{profileId}", profileId)
        .replace("{id}", formId)}?include_submissions=true`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      const json = await res.json();
      const items = json?.data?.form?.submissions ?? [];

      setSubmissions(items);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    const url = `${
      process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
    }${URLS.forms.delete_submit
      .replace("{profileId}", profileId)
      .replace("{submissionId}", submissionId)}`;

    await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    toast.success("Submission deleted");
    fetchSubmissions();
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Form Submissions</h2>

        <Button onClick={fetchSubmissions} variant="secondary">
          Refresh
        </Button>
      </div>

      <SubmissionList
        items={submissions}
        loading={loading}
        onView={(s: any) => setSelectedSubmission(s)}
        onDelete={deleteSubmission}
      />

      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  );
}
