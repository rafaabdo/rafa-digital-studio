/* ============================================================
   RAFA DIGITAL STUDIO — Site configuration
   ------------------------------------------------------------
   هذا هو المكان الوحيد لتعديل بيانات التواصل وقناة إرسال النموذج.
   Fill in your real details below, then save the file. Empty values
   are hidden automatically across the website.

   EMAIL:        your real studio email (also used by the form).
   PHONE:        international format, e.g. "+967 7xx xxx xxx".
   WHATSAPP:     digits only, including country code (no + or spaces).
   SOCIALS:      full profile URLs.
   FORM:
     - Leave endpoint empty to send through FormSubmit using EMAIL.
       The first submission triggers a one-time activation email from
       formsubmit.co to your inbox. Confirm it once, then it works.
     - Or paste a Formspree / Web3Forms / custom endpoint in endpoint.
   ============================================================ */

window.RAFA_CONFIG = {
  email: "",                       // e.g. "hello@yourdomain.com"
  phone: "",                       // e.g. "+967 700 000 000"
  whatsapp: "",                    // e.g. "967700000000"
  socials: {
    instagram: "",                 // e.g. "https://instagram.com/yourhandle"
    linkedin: "",                  // e.g. "https://linkedin.com/in/yourhandle"
    x: ""                          // e.g. "https://x.com/yourhandle"
  },
  form: {
    provider: "formsubmit",        // "formsubmit" | "endpoint"
    endpoint: "",                  // optional custom endpoint (Formspree, Web3Forms, etc.)
    accessKey: ""                  // optional (Web3Forms access key)
  },
  siteUrl: "https://rafadigitalstudio.com"
};
