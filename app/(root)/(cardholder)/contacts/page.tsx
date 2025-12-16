import { fetchReceivedContacts } from "@/lib/services/contact";
import { getAuthInfo } from "@/actions/auth";
import ContactCard from "@/components/pages/cardholder/contact/contact-card";

export default async function ReceivedContactsPage() {
  const authInfo = await getAuthInfo();

  if ("error" in authInfo || authInfo.isExpired) {
    return <div className="text-white p-6">Redirecting to login...</div>;
  }

  //   const userId = authInfo.user.id;
  const accessToken = authInfo.accessToken;

  const data = await fetchReceivedContacts({
    accessToken,
    page: 1,
    limit: 10,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Received Contacts</h1>

      {data.contacts.length === 0 ? (
        <p className="text-white/50">No contacts received yet</p>
      ) : (
        data.contacts.map((contact: any) => (
          <ContactCard key={contact.id} contact={contact} />
        ))
      )}
    </main>
  );
}
