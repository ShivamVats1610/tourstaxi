import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Reveal from '@/components/site/Reveal';
import { BLOG_CATEGORIES } from '@/lib/data';
import { listBlogPosts } from '@/lib/crm';
import { Clock, ArrowRight, Search, User } from 'lucide-react';

export const metadata = { title: 'Blog - ToursTaxi' };
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await listBlogPosts();
  const featured = posts[0];
  const rest = posts.slice(1);
  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))].map((name) => ({
    name,
    count: posts.filter((post) => post.category === name).length
  }));

  if (!featured) {
    return (
      <div className="pt-24">
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-3xl font-extrabold text-slate-950">No blog posts yet</h1>
            <p className="mt-3 text-slate-600">Posts added from the admin panel will appear here.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-br from-[#12233f] via-[#0f3f3b] to-[#071527] py-16 text-white sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">Travel Journal</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">Stories, tips & guides from the road</h1>
          <p className="mt-4 text-white/80 text-lg">Itineraries, wildlife guides and travel hacks - written by people who actually drive these routes.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <Reveal>
              <Link href={`/blog/${featured.slug}`}>
                <Card className="overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="relative h-72 sm:h-96 overflow-hidden">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase">{featured.category}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">{featured.title}</h2>
                      <p className="mt-2 text-white/85 max-w-2xl">{featured.excerpt}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-white/80"><User className="h-4 w-4" />{featured.author} / <Clock className="h-4 w-4" />{featured.readMin} min read</div>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {rest.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.06}>
                  <Link href={`/blog/${p.slug}`} className="block">
                    <Card className="overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-slate-900 text-[11px] font-bold uppercase">{p.category}</div>
                      </div>
                      <CardContent className="p-5">
                        <div className="text-xs text-slate-500 flex items-center gap-3"><span>{p.date}</span> / <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.readMin} min</span></div>
                        <h3 className="text-lg font-bold mt-1.5 text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">{p.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.excerpt}</p>
                        <div className="mt-3 text-teal-700 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">Read article <ArrowRight className="h-4 w-4" /></div>
                      </CardContent>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
            <Card><CardContent className="p-5">
              <h4 className="font-bold text-slate-900 mb-3">Search</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search articles..." className="pl-9" />
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-5">
              <h4 className="font-bold text-slate-900 mb-3">Categories</h4>
              <ul className="space-y-2">
                {(categories.length ? categories : BLOG_CATEGORIES).map(c => (
                  <li key={c.name}><Link href="/blog" className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-teal-50 text-sm text-slate-700 hover:text-teal-700"><span>{c.name}</span><span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{c.count}</span></Link></li>
                ))}
              </ul>
            </CardContent></Card>
            <Card><CardContent className="p-5">
              <h4 className="font-bold text-slate-900 mb-3">Recent Posts</h4>
              <ul className="space-y-3">
                {posts.slice(0, 4).map(p => (
                  <li key={p.slug}><Link href={`/blog/${p.slug}`} className="flex gap-3 group">
                    <img src={p.image} alt={p.title} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    <div><div className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 line-clamp-2">{p.title}</div><div className="text-xs text-slate-500 mt-1">{p.date}</div></div>
                  </Link></li>
                ))}
              </ul>
            </CardContent></Card>
            <Card className="bg-[#12233f] text-white border-0"><CardContent className="p-5">
              <h4 className="font-bold text-lg">Need a cab now?</h4>
              <p className="text-sm opacity-90 mt-1">Get instant pricing in 30 seconds.</p>
              <Link href="/#book"><Button className="mt-4 w-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">Book a Cab</Button></Link>
            </CardContent></Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
