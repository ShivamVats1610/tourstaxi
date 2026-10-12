# ToursTaxi SEO and Google Search Console

## Deploy and verify

The default canonical domain is https://www.tourstaxi.com, matching the current production redirect. Set SITE_URL=https://www.tourstaxi.com in production so canonical URLs, robots.txt and sitemap URLs use that same origin. Never set it to a preview deployment or localhost in production. Configure your hosting to redirect HTTP and the alternate hostname to that origin with a permanent redirect.

1. Deploy the changes and check /robots.txt, /sitemap.xml, and /opengraph-image on the production domain.
2. Open https://search.google.com/search-console and add the tourstaxi.com Domain property. Copy Google's TXT verification record into the domain's DNS and verify ownership. A Domain property includes both www and non-www variants.
3. Alternatively, add a URL-prefix property for https://www.tourstaxi.com/. For HTML-tag verification, set GOOGLE_SITE_VERIFICATION in production to the content value from Google's verification tag (not the entire tag) and redeploy. DNS verification does not need this variable.
4. In Search Console > Sitemaps, submit https://www.tourstaxi.com/sitemap.xml (or sitemap.xml when the property already shows the prefix). The sitemap updates from active cars, tours, and blog posts and includes all public static pages. Account, admin, payment and API URLs are excluded. Verify that the deployed sitemap returns HTTP 200 and XML before resubmitting; the status reflects Google's last fetch and may not update immediately.
5. Use URL Inspection to test the homepage, fleet page, a car detail, a tour detail and a blog post. Confirm Google sees their content and canonical URLs, then request indexing for key pages.
6. Monitor Page indexing, sitemap processing, Core Web Vitals and query performance. Submission and indexing take time; sitemap submission does not guarantee indexing or positions.

## What the code provides

- Unique public-page titles, descriptions, canonical URLs, Open Graph and Twitter preview metadata.
- TravelAgency, TaxiService and WebSite JSON-LD using the site's real business details and configured contact/social information.
- Breadcrumbs for content pages, BlogPosting for articles, TouristTrip for tours, Service for cars and FAQPage matching visible FAQs. These describe content; rich-result eligibility is decided by Google. FAQ rich results generally are restricted to authoritative government/health websites.
- A 1200 x 630 brand sharing image; async route params and server-side missing-content 404s for car, tour and blog details.
- Noindex for private/account/payment pages. Robots disallows API and protected account areas; it is not access control.
- Homepage car and route content in initial server-rendered HTML.
- Actual record update timestamps in sitemap entries when available. Static pages do not invent a new modification date on every crawl.

## Ongoing work

Keep the brand name, phone, address and website consistent across Google Business Profile and directories. Verify and maintain the real Google Business Profile, then set its URL in admin fare/site settings. Ask real customers for honest reviews; do not invent review ratings or add fake schema.

Publish original travel guides that answer actual customer questions about destinations, pickup points, route choices and trip planning. Keep prices and inclusions accurate. Add useful photographs with descriptive alt text. Earn relevant links from real hotels, travel partners and local businesses.

Use Search Console data to improve pages for relevant queries such as ToursTaxi, Tours Taxi Sawai Madhopur, Ranthambore taxi, Jaipur airport transfer and Rajasthan tours. Broad terms such as tour or travel are competitive and may have unrelated intent; no code change guarantees placement for them.

Reference: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
