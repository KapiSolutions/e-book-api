
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">
<b>Secure E-book Sales Solution with Nest.js and Dynamic Watermarking</b>
</p>



### Description

This project delivers a cost-effective solution for selling e-books online, ensuring payment security and content protection with minimal upfront costs. It integrates Stripe for seamless payment processing, Linktree Store for product display, and a Nest.js backend for automated e-book delivery and customization.

- Stripe integration: Handles secure payments for e-book purchases through the user-friendly Stripe platform.
- Linktree Store: Provides an organized product showcase with "buy now" buttons seamlessly directing users to Stripe checkout.
- Google Cloud storage: Securely stores e-books with industry-leading security measures.
- Nest.js backend:
  -  Processes Stripe webhooks to trigger e-book downloads from Google Cloud Storage upon successful payments.
  -  Dynamically adds watermarks to downloaded PDFs, incorporating buyer's name and email for piracy prevention.
  -  Updates PDF metadata with purchase details for enhanced tracking.
  -  Sends automated purchase confirmation emails with purchased e-books to buyers using Nodemailer.
- Deployment: This project is currently deployed on Render.com, a cloud platform providing hosting and serverless functions.

### Benefits

- Simplified sales process: Streamlines e-book sales journey for client's customers.
- Secure payments: Ensures safe and reliable transactions through Stripe.
- Content protection: Dynamic watermarks deter unauthorized usage and protect intellectual property.
- Automated delivery: Eliminates manual intervention, providing a smooth experience for buyers.
- Purchase confirmation: Keeps buyers informed and builds trust.
- Cost-Effectiveness: Leverages free and open-source technologies while utilizing cost-efficient platforms.

### Tech Stack
- Nest.js / Node.js
- TypeScript
- Stripe
- Google Cloud Storage
- NodeMailer

[![Tech stack](https://skillicons.dev/icons?i=nestjs,nodejs,ts,googlecloud)](https://skillicons.dev)
