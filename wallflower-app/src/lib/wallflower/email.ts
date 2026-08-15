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

// A full HTML document with inline styles (not a bare fragment) renders more
// reliably across clients and reads less like a bare "click this link"
// phishing pattern, which spam filters weigh independently of domain
// reputation.
function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#6b7d5c;color:#FBF6E9;text-decoration:none;font-weight:bold;font-family:Georgia,'Times New Roman',serif;font-size:15px;padding:12px 22px;border-radius:10px;">${label}</a>`;
}

function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px 16px;background:#efeae0;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:480px;margin:0 auto;background:#f7efdd;border-radius:16px;padding:32px 28px;color:#4a3d2c;">
      <div style="font-size:22px;font-style:italic;text-align:center;color:#4a3d2c;margin:0 0 20px;">🌷 Wallflower</div>
      ${bodyHtml}
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(122,100,70,0.2);font-size:12px;color:#a8977a;line-height:1.6;">
        Wallflower is a little garden of notes: everyone tucks in a bouquet and a message, hidden until you reveal it all at once.<br/>
        <a href="${getBaseUrl()}" style="color:#8a6a45;">Start your own →</a>
      </div>
    </div>
  </body>
</html>`;
}

function textFooter(): string {
  return `\n\n---\nWallflower is a little garden of notes: everyone tucks in a bouquet and a message, hidden until you reveal it all at once.\nStart your own: ${getBaseUrl()}`;
}

export function magicLinkEmail(url: string): Pick<Email, "subject" | "html" | "text"> {
  return {
    subject: "Your Wallflower sign-in link",
    text: `Hi there,\n\nHere's your sign-in link. It'll take you straight to your organizer dashboard:\n${url}\n\nThis link expires in 15 minutes. If you didn't request it, you can ignore this email.${textFooter()}`,
    html: layout(`
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">Hi there,</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">Here's your sign-in link. Tap the button below to get back to your organizer dashboard.</p>
      <p style="text-align:center;margin:28px 0;">${button("Sign in to Wallflower", url)}</p>
      <p style="font-size:13px;color:#a8977a;line-height:1.6;margin:0;">This link expires in 15 minutes. If you didn't request it, you can safely ignore this email.</p>
    `),
  };
}

export function eventCreatedEmail(params: {
  recipientName: string;
  occasionText: string;
  revealDate: Date | null;
  dashboardUrl: string;
  contributionUrl: string;
}): Pick<Email, "subject" | "html" | "text"> {
  const { recipientName, occasionText, revealDate, dashboardUrl, contributionUrl } = params;
  const revealText = revealDate
    ? revealDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : "whenever you're ready, just trigger it manually from your dashboard";

  return {
    subject: `Your garden for ${recipientName}'s ${occasionText} is planted 🌱`,
    text: `Thank you for planting a garden!\n\nYou've started one for ${recipientName}'s ${occasionText}, blooming on ${revealText}.\n\nNotes will land in your dashboard for a quick approve before they go up on the wall:\n${dashboardUrl}\n\nNow, share this link with ${recipientName}'s favorite people so they can tuck in their own notes:\n${contributionUrl}${textFooter()}`,
    html: layout(`
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">Thank you for planting a garden 🌱</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">You've started one for <strong>${recipientName}'s ${occasionText}</strong>, blooming on <strong>${revealText}</strong>.</p>
      <p style="font-size:15px;line-height:1.6;margin:0;">Notes will land in your dashboard for a quick approve before they go up on the wall.</p>
      <p style="text-align:center;margin:24px 0;">${button("Open your dashboard", dashboardUrl)}</p>
      <div style="margin:28px 0;padding:16px;background:#FBF6E9;border-radius:10px;">
        <p style="font-size:14px;line-height:1.6;margin:0 0 10px;">Now, share this link with ${recipientName}'s favorite people so they can tuck in their own notes:</p>
        <p style="font-size:13px;word-break:break-all;margin:0;"><a href="${contributionUrl}" style="color:#6b7d5c;">${contributionUrl}</a></p>
      </div>
    `),
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
    text: `Your bouquet is sealed and on its way 🌸\n\nIt'll stay hidden until ${recipientName}'s garden is revealed. You can revise it any time before then using your private link:\n${editUrl}\n\nDon't share this link. Anyone who has it can edit what you sent.${textFooter()}`,
    html: layout(`
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">Your bouquet is sealed and on its way 🌸</p>
      <p style="font-size:15px;line-height:1.6;margin:0;">It'll stay hidden until ${recipientName}'s garden is revealed. Changed your mind about something? You can revise it any time before then.</p>
      <p style="text-align:center;margin:28px 0;">${button("Edit your bouquet", editUrl)}</p>
      <p style="font-size:13px;color:#a8977a;line-height:1.6;margin:0;">Keep this link to yourself. Anyone who has it can edit what you sent.</p>
    `),
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
    text: `${contributorName} just tucked a bouquet into ${recipientName}'s garden. Give it a quick look before it goes up on the wall:\n${reviewUrl}${textFooter()}`,
    html: layout(`
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;"><strong>${contributorName}</strong> just tucked a bouquet into ${recipientName}'s garden 🌼</p>
      <p style="font-size:15px;line-height:1.6;margin:0;">Give it a quick look before it goes up on the wall.</p>
      <p style="text-align:center;margin:28px 0;">${button("Review it", reviewUrl)}</p>
    `),
  };
}

export function autoApprovedFyiEmail(params: {
  contributorName: string;
  recipientName: string;
  occasionText: string;
  dashboardUrl: string;
}): Pick<Email, "subject" | "html" | "text"> {
  const { contributorName, recipientName, occasionText, dashboardUrl } = params;
  return {
    subject: `${contributorName} added a bouquet for ${recipientName}'s ${occasionText}`,
    text: `${contributorName} just tucked a bouquet into ${recipientName}'s garden. Auto-approve is on, so it's already up on the wall. No action needed.\n\nView it in your dashboard:\n${dashboardUrl}${textFooter()}`,
    html: layout(`
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;"><strong>${contributorName}</strong> just tucked a bouquet into ${recipientName}'s garden 🌼</p>
      <p style="font-size:15px;line-height:1.6;margin:0;">Auto-approve is on, so it's already up on the wall. No action needed.</p>
      <p style="text-align:center;margin:28px 0;">${button("View your dashboard", dashboardUrl)}</p>
    `),
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
  const noteHtml = note
    ? `<p style="font-size:14px;line-height:1.6;background:#FBF6E9;border-radius:10px;padding:12px 14px;margin:0 0 20px;"><em>A note from the organizer:</em><br/>${note}</p>`
    : "";
  return {
    subject: `Your bouquet for ${recipientName}'s ${occasionText} needs a small change`,
    text: `Just a small thing: the organizer asked for a tweak before your bouquet can go up.${noteLine}\n\nYou can revise it here:\n${editUrl}${textFooter()}`,
    html: layout(`
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">Just a small thing: the organizer asked for a tweak before your bouquet can go up.</p>
      ${noteHtml}
      <p style="text-align:center;margin:28px 0;">${button("Revise your bouquet", editUrl)}</p>
    `),
  };
}
