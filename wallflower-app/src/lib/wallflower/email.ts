const FROM = process.env.EMAIL_FROM ?? "Wallflower <onboarding@resend.dev>";

export function getBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

type Email = { to: string; subject: string; html: string; text: string };

/**
 * No transactional email provider is configured yet in any environment this
 * has run in, so this always logs. Wiring in a real provider (e.g. setting
 * RESEND_API_KEY) only requires filling in the fetch call below — the
 * call sites and templates don't change.
 */
export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[wallflower:email] to=${email.to} subject="${email.subject}"\n${email.text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: email.to, subject: email.subject, html: email.html }),
  });
  if (!res.ok) {
    console.error(`[wallflower:email] send failed (${res.status}): ${await res.text()}`);
  }
}

export function magicLinkEmail(url: string): Pick<Email, "subject" | "html" | "text"> {
  return {
    subject: "Your Wallflower sign-in link",
    text: `Sign in to Wallflower: ${url}\n\nThis link expires in 15 minutes.`,
    html: `<p>Sign in to Wallflower:</p><p><a href="${url}">${url}</a></p><p>This link expires in 15 minutes.</p>`,
  };
}

export function submissionConfirmationEmail(params: {
  recipientName: string;
  occasionText: string;
  editUrl: string;
}): Pick<Email, "subject" | "html" | "text"> {
  const { recipientName, occasionText, editUrl } = params;
  return {
    subject: `Your bouquet for ${recipientName}'s ${occasionText} is sealed`,
    text: `Your bouquet is sealed and on its way. You can revise it any time before the reveal using your private link:\n${editUrl}\n\nDon't share this link — anyone with it can edit your submission.`,
    html: `<p>Your bouquet is sealed and on its way. You can revise it any time before the reveal using your private link:</p><p><a href="${editUrl}">${editUrl}</a></p><p>Don't share this link — anyone with it can edit your submission.</p>`,
  };
}

export function reviewRequestEmail(params: {
  contributorName: string;
  recipientName: string;
  occasionText: string;
  reviewUrl: string;
}): Pick<Email, "subject" | "html" | "text"> {
  const { contributorName, recipientName, occasionText, reviewUrl } = params;
  return {
    subject: `${contributorName} sent a bouquet for ${recipientName}'s ${occasionText}`,
    text: `${contributorName} just sent a bouquet. Review it here:\n${reviewUrl}`,
    html: `<p><strong>${contributorName}</strong> just sent a bouquet.</p><p><a href="${reviewUrl}">Review it</a></p>`,
  };
}

export function denyNotificationEmail(params: {
  recipientName: string;
  occasionText: string;
  note: string | null;
  editUrl: string;
}): Pick<Email, "subject" | "html" | "text"> {
  const { recipientName, occasionText, note, editUrl } = params;
  const noteLine = note ? `\n\nA note from the organizer:\n${note}` : "";
  const noteHtml = note ? `<p><em>A note from the organizer:</em><br/>${note}</p>` : "";
  return {
    subject: `Your bouquet for ${recipientName}'s ${occasionText} needs a small change`,
    text: `The organizer asked for a small change to your bouquet before it can go up.${noteLine}\n\nYou can revise it here:\n${editUrl}`,
    html: `<p>The organizer asked for a small change to your bouquet before it can go up.</p>${noteHtml}<p>You can revise it here: <a href="${editUrl}">${editUrl}</a></p>`,
  };
}
