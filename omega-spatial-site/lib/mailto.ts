export function buildMailto({
  to,
  subject,
  body
}: {
  to: string;
  subject: string;
  body: string;
}): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
}

export function buildToolInquiryMailto(toolTitle: string, contactEmail: string, subjectPrefix: string): string {
  const subject = `${subjectPrefix}Tool inquiry — ${toolTitle}`;
  const body = `I'm interested in: ${toolTitle}

Context: [one sentence]

Goal: [one sentence]

(Omega Spatial is human-led, non-autonomous, visual reasoning only.)`;

  return buildMailto({ to: contactEmail, subject, body });
}

export function buildWorkshopInquiryMailto(workshopTitle: string, contactEmail: string, subjectPrefix: string): string {
  const subject = `${subjectPrefix}Workshop inquiry — ${workshopTitle}`;
  const body = `Interested in: ${workshopTitle}

Team size:

Domain:

What we want clarity on:

(Omega Spatial is human-led, non-autonomous, visual reasoning only.)`;

  return buildMailto({ to: contactEmail, subject, body });
}



