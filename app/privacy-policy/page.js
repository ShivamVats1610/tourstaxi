export const metadata = { title: 'Privacy Policy - ToursTaxi' };

export default function PrivacyPage() {
  return (
    <div className="pt-24">
      <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-4">Legal</div>
          <h1 className="text-4xl md:text-5xl font-extrabold">Privacy Policy</h1>
          <p className="mt-3 text-white/70">Last updated: 1 June 2025</p>
        </div>
      </section>
      <section className="py-16">
        <article className="prose prose-slate max-w-3xl mx-auto px-4">
          <p>ToursTaxi (we, our, us) values your privacy. This policy explains what information we collect, how we use it and the choices you have.</p>
          <h2>Information we collect</h2>
          <p>When you book a cab, we collect your name, contact number, pickup/drop addresses, payment details and basic trip metadata to fulfil your booking.</p>
          <h2>How we use it</h2>
          <ul><li>To confirm and dispatch your cab</li><li>To process payments and issue invoices</li><li>To improve our service and personalise offers</li><li>To send trip updates via SMS, email or WhatsApp</li></ul>
          <h2>Sharing</h2>
          <p>We share trip details only with the assigned driver and payment processor. We never sell your data to third parties.</p>
          <h2>Your choices</h2>
          <p>You can request a copy of your data or ask us to delete your account anytime by emailing tourstaxi.com@gmail.com.</p>
          <h2>Cookies</h2>
          <p>Our website uses essential cookies to keep you logged in and to remember your booking preferences.</p>
          <h2>Contact</h2>
          <p>For any privacy-related queries, write to us at tourstaxi.com@gmail.com or call +91 8955458128.</p>
        </article>
      </section>
    </div>
  );
}
