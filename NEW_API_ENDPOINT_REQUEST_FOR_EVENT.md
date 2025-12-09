NEW ENDPOINT REQUEST (PUBLIC — NO AUTH REQUIRED)

GET /api/events/public/{userId}

Purpose:
Return a minimal list of all public events created by this user, to show on their contactless profile.

Response shape (minimal):

{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "TGIF WITH ISCE",
        "cleanName": "tgif-with-isce",
        "startDate": "2025-11-28T00:00:00.000Z",
        "time": "03:30 PM",
        "location": "AMG WORKSPACE, 22 ROAD, LAGOS, NIGERIA",
        "image": "https://...jpg"
      }
    ]
  }
}


Rules:

NO authentication required

Should only include all public/private events

Should include minimal fields only

startDate, time, location, image, title, cleanName, id