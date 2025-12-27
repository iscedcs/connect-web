import { getAuthInfo } from "@/actions/auth";
import ContactsClient from "@/components/pages/cardholder/contact/contact-client";
import { fetchReceivedContacts } from "@/lib/services/contact";
import { getConnectProfile } from "@/lib/services/profile";

export default async function ReceivedContactsPage() {
  const authInfo = await getAuthInfo();

  if ("error" in authInfo || authInfo.isExpired) {
    return <div className="text-white p-6">Redirecting to login...</div>;
  }

  const accessToken = authInfo.accessToken;
  const profile = await getConnectProfile();

  if (!profile?.id) {
    return (
      <div className="p-6 text-white/60">No profile found for this account</div>
    );
  }

  const data = await fetchReceivedContacts({
    profileId: profile.id,
    accessToken,
    page: 1,
    limit: 10,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl text-white font-bold">Received Contacts</h1>

      {data.contacts.length === 0 ? (
        <p className="text-white/50">No contacts received yet</p>
      ) : (
        <ContactsClient
          data={data}
          profileId={profile.id}
          accessToken={accessToken}
        />
      )}
    </main>
  );
}
