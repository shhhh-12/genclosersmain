// Application form. Questions and options are word for word from the core content PDF.
// Lines marked "UI copy" are interface text written for the site.

export type Field =
  | { id: string; type: "text" | "tel" | "email"; label: string; placeholder: string; autoComplete: string }
  | { id: string; type: "choice"; label: string; options: string[] };

export const applicationForm = {
  heading: "Reserve My Seat", // UI copy (reuses the CTA label)
  submitLabel: "Reserve My Seat",
  sendingLabel: "Sending…", // UI copy
  fields: [
    { id: "fullName", type: "text", label: "Full Name", placeholder: "Enter your full name", autoComplete: "name" },
    { id: "whatsapp", type: "tel", label: "Phone Number (WhatsApp)", placeholder: "Enter your WhatsApp number", autoComplete: "tel" },
    { id: "email", type: "email", label: "Email Address", placeholder: "Enter your email", autoComplete: "email" },
    {
      id: "occupation", type: "choice", label: "Occupation",
      options: ["Student", "Business Owner", "Aspiring Entrepreneur", "Freelancer", "Salesperson", "Working Professional", "Other"],
    },
    {
      id: "goal", type: "choice", label: "What do you want to use sales for?",
      options: [
        "To start or grow a career in sales",
        "To sell my own product or business",
        "To win more clients as a freelancer",
        "To get better at the sales job I already have",
        "Just to build the skill for life",
      ],
    },
    {
      id: "experience", type: "choice", label: "How would you describe your current sales experience?",
      options: [
        "Complete Beginner. I have little to no experience in sales.",
        "Currently Learning. I understand the basics and am building my skills.",
        "Intermediate. I have some experience and can handle sales conversations.",
        "Highly Skilled. I have strong experience and can close deals on my own.",
      ],
    },
    {
      id: "seriousness", type: "choice", label: "How serious are you about learning sales as a real skill?",
      options: [
        "Extremely serious. I'm committed to mastering it.",
        "Moderately interested. I want to explore sales as a career option.",
        "Just exploring. I'm still figuring out if sales is right for me.",
      ],
    },
    {
      id: "decisionMaker", type: "choice", label: "Are you the main decision maker for joining this program?",
      options: ["Yes, I can decide on my own.", "No, I need to discuss it with my parents, spouse or family first."],
    },
    {
      id: "readiness", type: "choice", label: "The program fee is ₹20,000. Are you ready to invest in yourself right now?",
      options: ["Yes, I'm ready to join this batch.", "I need some time to arrange it.", "Not right now."],
    },
  ] satisfies Field[],

  // UI copy: review and replace with your own words if you like.
  success: {
    heading: "Application received.",
    body: "We will reach out on WhatsApp.",
    whatsappLabel: "Message us on WhatsApp",
    whatsappText: "Hi, I just applied for the",
  },
  error: "Something went wrong sending your application. Please try again, or message us on WhatsApp.",
};
