# AdWords Handoff — Area Wide Paving

**Goal:** Drive new asphalt paving jobs (driveway + parking lot) from Google Search ads.
**Site:** https://areawidepaving.net

---

## 1. Setup checklist (one-time, in this order)

### 1a. Create Google Ads + GA4
- [ ] Google Ads account at [ads.google.com](https://ads.google.com) — billing in Paul's name
- [ ] GA4 property at [analytics.google.com](https://analytics.google.com) — measurement ID looks like `G-XXXXXXXXXX`
- [ ] Link GA4 ↔ Google Ads (Tools → Linked accounts in Ads)
- [ ] Verify ownership of `areawidepaving.net` in [Search Console](https://search.google.com/search-console)

### 1b. Create conversion actions in Google Ads
Tools → Conversions → New action → Website. Create THREE:

| Conversion name | Category | Value | Count | Lookback |
|---|---|---|---|---|
| Phone Click | Phone calls | $200 (avg job value × close rate) | One | 90 days |
| Lead Form Submit | Submit lead form | $400 | One | 90 days |
| Thank You Page View | Submit lead form | $400 | One | 90 days |

> Use only ONE of "Lead Form Submit" or "Thank You Page View" as the **primary** conversion to avoid double-counting. I recommend **Thank You Page View** (more reliable — fires server-confirmed). Set the other to "secondary."

After creating, Google gives each one a label like `abc123XYZ`. Drop them into:

`js/analytics.js` — top of file:
```js
var AW_CONVERSION_ID = 'AW-XXXXXXXXX';   // ← your Google Ads ID
var GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // ← your GA4 measurement ID
var CONVERSION_LABELS = {
  phone_click:      'PASTE_PHONE_LABEL_HERE',
  lead_form_submit: 'PASTE_FORM_LABEL_HERE',
  text_click:       'PASTE_TEXT_LABEL_HERE'
};
```

Commit, push, deploy. Test by clicking your own phone number on the live site → should appear in Google Ads conversions within 24 hrs.

### 1c. Add license & insurance numbers (trust signal)
On the trust rows of every LP you currently see "Licensed · Insured · Bonded". Add real numbers to make this 10× stronger. Paul, send me:
- TX contractor license # (if applicable)
- Insurance carrier name + policy expiry month/year
- Bonded amount (e.g. "Bonded to $1M")

I'll inline them site-wide in one pass.

---

## 2. Conversion plumbing — what's already done

You don't need to do anything for the items below; they're shipped.

- [x] `/api/contact` server-side endpoint with honeypot spam filter
- [x] All 13 paving landing pages submit real leads to Paul's email (Resend)
- [x] All form submits redirect to `/thank-you.html` for clean conversion firing
- [x] All `tel:` links auto-fire phone-click conversions site-wide
- [x] All `sms:` links fire text-click conversions
- [x] UTM parameters and `gclid` are captured + sent with every lead so you'll see in Paul's email which ad/keyword produced each lead
- [x] `?ad=1` mode strips nav/footer/cross-links for paid traffic — append `?ad=1` to all Final URLs in your ads

---

## 3. Recommended campaign structure

### Single-campaign approach (recommended for budget < $3K/mo)
**Campaign:** Northeast TX Paving — Search
**Budget:** start at $50/day, raise once Quality Score ≥ 7
**Bidding:** Maximize Conversions (no tCPA cap for first 30 days)
**Locations:** Sulphur Springs, Tyler, Longview, Greenville, Paris, Mount Pleasant, Texarkana, Marshall, Hopkins County, Smith County, Gregg County, Hunt County, Lamar County (+ surrounding 30-mile radius)
**Languages:** English
**Network:** Google Search only (turn OFF Display + Search Partners)
**Ad rotation:** Optimize

### Ad groups + landing pages

| Ad group | Top keywords (Phrase match) | Final URL |
|---|---|---|
| Driveway — Generic | "asphalt driveway paving", "driveway paving contractor", "asphalt driveway near me" | `/asphalt-driveway-paving.html?ad=1` |
| Driveway — Replace | "asphalt driveway replacement", "replace asphalt driveway", "resurface driveway" | `/driveway-replacement-resurfacing.html?ad=1` |
| Driveway — Tyler | "asphalt driveway Tyler TX", "driveway paving Tyler" | `/asphalt-driveway-paving-tyler-tx.html?ad=1` |
| Driveway — Longview | "asphalt driveway Longview", "driveway paving Longview TX" | `/asphalt-driveway-paving-longview.html?ad=1` |
| Driveway — Greenville | "asphalt driveway Greenville TX", "driveway paving Greenville" | `/asphalt-driveway-paving-greenville.html?ad=1` |
| Driveway — Paris | "asphalt driveway Paris TX", "driveway contractor Paris" | `/asphalt-driveway-paving-paris-tx.html?ad=1` |
| Parking Lot — Generic | "commercial parking lot paving", "parking lot paving contractor", "asphalt parking lot" | `/commercial-parking-lot-paving.html?ad=1` |
| Parking Lot — Tyler | "parking lot paving Tyler TX", "Tyler parking lot contractor" | `/parking-lot-paving-tyler-tx.html?ad=1` |
| Parking Lot — Longview | "parking lot paving Longview", "Longview parking lot contractor" | `/parking-lot-paving-longview.html?ad=1` |
| Parking Lot — Greenville | "parking lot paving Greenville", "Greenville parking lot contractor" | `/parking-lot-paving-greenville.html?ad=1` |
| Parking Lot — Paris | "parking lot paving Paris TX" | `/parking-lot-paving-paris-tx.html?ad=1` |
| Asphalt Repair | "asphalt repair", "pothole repair", "patch asphalt driveway" | `/asphalt-repair-sealcoating.html?ad=1` |

> Start with the 3 strongest performers only (Driveway — Generic, Parking Lot — Generic, Driveway — Tyler) for the first 30 days. Expand once you have data.

---

## 4. Negative keyword list (paste in as Campaign-level negatives)

These prevent wasted spend on searches that look like paving but aren't.

```
# DIY / materials / not-a-customer
diy
how to
recipe
materials
calculator
truck load
ton price
asphalt for sale
asphalt sale
hot mix
cold patch
asphalt millings
free
cheap
quote calculator

# Jobs / hiring (NOT paving customers)
jobs
hiring
employment
careers
salary
crew
contractor jobs
asphalt jobs
laborer
paving company jobs
foreman

# Concrete (we are asphalt)
concrete
stamped
decorative
exposed aggregate

# Off-topic word collisions
bob ross
painting
art
canvas
roof
roofing
shingle
roller skating
parking lot striping only
striping only
sealcoat only

# Other contractors / brands
craigslist
home depot
lowes
ace hardware
yelp
angi
angies list
nextdoor

# Wrong intent
photo
photos
images
clip art
texture
wallpaper
song lyrics
movie
```

Paste into Google Ads → Tools → Negative keyword lists → Create list "Master Negatives — Paving" → apply at campaign level.

---

## 5. Ad copy starting templates

### Driveway — Generic ad group
**Headlines (write 8+; Google rotates):**
1. Asphalt Driveway Paving in NE TX
2. Free Quote in 24 Hours
3. Owner Paul Pogue Answers
4. 22+ Years · Licensed & Insured
5. 4.9★ · 47 Google Reviews
6. Driveway Paved Right the First Time
7. Honest Itemized Quotes
8. No Salespeople. Just Paul.
9. Same Crew Every Job
10. Sulphur Springs to Tyler & Beyond

**Descriptions (write 4):**
1. Owner Paul Pogue is on every jobsite. 22+ years paving driveways across Northeast Texas. Free itemized quote in 24 hours.
2. No salespeople. No call centers. Paul answers the phone himself. Licensed, insured, bonded. Call (903) 885-6388.
3. New driveway, replacement, or resurface — done right with proper base prep and 2-3" hot-mix asphalt. 4.9★ Google.
4. Free on-site visit. Real numbers, no padding. Booked 1 week out — call now to lock your spot.

**Sitelinks (4):**
- Driveway Replacement → `/driveway-replacement-resurfacing.html?ad=1`
- Free Quote in 24 Hrs → `/contact.html?ad=1`
- See Paul's Reviews → `/reviews.html`
- About Paul → `/about.html`

**Callouts (6):**
- Owner on every job
- 22+ years experience
- 4.9★ Google · 47 reviews
- Licensed & insured
- Free itemized quote
- Call back same day

**Structured snippets:**
- Service catalog: New driveways, Driveway replacement, Resurfacing, Sealcoating, Striping, Asphalt repair

**Phone extension:** (903) 885-6388 (use call asset)

**Location extension:** Tie to Google Business Profile

---

## 6. UTM convention

All ad Final URLs should include UTMs so Paul can see in his lead emails which ad produced the lead.

**Format:**
```
/PATH?ad=1&utm_source=google&utm_medium=cpc&utm_campaign={CAMPAIGN}&utm_content={ADGROUP}&utm_term={KEYWORD}
```

Use Google Ads ValueTrack auto-fill where possible:
- `{campaignid}` → utm_campaign
- `{adgroupid}` → utm_content
- `{keyword}` → utm_term
- `{matchtype}` → utm_term suffix

**Example final URL for "Driveway — Tyler" ad group:**
```
https://areawidepaving.net/asphalt-driveway-paving-tyler-tx.html?ad=1&utm_source=google&utm_medium=cpc&utm_campaign=netx-paving-search&utm_content=driveway-tyler&utm_term={keyword}
```

The site auto-captures `gclid` for offline conversion import too.

---

## 7. Daily/weekly operating rhythm (first 60 days)

### Daily (5 minutes)
- [ ] Check phone calls log — did any leads come in?
- [ ] Note in CRM/notebook: which ad group produced each call

### Weekly (30 minutes)
- [ ] Search terms report — add wasteful terms to negatives
- [ ] Bid adjustments — pause keywords with > $50 spend and 0 conversions
- [ ] Review Quality Score per keyword — anything < 5/10 needs LP improvement

### Monthly
- [ ] Check Core Web Vitals on `pagespeed.web.dev` for top 3 LPs
- [ ] Add new ad copy variants
- [ ] Expand winning ad groups, prune losers

---

## 8. Quality Score safeguards (already implemented)

The site is set up to score well on:

- **Landing page experience**: All LPs have unique title + meta description matching ad keyword intent
- **Mobile-friendly**: Responsive on all LPs (manually tested)
- **Page speed**: Hero videos use `preload="metadata"` (not `auto`), fonts use `font-display: swap`
- **Conversion path**: Every LP has phone CTA above-the-fold + lead form + sticky mobile call bar
- **HTTPS**: site is on HTTPS (Vercel default)
- **Privacy**: no third-party tracking beyond Google Ads/GA4

Things to monitor:
- LCP < 2.5s (currently good with `preload="metadata"`)
- CLS < 0.1 (currently good)
- INP < 200ms (currently good)

---

## 9. Things that are good to do later (not blocking launch)

- Live Google Reviews widget (currently static "4.9★ · 47 reviews" text — fine, but actual scrolling reviews build more trust). Use [Trustindex](https://www.trustindex.io) free embed or roll your own with Places API.
- CallRail or another call tracking service to attribute offline phone calls to the specific ad — useful at $1K+/mo ad spend.
- A/B test of the hero headline using Google Ads Experiments + 2 LP variants.
- Schema markup for Reviews so star rating shows in Google search results.

---

## 10. Emergency: if ads launch and nothing converts

Run through this checklist:

1. **Did the conversion fire?** Open Chrome DevTools → Network tab on /thank-you.html. Look for a `gtag/js` request. If missing, IDs aren't filled in `js/analytics.js`.
2. **Are forms emailing Paul?** Submit a test form yourself. Check Paul's inbox + spam.
3. **Is `gclid` getting captured?** Open `/asphalt-driveway-paving.html?ad=1&gclid=test123`, fill the form, check Paul's email — `[Source: gclid=test123…]` should appear.
4. **Are negatives applied?** Tools → Search terms → look for irrelevant queries.
5. **Is the LP ranking high enough on intent?** Check Quality Score in Keywords tab. < 5/10 means landing page is mismatched.
6. **Bidding too low?** First Page Bid > your max bid means you're not showing.

---

## 11. Files added in this AdWords-prep pass

- `js/analytics.js` — GA4 + Google Ads gtag, phone-click tracking, UTM persistence, `?ad=1` paid mode
- `js/lead-form.js` — shared form handler with honeypot + conversion fire + `/thank-you.html` redirect
- `api/contact.js` — updated with honeypot + attribution capture (`.net` domain)
- `thank-you.html` — conversion-firing landing for form submits
- `docs/adwords-handoff.md` — this file
- All 13 paving LPs wired to real form submission + analytics
- All 18 video tags switched to `preload="metadata"` for mobile LCP

— Ready to launch ads as soon as you paste the conversion IDs into `js/analytics.js`.
