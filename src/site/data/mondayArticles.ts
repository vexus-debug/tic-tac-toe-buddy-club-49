/** Thursday marketing articles: one for dental clinic owners, one for dental lab owners. */
import type { Article } from "./articles";
import dDashboard from "@/assets/dashboard-shots/dental-dashboard.png";
import dAppointments from "@/assets/dashboard-shots/dental-appointments.png";
import dCharts from "@/assets/dashboard-shots/dental-charts.png";
import dTreatments from "@/assets/dashboard-shots/dental-treatments.png";
import dBilling from "@/assets/dashboard-shots/dental-billing.png";
import dPatients from "@/assets/dashboard-shots/dental-patients.png";
import dInventory from "@/assets/dashboard-shots/dental-inventory.png";
import clinicWebsite from "@/assets/site/demo/clinic-website.png";
import lDashboard from "@/assets/dashboard-shots/dlab-dashboard.png";
import lCases from "@/assets/dashboard-shots/dlab-cases.png";
import lCam from "@/assets/dashboard-shots/dlab-cam.png";
import lQc from "@/assets/dashboard-shots/dlab-qc.png";
import lCalendar from "@/assets/dashboard-shots/dlab-calendar.png";
import lClients from "@/assets/dashboard-shots/dlab-clients.png";
import lBilling from "@/assets/dashboard-shots/dlab-billing.png";

const CLINIC_FEATURES = "/industries/dental-clinics/features";
const CLINIC_PRICING = "/industries/dental-clinics/pricing";
const LAB_FEATURES = "/industries/dental-labs/features";
const LAB_PRICING = "/industries/dental-labs/pricing";

export const mondayArticles: Article[] = [
  {
    slug: "thursday-dental-clinic",
    title: "The 10:00am ghost: what one empty chair on a Thursday really costs your clinic",
    excerpt: "The tray is set. The light is on. The patient never comes. A letter to every dental clinic owner tired of watching money walk out of the door in broad daylight.",
    category: "dental",
    publishedAt: "2026-11-12",
    readMinutes: 6,
    author: { name: "Clinexus Dental Desk", role: "Dental workflow specialists" },
    cover: dDashboard,
    featured: true,
    body: [
      { type: "p", text: "Doctor, it's Thursday. And Chair 2 is empty." },
      { type: "p", text: "Your assistant set the tray at 9:45. Sterile pack opened. Light adjusted. Crown prep booked for two hours. 10:15, no patient. 10:30, still nothing. Someone calls his line. It rings out." },
      { type: "p", text: "Count it. The fee you won't earn. The assistant you're paying to stand still. The generator burning diesel to cool an empty room. And the patient who wanted that slot last week, who you turned away." },
      { type: "quote", text: "An empty chair doesn't look like a loss. That's why it costs you so much." },
      { type: "p", text: "Most clinic owners never see this money go. It doesn't leave as one big bill. It leaks out in no-shows, unpaid balances, forgotten treatments and patients who never came back. Here's the same Thursday in a clinic that stopped the leaks." },

      { type: "h2", text: "The patient who couldn't forget" },
      { type: "p", text: "Mr. Adeyemi is the kind of patient who forgets. Busy man. Three phones." },
      { type: "p", text: "At 6pm yesterday one of them buzzed. A short text from your clinic, with your name on it: his time tomorrow, and your number if anything changed. He saw it in traffic. He's in Chair 2 at 9:55." },
      { type: "p", text: "Nobody at your front desk spent the evening making reminder calls. Nobody had to remember to. It just happened, for every patient on today's list." },
      { type: "image", src: dAppointments, alt: "Clinexus dental appointments calendar by chair", caption: "Every chair, every dentist, every patient. No double bookings, no forgotten visits." },
      { type: "p", text: "Save one implant or crown visit a month and you've paid for Clinexus several times over. The rest is profit you were already owed." },

      { type: "h2", text: "\"How much is it?\" \"Let me show you.\"" },
      { type: "p", text: "Mrs. Okafor needs three fillings and a crown. In most clinics this is where the conversation dies. A number gets said out loud, she goes quiet, and says she'll \"think about it\". She never comes back." },
      { type: "p", text: "Instead, you turn the screen. She sees her own teeth on the chart, the problem on each one, and a clear plan with every price in naira. No surprises. No awkward silence. She asks if she can start today." },
      { type: "image", src: dCharts, alt: "Clinexus interactive tooth chart", caption: "She sees what you see. Trust follows." },
      { type: "image", src: dTreatments, alt: "Clinexus treatment plan with prices in naira", caption: "A plan she can read is a plan she says yes to." },

      { type: "cta", title: "See how the whole clinic fits together", text: "Booking, charting, billing, labs and your website, in one place.", href: CLINIC_FEATURES, label: "See dental clinic features" },

      { type: "h2", text: "\"But I already paid.\"" },
      { type: "p", text: "You know this argument. A patient swears they paid. Your notebook says otherwise. Your receptionist is stuck in the middle. Everyone leaves annoyed, and you probably lose either the money or the patient." },
      { type: "p", text: "Not anymore. The bill builds itself from the treatment you recorded, so nothing slips through. The second a patient pays, a receipt from your clinic lands on their phone. Part payments, balances, all of it written down where nobody can argue." },
      { type: "image", src: dBilling, alt: "Clinexus dental billing and payments", caption: "Every naira, every balance, every receipt. No more notebook debates." },
      { type: "p", text: "By Thursday afternoon you know exactly who owes what. Not a guess. A list." },

      { type: "h2", text: "The crown that would have ruined Friday" },
      { type: "p", text: "Thursday is when weekend lab work goes wrong. The patient is booked for Friday. The crown is... somewhere." },
      { type: "p", text: "You open the case and see it: milled, in quality check, leaving the lab this evening. Or you see it's late, and you call the patient today, before they take a day off work for nothing. Either way, there's no Friday apology." },

      { type: "h2", text: "The drawer that was never empty" },
      { type: "p", text: "Monday, 9am, mid-procedure: \"Doctor, we're out of anaesthetic.\" That sentence never happens here. Clinexus warned you on Thursday, while you still had time to reorder." },
      { type: "image", src: dInventory, alt: "Clinexus dental inventory tracking", caption: "Low-stock warnings before they become emergencies." },

      { type: "h2", text: "While you sleep, next week fills up" },
      { type: "p", text: "You lock up at 7pm. Your clinic doesn't stop." },
      { type: "p", text: "A mother on her couch finds your clinic website, sees your prices and your team, and books her son in for Tuesday. A patient you cleaned in May gets a gentle text from you saying it's been six months. She books too." },
      { type: "p", text: "No ads. No campaign. No staff working late. Just a calendar that's fuller on Friday morning than it was on Thursday night." },
      { type: "image", src: clinicWebsite, alt: "A Clinexus dental clinic website", caption: "Your own clinic website, booking patients while the lights are off." },

      { type: "cta", title: "Pay only for the patients you see", text: "₦20,000 one-time setup with 10 free cases. No heavy monthly subscription.", href: CLINIC_PRICING, label: "See dental clinic pricing", secondaryHref: CLINIC_FEATURES, secondaryLabel: "See all features" },

      { type: "h2", text: "So, how did your week go?" },
      { type: "p", text: "In most clinics, nobody knows until the accountant says so. In yours, it's one screen: patients seen, money in, money owed, cases due. Thursday becomes the day you fix things, not the day you worry about them." },
      { type: "image", src: dDashboard, alt: "Clinexus dental clinic dashboard", caption: "The truth about your week, any time you want it." },
      { type: "list", items: [
        "Chairs that stay full, because patients are reminded before they can forget.",
        "Patients who say yes, because they can see the plan and the price.",
        "Money that comes in, because every treatment is billed and every payment gets a receipt.",
        "Patients who come back, because they're nudged at six months without you lifting a finger.",
        "A front desk that's calm, and an owner who finally goes home on time.",
      ] },
      { type: "p", text: "You didn't spend years training to chase payments and ring forgetful patients. Let the clinic do that. You do the dentistry." },
      { type: "cta", title: "Ready for a Thursday without the ghost?", text: "Look at the features, then check the pricing. Setup takes minutes.", href: CLINIC_FEATURES, label: "Explore dental clinic features", secondaryHref: CLINIC_PRICING, secondaryLabel: "View pricing" },
      { type: "whatsapp", title: "Would you like to talk to us directly on WhatsApp?", text: "Tell us about your clinic. A real person will reply and help you get started." },
    ],
  },
  {
    slug: "thursday-dental-lab",
    title: "Ring. Ring. Ring. Why your lab's Thursday phone is eating your Friday profit",
    excerpt: "Every call pulls a technician off the bench. Every vague order is a remake waiting to happen. A letter to every dental lab owner racing the weekend.",
    category: "laboratory",
    publishedAt: "2026-11-12",
    readMinutes: 6,
    author: { name: "Clinexus Dental Lab Desk", role: "Dental lab workflow specialists" },
    cover: lDashboard,
    featured: true,
    body: [
      { type: "p", text: "Boss, it's Thursday. Listen." },
      { type: "p", text: "Ring. \"Doctor says the shade on 21 is too light.\"" },
      { type: "p", text: "Ring. \"Is Chief's bridge ready? He travels to Abuja tomorrow morning.\"" },
      { type: "p", text: "Ring. \"Has your rider left yet?\"" },
      { type: "p", text: "Every time your ceramicist puts his brush down to answer, Friday's cases slip a little further. By 6pm the furnace is half full, two veneers are on their second remake, and the clinic balances in your notebook still haven't moved." },
      { type: "quote", text: "You built a lab to make beautiful work. Not to run a call centre." },

      { type: "h2", text: "The order nobody could read" },
      { type: "p", text: "It came in on Monday on a torn prescription slip. \"A2? A3?\" Nobody was sure. So the technician guessed. Thursday, it came back. Remake. Your material, your time, your margin, gone." },
      { type: "p", text: "Clinics on Clinexus send orders with the tooth numbers, material, shade and due date filled in. No guessing. No arguments about who said what. Fewer remakes, and more profit on every unit that leaves your bench." },
      { type: "image", src: lCases, alt: "Clinexus dental lab case board", caption: "Every case, its stage, its technician and its due date." },

      { type: "h2", text: "The silence that pays" },
      { type: "p", text: "Back to the phone. In a Clinexus lab, it barely rings." },
      { type: "p", text: "The clinic asking about Chief's bridge already checked 20 minutes ago. On their own phone, they saw it in ceramics, due out at 4pm. When the box leaves your bench, their front desk gets told automatically. Nobody on your team typed a message." },
      { type: "p", text: "Your technicians finish Friday's run in daylight. And clinics start telling other clinics about the lab that keeps them informed without being asked." },

      { type: "cta", title: "See how the bench, the machines and billing connect", text: "Every tool a dental lab gets, in one place.", href: LAB_FEATURES, label: "See dental lab features" },

      { type: "h2", text: "The half-empty furnace" },
      { type: "p", text: "Firing a furnace for two units hurts. Power, time, wear, all for half a load. Then three more cases arrive an hour later." },
      { type: "p", text: "When every due date sits on one calendar, you plan the mill, the furnace and the printer ahead. Thursday's runs go in full. Friday's cases come out on time." },
      { type: "image", src: lCam, alt: "Clinexus milling and furnace planning", caption: "Plan every run so nothing fires half empty." },
      { type: "image", src: lCalendar, alt: "Clinexus lab due date calendar", caption: "Friday is visible from Monday." },

      { type: "h2", text: "The remake that kept coming back" },
      { type: "p", text: "Every lab has one. The same problem, month after month, and nobody can say why. With a quality check on every case and a reason recorded for every remake, the pattern shows itself. Fix it once, save it forever." },
      { type: "image", src: lQc, alt: "Clinexus quality check station", caption: "Catch it on your bench, not in the patient's mouth." },

      { type: "h2", text: "The money still outside" },
      { type: "p", text: "Here's the part nobody likes. Clinic A owes for three months. Clinic B \"will send it next week\". You hate making that call. So it doesn't get made." },
      { type: "p", text: "In Clinexus, every clinic has its own account, built from the work you actually did. Statements are ready to send. And clinics with balances get a polite reminder from your lab, so you never have to be the bad guy." },
      { type: "image", src: lClients, alt: "Clinexus lab clinic accounts", caption: "Each clinic's cases, spending and balance, in one view." },
      { type: "image", src: lBilling, alt: "Clinexus lab invoices and billing", caption: "Invoices nobody can argue with." },

      { type: "cta", title: "Simple pricing, built for labs", text: "See exactly what it costs to run your lab on Clinexus.", href: LAB_PRICING, label: "See dental lab pricing", secondaryHref: LAB_FEATURES, secondaryLabel: "See all features" },

      { type: "h2", text: "Thursday, 6pm, the other way" },
      { type: "p", text: "Friday's cases are boxed. The furnace ran full. The phone rang twice all afternoon. Two clinics paid their balances after a reminder you didn't send yourself. You check one screen and see the whole week, then you go home." },
      { type: "image", src: lDashboard, alt: "Clinexus dental lab dashboard", caption: "The whole lab, at a glance." },
      { type: "list", items: [
        "More profit, because clear orders mean fewer remakes.",
        "Lower costs, because machines run full.",
        "Faster payment, because clinics get reminded without the awkward call.",
        "A quiet phone, because clinics can see their cases and get told when they ship.",
        "More clinics, because a lab that keeps people informed gets recommended.",
      ] },
      { type: "cta", title: "Ready for a quieter Thursday?", text: "Look at the features, then check the pricing.", href: LAB_FEATURES, label: "Explore dental lab features", secondaryHref: LAB_PRICING, secondaryLabel: "View pricing" },
      { type: "whatsapp", title: "Would you like to talk to us directly on WhatsApp?", text: "Tell us about your lab. A real person will reply and help you get started." },
    ],
  },
];
