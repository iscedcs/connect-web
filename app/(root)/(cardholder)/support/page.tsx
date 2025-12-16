import LegalLayout from "@/components/legal/legal-layout";

export default function SupportPage() {
  return (
    <LegalLayout title="Contact Support">
      <p>
        {` Need help with your account, profile, or devices? Our support team is
        here to help.`}
      </p>

      <ul>
        <li>
          Email: <strong>support@isce.tech</strong>
        </li>
        <li>{`Response time: within 24–48 hours`}</li>
      </ul>

      <p className="text-sm text-white/60 mt-6">
        Please include your registered email or phone number when contacting
        support.
      </p>
    </LegalLayout>
  );
}
