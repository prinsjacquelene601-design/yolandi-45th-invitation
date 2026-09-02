# Yolandi's 45th — Website

This is your complete invitation website. It already contains your RSVP form,
connected to your Google Apps Script, so you don't need to set anything else up.

The website has 4 files:

- `index.html` — the invitation and RSVP form
- `styles.css` — all the colours, fonts and design
- `script.js` — makes the RSVP form work and send responses to your Google Sheet
- `README.md` — this guide

All four files must stay together, in the same folder, with these exact names.

---

## STEP 1 — Save the files in the correct folder

1. Create a new folder on your computer called `yolandi-45th`.
2. Save all four files (`index.html`, `styles.css`, `script.js`, `README.md`)
   inside that one folder.
3. Do not rename the files, and do not put them in separate folders — they
   need to sit next to each other so the website can find its own styling
   and scripting.

---

## STEP 2 — Test the website on your computer

1. Open the `yolandi-45th` folder.
2. Double-click `index.html`.
3. It should open in your web browser (Chrome, Safari, Edge, etc.) and look
   like the finished invitation.
4. Scroll all the way down and try the RSVP form. When you press **Confirm My
   RSVP**, it will try to send your test entry to your Google Sheet — so feel
   free to send yourself a test response to check it arrives correctly, then
   delete that test row from the sheet afterwards.

That's it — no installations, no extra setup needed to preview it.

---

## STEP 3 — Publish the website on Vercel

You don't need any technical knowledge for this. Vercel lets you publish a
website by simply dragging your folder in.

1. Go to **vercel.com** and log in (or create a free account).
2. On your dashboard, click **Add New… → Project**.
3. Choose the option to upload/drag a folder (or connect it to a GitHub
   repository if you prefer — either works).
4. Select or drag in your `yolandi-45th` folder.
5. Leave all the settings as they are — this is a plain website, so no
   special build settings are needed.
6. Click **Deploy**.
7. After a few moments, Vercel will give you a website address (something
   like `yolandi-45th.vercel.app`). That's your live link!

---

## Sharing the link on WhatsApp

Once it's live, copy the Vercel link and paste it into WhatsApp like normal.
The site includes the invitation title and description, so it will show up
nicely as a link preview.

---

## A few notes

- The RSVP form is already connected to your Google Apps Script, so
  responses will land in your Google Sheet automatically. You don't need to
  change anything in the code.
- Because of how Google Apps Script works with websites like this, the
  website cannot always confirm the exact response back from Google — so it
  simply shows guests a lovely "Thank You" confirmation once their RSVP has
  been sent. If you'd like extra peace of mind, you can check your Google
  Sheet from time to time to see responses coming in.
- If you ever need to update the wording, times, or prices, you can open
  `index.html` in any text editor (like Notepad or TextEdit) and edit the
  text directly — the design will stay exactly the same.
- If you ever need to change the Google Apps Script link, open `script.js`
  and replace the web address after `GOOGLE_SCRIPT_URL =` with your new one,
  keeping the quotation marks around it.

Enjoy the celebration! 🤍
