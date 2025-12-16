Contact Module – Bug Analysis & Required Backend Fixes

Context (What’s Working)
Public users can successfully leave contacts via:

POST /api/contact/leave


Contacts are correctly saved in the database.
✅ Example DB record (confirmed):

id        = 4fa37b47-ad43-461f-902d-9f2490a41d62
ownerId   = 0f53eaf0-229f-4dbc-aebe-03c60a1cd726  -- PROFILE ID
firstName = Obichukwu
lastName  = Uwa
email     = obi****@gmail.com
phone     = +23408****147
note      = guy at the gym



❌ What Is Broken (All Owner-Side Endpoints)
All cardholder-side contact endpoints return empty results or “not found”, even though data exists.

Affected Endpoints
Endpoint	                        Status
GET /api/contact/received	        returns empty
GET /api/contact/recent	            returns empty
GET /api/contact/search	            returns empty
GET /api/contact/stats	            returns zeros
GET /api/contact/one/{id}	        "Contact not found"


Root Cause (Single, Critical Issue)
Current Backend Assumption (Incorrect)

All contact read endpoints appear to filter like this:

WHERE Contact.ownerId = auth.user.id


Actual Data Model (Correct)
Contacts are saved using:

Contact.ownerId = profile.id


⚠️ Important distinction

auth.user.id → USER ID (from JWT)

Contact.ownerId → PROFILE ID (UUID)

These are not the same.


Required Backend Fix (Minimal & Correct)
✅ Correct Ownership Logic

A user can own multiple profiles, and contacts belong to profiles, not users.