import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function notifyCandidate(
  email: string,
  status: "SHORTLISTED" | "REVIEW" | "REJECTED",
  jobTitle: string,
  candidateName: string,
  companyName: string
) {
  const messages = {
SHORTLISTED: `Dear {{candidateName}},
We are pleased to inform you that your application for the position of {{title}} has been shortlisted.
Our recruitment team was impressed with your profile and qualifications, and we would like to proceed with the next stage of the selection process. A member of our HR team will reach out to you shortly with further details regarding the next steps.
Thank you for your interest in joining our organization. We look forward to connecting with you soon.

Warm regards,  
HR Team  
{{companyName}}
`,

REVIEW: `Dear {{candidateName}},
Thank you for applying for the position of {{title}}.
We would like to inform you that your application is currently under review. Our hiring team is carefully evaluating all applications to ensure a fair and thorough selection process.
We appreciate your patience and interest in joining our organization. You will be notified once a decision has been made.

Best regards,  
HR Team  
{{companyName}}
`,

REJECTED: `Dear {{candidateName}},
Thank you for taking the time to apply for the position of {{title}} and for your interest in joining {{companyName}}.
After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We received a strong pool of applicants, and this decision was not an easy one.
We truly appreciate the effort you put into your application and encourage you to apply for future opportunities that match your skills and experience.

Wishing you every success in your job search.

Kind regards,  
HR Team  
{{companyName}}
`
  };

  let message = messages[status];

  message = message
    .replace(/{{candidateName}}/g, candidateName)
    .replace(/{{title}}/g, jobTitle)
    .replace(/{{companyName}}/g, companyName);

  await transporter.sendMail({
    from: `"HireSphere" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Application Status - ${jobTitle}`,
    text: message
  });
}
