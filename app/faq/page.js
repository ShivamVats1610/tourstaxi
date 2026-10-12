import JsonLd from '@/components/site/JsonLd';
import { pageMetadata } from '@/lib/seo';
import Reveal from '@/components/site/Reveal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FAQS } from '@/lib/data';

export const metadata = pageMetadata('/faq');

export default function FAQPage() {
  return (
    <div className="pt-24">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) }} />
      <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-4">Help Centre</div>
          <h1 className="text-4xl md:text-6xl font-extrabold">Frequently asked questions</h1>
          <p className="mt-4 text-white/80 text-lg">Everything you might want to know about booking, payments and cancellations.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <Accordion type="single" collapsible className="bg-white rounded-2xl border border-slate-200 px-4 sm:px-6">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
