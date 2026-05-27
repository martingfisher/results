---
title: "I just cancelled our Elfsight subscription. Here's why, and what it cost."
pageSlug: "replacing-elfsight-with-an-in-house-form"
summary: "How I replaced a third-party form widget with our own in-house infrastructure, cut £3,000 off three years of subscriptions, and pushed every page on resultsyoucanmeasure.co.uk to a perfect Lighthouse score on the same afternoon."
date: "2026-05-27"
category: "Web"
image: "/assets/blog/elfsight-lighthouse-before-after.jpg"
draft: false
---

Yesterday I cancelled our Elfsight subscription. The contact form on this site is now first-party, the page loads about a second faster, and every page on resultsyoucanmeasure.co.uk scores 100/100/100/100 on Lighthouse, on both mobile and desktop. The whole change took about two hours.

This is the case study, the cost breakdown, and the bigger question it surfaced about where paid plugins are heading.

<img src="/assets/blog/elfsight-lighthouse-before-after.jpg" alt="PageSpeed Insights summaries before and after replacing Elfsight: mobile went from 90/96/100/100 to 100/100/100/100 with TBT 400ms to 0ms; desktop went from 70/96/100/100 to 100/100/100/100 with TBT 610ms to 0ms and CLS 0.149 to 0.009" width="1240" height="880" loading="eager" />

<div class="article-callout">
  <strong>TL;DR:</strong> Third-party form widgets cost a small monthly fee, hurt your Lighthouse scores by 20-30 points, and quietly make your cookie policy inaccurate. Replacing one with a properly-built first-party form takes an afternoon now that AI-assisted development is normal. The agency that built the widget is still useful, just for a smaller set of problems than they used to be.
</div>

## What I was paying for

When we put this site together I needed a contact form working that week, not in a fortnight. Elfsight does forms well enough. You drop a `<div>` and a `<script>` tag on the page, point it at their dashboard, and submissions land in an inbox.

The trade for that speed is real. You ship a third-party widget on your most important page. You give a vendor control over what runs in your visitor's browser. You pay a small monthly fee, every month, forever, whether anyone fills in the form or not.

I accepted that trade. Until last week I had not reviewed it.

## What changed

Three conditions were in place that had not been before.

First, I had just finished building our own forms infrastructure. It is a small Cloudflare Worker that accepts submissions, stores them in a UK database, fires notification emails via the SMTP2GO account we already pay for, and exposes them in an admin we control. Originally built for our client sites, where we wanted them to own their enquiry data rather than rent it. Hardened over the past fortnight with per-submission audit logging, daily backups, an automatic retry queue for failed deliveries, and a daily ops digest that flags anything that did not get through.

Second, AI-assisted development collapses the work that used to make this kind of migration nervous. A pair of React components, a config file, one sync command, a sub-100KB JavaScript island that loads only when the form is in view. Half an afternoon, including the testing.

Third, our own /cookies/ page declared that we use no third-party trackers. Our own /contact/ page was loading Elfsight. The mismatch was the prompt. I could either change the cookie policy to be honest about Elfsight, or change the form to be honest about the cookie policy. I chose the latter.

<div class="blog-figure blog-figure--split">
  <picture>
    <img src="/assets/blog/elfsight-contact-desktop.jpg" alt="The new contact form on the live site, viewed on a desktop browser. The form sits in the right-hand column of a two-column hero." width="1240" height="775" loading="lazy" />
  </picture>
  <picture>
    <img src="/assets/blog/elfsight-contact-mobile.jpg" alt="The same contact form viewed on a mobile browser, full-width below the page intro copy." width="480" height="915" loading="lazy" />
  </picture>
</div>

## What changed in numbers

PageSpeed Insights, measured on the same URL, same network conditions, same week.

| Metric | Before (Elfsight) | After (in-house) | Change |
| --- | --- | --- | --- |
| **Mobile Performance** | 90 | **100** | +10 |
| **Desktop Performance** | 70 | **100** | **+30** |
| Mobile Total Blocking Time | 400ms | **0ms** | -400ms |
| Desktop Total Blocking Time | 610ms | **0ms** | **-610ms** |
| Desktop Cumulative Layout Shift | 0.149 (Needs Improvement) | 0.009 (Good) | crossed the CWV threshold |
| Mobile unused JavaScript | 498 KiB | 34 KiB | -464 KiB |
| Long main-thread tasks | 7 | 0 | -7 |
| Third-party scripts flagged | yes | no | gone |

A few of those numbers deserve a paragraph.

**Desktop Performance jumped from 70 to 100.** That is a counter-intuitive direction of travel. Desktops are supposed to be the easy case. A score of 70 on a brochure-style page with no real content is what told me the widget was carrying more weight than I had assumed. Removing it pushed us to a clean 100.

**Total Blocking Time went to zero on both axes.** TBT measures how long the main thread is unresponsive to user input. Half a second of blocking on desktop, getting on for half a second on mobile, all of it from a single third-party script. Now zero. The page feels measurably more responsive on slower devices, which is most devices.

**Desktop Cumulative Layout Shift crossed the Core Web Vitals threshold.** It was 0.149, which Google reports as Needs Improvement in Search Console and which can affect ranking on competitive queries. It is now 0.009. We were one bad widget away from a CWV warning on our own marketing site.

## The unexpected bonus: my own brand colour was failing WCAG

Lighthouse mobile Accessibility had been hovering at 96 for a while. I assumed it was an artefact, or some third-party CSS I could not control. When I removed Elfsight I ran the report again expecting 100, and got 95. One point worse.

The cause turned out to be me, not Elfsight.

My brand red was `#f83739`. White text on `#f83739` gives a contrast ratio of 3.74:1, which is below WCAG AA's 4.5:1 threshold for normal-weight text. Every white-on-red button on the site (the header CTA, the new form submit, the cookie banner buttons) was failing the same automated check.

I swapped `#f83739` for `#d6262a`. The new red is three hex values darker, gives 5.02:1 contrast, and is visually indistinguishable from the original on any device I put it on. Lighthouse mobile Accessibility went 95 to 100. Site-wide, not just on /contact/.

<img src="/assets/blog/elfsight-red-button-contrast.jpg" alt="Side-by-side comparison of the two brand reds: #f83739 with white text at 3.74:1 contrast (fails WCAG AA) and #d6262a with white text at 5.02:1 contrast (passes WCAG AA)" width="1240" height="475" loading="lazy" />

The lesson there is worth more than the contact-form one. The accessibility tax is often microscopic when you actually measure it. People do not make their brand more accessible because no one has made them sit down with a contrast checker and a hex picker, not because the change costs anything visible.

## Cost

The Elfsight plan I was on costs $15 per month (about £12), and that covers three domains. Which sounds modest until you do the arithmetic.

| Line item | Elfsight | In-house |
| --- | --- | --- |
| Setup | 30 minutes (point and click) | 2 hours (one-off; reusable across every client site we build) |
| Per-three-domains fee | $15 / month | None |
| **Per-site fee** at portfolio scale | **$5 / site / month minimum** | None |
| Hosting cost | Included in subscription | Already paying Cloudflare's free tier; SMTP2GO account we already use |
| Data ownership | Held by Elfsight, accessed via their UI | Held by us, in our database, in our admin |
| Brand match | Limited to the widget's styling options | Full CSS control |
| Performance impact | -30 Lighthouse Performance on desktop | None |
| Cookie consent posture | Requires gating Elfsight behind opt-in (or accepting that the cookie policy is inaccurate) | Nothing to gate |

The per-site number is where this stops being a small saving and starts being structural. We manage just over a hundred client websites. Roughly twenty of them currently use Elfsight or a comparable third-party form / popup / embed widget that could be replaced with the same in-house pattern we just used on our own site. At three domains per plan that is **seven Elfsight subscriptions, $105 per month, or about £3,000 over three years, for one feature on twenty sites**.

Our in-house form is doing the same job on three of those sites today, with submissions landing in the relevant inbox, on UK servers, under retention rules we set ourselves. The rest are scheduled across the next quarter as part of natural refresh cycles or new builds.

That cost comparison only includes Elfsight. The same arithmetic plays out for every other widget category an agency typically wires up: pop-ups, social proof bars, Instagram feeds, review badges, embedded calendars. A site running half a dozen Elfsight-shaped widgets is paying half a dozen monthly subscriptions, every one of them with the same trade-offs we just talked about.

## Will paid plugins go the way of the letter?

I was tempted to title this piece "will paid plugins go the way of the letter?" The answer is more nuanced than the headline.

Letters did not die. They retreated to the use cases where physicality still matters: contracts, formal notice, handwritten condolences. Email took everything else. The category was reshaped, not erased.

The same retreat is happening to commodity SaaS widgets right now. Categories where the value is "good-enough functionality wrapped in a subscription" are losing their economic case, because the same functionality is now buildable in hours by a generalist working with an AI assistant. Forms. Calendars. Popups. Embedded chat. Pricing tables. Image carousels. Newsletter sign-up boxes. Live counters.

The categories that survive are the ones where "buy" genuinely beats "build". A useful way to draw the line:

| When | Buy | Build |
| --- | --- | --- |
| Functionality is commodity | × | ✓ |
| Recurring cost > 1-2 days of build | × | ✓ |
| Brand surface matters | × | ✓ |
| Performance budget is tight | × | ✓ |
| You own the customer relationship | × | ✓ |
| Security or compliance is load-bearing | ✓ | × |
| Network effects are the value | ✓ | × |
| Vendor moves faster than you can | ✓ | × |
| Specialist domain expertise is non-trivial | ✓ | × |

A form ticks every "build" row. So does a popup. So does a basic contact-form-with-postcode-lookup.

## Where buying still wins

The honest version of this argument needs the other side.

**Stripe** is the obvious one. I would not roll my own payment processor. PCI compliance, ledger reliability, fraud detection, regulatory reporting, the integration ecosystem. That is a problem we are happy to pay someone else to solve every month, forever. The functionality is not commodity; the depth is.

**Auth0, Clerk, Cognito.** Authentication has years of edge cases baked in. Social login plumbing, breach response, password rotation, SSO, MFA, account recovery. You can build sign-in in an afternoon. You cannot build the *correct* sign-in in an afternoon.

**HubSpot, Salesforce, Pipedrive.** The value is not the database schema, it is the integrations, the workflows, the reporting that ties to email, calendar, contracts, billing. You are paying for the ecosystem, not the storage.

**Slack, Teams, Linear.** The value is that everyone else uses them. Network effects, not features.

The line is roughly: pay for what you cannot replicate; build what only requires you to write the code.

## What this means for agencies

If you build websites for a living, this is the change you cannot keep ignoring. Every client site you ship that depends on a paid plugin has an ongoing cost (paid by the client, or absorbed by you on a managed-care plan) and a performance penalty (paid by every visitor). Both costs scale with traffic and with portfolio size. Across an agency portfolio of any meaningful size, the widget-licence line on the books is doing very little work for the money.

Owning the equivalent infrastructure ourselves means our clients' enquiries land directly in our clients' inboxes, on UK servers, with full audit trails, with no third-party scripts running in their visitor's browsers, and with no monthly subscription bills attached.

Three of our client sites are running on this stack already. Several more are scheduled across the next quarter, on the same pattern: an afternoon of integration work per site, no monthly bill, full brand control, full ownership of the data. There is no special technology required. There is no compromise on the brand or the user experience. There is only the time, which has fallen by an order of magnitude, and the willingness to do the work.

If your contact form is loading a third-party script right now, your /cookies/ page is almost certainly slightly inaccurate, your Lighthouse score is leaving twenty or thirty points on the floor, and your client is paying someone else a monthly fee for the privilege.

It is worth two hours to fix that.
