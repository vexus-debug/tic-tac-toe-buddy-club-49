/** Dental clinic owner article: moving off Excel, WhatsApp and paper. Images are hosted on the clinic's Supabase storage. */
import type { Article } from "./articles";

const IMG = "https://ivzbesxkvhwdifjhrpet.supabase.co/storage/v1/object/public/article-covers/still-using-excel-2026";
const img = (name: string) => `${IMG}/${name}.png`;

export const excel2026Article: Article = {
  slug: "still-using-excel-whatsapp-paper-2026",
  title: "Still running your dental clinic on Excel, WhatsApp and paper in big 2026?",
  excerpt: "Your patients use AI to plan holidays. Your front desk is still digging for a blue cardboard file. A friendly, honest intervention for every dental clinic owner.",
  category: "dental",
  publishedAt: "2026-11-13",
  readMinutes: 14,
  author: { name: "Clinexus Dental Desk", role: "Dental workflow specialists" },
  cover: img("dashboard"),
  featured: true,
  body: [
    { type: "p", text: "Doctor, pull up a stool. We need to talk." },
    { type: "p", text: "It is 2026. Your patients ask AI to plan their holidays. Their bank app reminds them before rent is due. Their car practically parks itself. And yet, yesterday at 2:15pm in your clinic, this happened:" },
    { type: "list", items: [
      "Your front desk spent eleven minutes hunting for Mr. Ibrahim's blue cardboard file while he stood at the counter holding his jaw.",
      "Your receptionist scrolled through 312 unread WhatsApp messages looking for a transfer receipt Mrs. Alabi sent three weeks ago.",
      "Your associate leaned out of Chair 2 to ask, \"Doctor, do we still have composite A3, or did we finish it yesterday?\"",
      "And a spreadsheet called patients_final_v4_REALLY_FINAL.xlsx froze the moment someone pasted a phone number into the wrong column.",
    ] },
    { type: "p", text: "If you laughed a little, it is because it is true. And if it stung a little, that is fine too. This article is not here to shame anybody. Most of the best dentists we know started exactly like this, because paper, Excel and WhatsApp were free, familiar and good enough when the clinic was small." },
    { type: "p", text: "The problem is that the clinic grew. The tools did not." },
    { type: "quote", text: "You are already paying for clinic software. You are just paying for it in empty chairs, unbilled procedures and front desk arguments." },

    { type: "h2", text: "Why \"good enough\" stopped being good enough" },
    { type: "p", text: "Three things changed in the last few years, and they changed quietly." },
    { type: "h3", text: "1. Patients now compare you to their bank, not to other clinics" },
    { type: "p", text: "Your patient gets an instant alert when they buy fuel. They get a reminder before their DSTV expires. Then they book a scaling with you, and hear nothing until they call twice to confirm. They will not complain. They will simply book the clinic down the road that sent them a text." },
    { type: "h3", text: "2. Your competitors are automating" },
    { type: "p", text: "The new clinic that opened near you this year did not hire three extra receptionists. It set up reminders, recalls and online booking on day one. Every no-show it avoids, every recall it sends automatically, is a patient that used to be yours." },
    { type: "h3", text: "3. Margins got thinner" },
    { type: "p", text: "Diesel, materials, salaries and rent all went up. When margins are wide, a few lost invoices do not hurt. When margins are thin, the ₦15,000 balance nobody followed up and the crown that was done but never billed are the difference between a good month and a stressful one." },

    { type: "h2", text: "The real cost of the \"free\" setup" },
    { type: "p", text: "Let us do the honest arithmetic most clinics avoid until the accountant visits." },
    { type: "h3", text: "Paper cards and folders" },
    { type: "p", text: "Cards, chart slips, printed treatment sheets, folders and filing space cost most clinics ₦300 to ₦500 per visit. Add the time spent searching, the torn and water-damaged notes, and the very real risk of a missing record in a dispute, and paper is the most expensive \"free\" thing in the building." },
    { type: "h3", text: "WhatsApp as a booking system" },
    { type: "p", text: "WhatsApp is wonderful for talking. It is terrible as a clinic system. Voice notes get buried. Bookings are copied into a diary by hand, or not at all. And when your receptionist resigns, months of patient conversations leave on her personal phone." },
    { type: "h3", text: "Excel and receipt booklets" },
    { type: "p", text: "Spreadsheets do not know that a filling was done but never invoiced. Receipt booklets do not chase balances. Clinics that move from Excel to a connected billing system commonly discover that 8 to 15 percent of their work was leaking out as unbilled or uncollected revenue." },
    { type: "h3", text: "Recalls that live in someone's memory" },
    { type: "p", text: "\"We will call them in six months\" is a beautiful intention. Then walk-ins arrive, the phone rings and nobody calls. The patient comes back only when the tooth is bad enough for an extraction, or goes somewhere else entirely." },
    { type: "tip", title: "Quick self-check", text: "Ask your front desk three questions today: How many patients are due for a recall this month? Who owes us money right now, and how much? How many fillings did we do last week? If any answer starts with \"Let me check\", you have found your leak." },

    { type: "demoCta", title: "See a real dental clinic running on Clinexus", text: "No sign-up, no sales call. Open the live demo clinic and click around the same screens you will see in this article." },

    { type: "h2", text: "Meet Clinexus: one connected system for the whole clinic" },
    { type: "p", text: "Clinexus was not built as a general hospital tool with \"dental\" written on the box. It was built around how a dental clinic actually runs: the chair, the chart, the plan, the lab, the bill, the recall. Every part talks to every other part, so information is entered once and used everywhere." },
    { type: "p", text: "Here is what changes, step by step, through a normal day in your clinic." },

    { type: "h2", text: "8:30am: The morning huddle takes two minutes" },
    { type: "p", text: "Instead of a whiteboard and a diary, your team opens one screen. Today's production target. Who is booked in which chair. Which patients are waiting. How much treatment has been planned but not yet booked. Outstanding balances. Everyone starts the day looking at the same truth." },
    { type: "image", src: img("dashboard"), alt: "Clinexus dental clinic dashboard with morning huddle and clinic figures", caption: "The morning huddle: today's goal, patient flow and unscheduled treatment worth chasing, at a glance." },
    { type: "list", items: [
      "Daily production goal with live progress as treatments are completed.",
      "Patient flow from booked, to confirmed, to waiting, to in chair, to completed.",
      "Unscheduled treatment value, so you can see money sitting in plans nobody has booked.",
      "Outstanding balances across every invoice, not scattered in booklets.",
    ] },

    { type: "h2", text: "Front desk: bookings without the diary drama" },
    { type: "p", text: "Every chair and every dentist on one calendar. Drag to reschedule. Book a walk-in in under 30 seconds with just a name and phone number. Double bookings simply cannot happen, because the system knows Chair 2 is taken at 10am." },
    { type: "image", src: img("appointments"), alt: "Clinexus appointment calendar for a dental clinic", caption: "Day, week and month views across chairs and dentists. Walk-ins, bookings and the waiting list in one place." },
    { type: "list", items: [
      "Chair and dentist scheduling with day, week and month views.",
      "Walk-in registration and a live waiting list.",
      "Staff schedules so you know who is on duty before you book.",
      "Online bookings from your clinic website land straight in the calendar.",
    ] },

    { type: "h2", text: "Patient records: every file found in two seconds" },
    { type: "p", text: "Type a name or phone number in the search bar and the full patient file opens: history, charts, X-rays, plans, invoices, consent forms and notes. No cabinet. No \"it was here yesterday\"." },
    { type: "image", src: img("patients"), alt: "Clinexus patient directory with search and contact actions", caption: "The patient directory. One tap to call or message, one click to open the full file." },

    { type: "h2", text: "Chairside: a tooth chart your patient actually understands" },
    { type: "p", text: "Ever shown a patient a handwritten chart? They nod politely, say \"let me think about it\" and disappear. Now turn the screen around. They see their own teeth, the problem tooth highlighted, and exactly what you recommend. Understanding builds trust, and trust is what turns \"I will think about it\" into \"Can we start today?\"" },
    { type: "image", src: img("charts"), alt: "Clinexus interactive FDI tooth chart with conditions", caption: "Interactive FDI tooth chart, surface by surface, with an AI pre-chair briefing that summarises the patient's history before they sit down." },
    { type: "list", items: [
      "Adult and child tooth charts with conditions on every surface.",
      "Gum (perio) charting to show real progress between visits.",
      "AI pre-chair briefing that reviews past visits, allergies and open plans for the dentist.",
      "X-rays and intraoral photos attached to the patient, never lost in an email thread.",
      "Clinical note templates so notes are fast, complete and defensible.",
    ] },

    { type: "h2", text: "Treatment plans and estimates: the price conversation, without the awkward silence" },
    { type: "p", text: "Big cases scare patients when they hear one big number. Clinexus breaks the work into clear phases, from pain relief to final restoration, each with its own price in naira. The patient sees the road, not just the bill." },
    { type: "image", src: img("treatments"), alt: "Clinexus phased treatment plan with naira prices", caption: "Phased treatment plans with naira prices. Print or send the estimate in one click." },
    { type: "list", items: [
      "Phased plans that patients can commit to one step at a time.",
      "Your own treatment list and prices, built into every estimate.",
      "Payment plans for larger cases, tracked automatically.",
      "Digital consent forms signed on a tablet at the chair.",
    ] },

    { type: "pricingCta", title: "Costs less per visit than the paper folder it replaces", text: "A one-time ₦20,000 setup with 10 free patient visits, then ₦400 per visit. No monthly subscription eating into slow months." },

    { type: "h2", text: "Billing: the end of \"But I already paid\"" },
    { type: "p", text: "When a treatment is recorded on the chart, it flows to the bill. Nobody has to remember. When a patient pays, by cash, POS, transfer or HMO, it is recorded against their invoice, and a receipt from your clinic lands on their phone. Part payments and balances are written down where nobody can argue." },
    { type: "image", src: img("billing"), alt: "Clinexus billing with outstanding balances and overdue aging", caption: "Collected today, outstanding balances and overdue invoices grouped by age, so follow-up is a list, not a guess." },
    { type: "list", items: [
      "Invoices built automatically from completed treatment.",
      "Part payments, deposits and payment plans with running balances.",
      "Automatic receipts by SMS or email.",
      "Overdue balances grouped by 0 to 30, 31 to 60, 61 to 90 and 90+ days.",
      "Expenses, dentist earnings and commission payouts in the same place.",
    ] },

    { type: "h2", text: "Lab work: no more Friday crown panic" },
    { type: "p", text: "Record each lab case with tooth, shade, material and due date. See whether it is at the lab, in quality check or back in the clinic. If it is running late, you know on Wednesday, and you can call the patient before they take a day off work for nothing. Labs on Clinexus can even update the case for you." },

    { type: "h2", text: "Inventory: never run out of anaesthetic mid-procedure" },
    { type: "p", text: "Set a minimum level for each item. When composite, carpules, endo files or impression material run low, Clinexus warns you while there is still time to reorder. Track suppliers, purchase orders and the real material cost of each treatment." },
    { type: "image", src: img("inventory"), alt: "Clinexus dental inventory with low stock alerts", caption: "Low-stock alerts, stock value and supplier details for every consumable." },

    { type: "h2", text: "Automation: the receptionist who never sleeps" },
    { type: "p", text: "This is the part that makes clinic owners smile. Clinexus sends the messages your team means to send but rarely has time for, under your clinic's name, on time, every time." },
    { type: "list", items: [
      "Booking confirmations the moment an appointment is made.",
      "Reminders the day before, with the time, dentist and your contact number.",
      "Aftercare instructions after extractions and surgery.",
      "Payment receipts as soon as money is recorded.",
      "Six-month recalls that bring patients back for cleaning without a single phone call.",
      "Birthday and follow-up messages that keep your clinic in mind.",
    ] },
    { type: "p", text: "You choose which messages go out and what they say, preview them on a phone screen before they are sent, and see a delivery log of every message. Your front desk stops being a call centre and goes back to looking after the patients in front of them." },
    { type: "tip", title: "What one recall is worth", text: "If 40 patients a month are due for a six-month recall and automation brings back just 10 of them, that is 10 extra scalings, plus the fillings and crowns you find during those visits. That alone pays for the system many times over." },

    { type: "h2", text: "Your own clinic website that books patients at night" },
    { type: "p", text: "Pick a dental website template, add your photos, team and prices, and your clinic is online. Patients choose a treatment, dentist and time, and the booking appears in your calendar. One tap to WhatsApp or call your front desk. No web designer invoices, no website that goes out of date." },

    { type: "h2", text: "Owner view: know how your month is going before the accountant tells you" },
    { type: "p", text: "Revenue, collections, outstanding balances, treatment mix, dentist performance and profitability per procedure. Run one branch or several from the same login, with each branch's numbers side by side." },

    { type: "demoCta", title: "Click through every screen yourself", text: "Charts, bookings, billing, inventory and automations are all live in the demo clinic. It takes about ten seconds to get in." },

    { type: "h2", text: "Your whole clinic, in your pocket" },
    { type: "p", text: "Clinexus is fully mobile responsive. That is not a cut-down app with half the features. It is the same system, laid out properly for a phone or tablet, with a bottom menu that puts Home, Patients, Schedule and more under your thumb." },
    { type: "phones", caption: "Real screens from the demo clinic on a phone: the dashboard, the appointment book and the patient list.", shots: [
      { src: img("mobile-dashboard"), alt: "Clinexus dashboard on a mobile phone", label: "Dashboard" },
      { src: img("mobile-appointments"), alt: "Clinexus appointments on a mobile phone", label: "Appointments" },
      { src: img("mobile-patients"), alt: "Clinexus patient list on a mobile phone", label: "Patients" },
    ] },
    { type: "list", items: [
      "Owners: check today's production and balances from traffic, a conference or your living room.",
      "Dentists: open a patient's chart and history on a tablet right beside the chair.",
      "Front desk: book, register and take payments from any device, even if the desktop is down.",
      "No server in the back room and no IT technician. A browser and internet is all you need.",
    ] },

    { type: "h2", text: "\"But Doctor, my staff are not computer people\"" },
    { type: "p", text: "We hear this a lot, and we understand. That is why setup includes training for your team, importing your existing patient list, and short how-to guides inside every screen. If your receptionist can use WhatsApp, she can use Clinexus. Most clinics are fully running within a week." },
    { type: "h3", text: "What about my data?" },
    { type: "p", text: "Your records are backed up continuously, every change is logged, and each staff member only sees what their role allows. Compare that to a filing cabinet anybody can open, or a spreadsheet that lives on one laptop." },
    { type: "h3", text: "What if the internet goes down?" },
    { type: "p", text: "Switch to a phone hotspot and keep going. Because everything lives online, a spoilt computer or a stolen laptop no longer means lost records." },

    { type: "h2", text: "The AI era does not wait" },
    { type: "p", text: "Five years from now, every serious clinic will run on connected software. The only question is whether you start now, while it is still an advantage, or later, when it is just catching up. The clinics that move first get the reviews, the recalls and the referrals. The ones that wait get the patients nobody reminded." },
    { type: "p", text: "You did not spend years training to chase payments, dig through folders and ring forgetful patients. Let the system do that. You do the dentistry." },

    { type: "pricingCta", title: "Pay only for the patients you see", text: "₦20,000 one-time setup including 10 free visits, training and data import. Then ₦400 per patient visit. Credits never expire." },
    { type: "contactCta", title: "Talk directly to the Clinexus team", text: "Tell us how your clinic runs today and what frustrates you most. A real person will reply, show you Clinexus handling exactly that, and get your clinic live this week." },
  ],
};
