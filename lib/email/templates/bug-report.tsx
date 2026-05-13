import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

const SEVERITY_LABELS: Record<string, string> = {
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Élevé",
  CRITICAL: "Critique",
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#6b7280",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
}

interface BugReportEmailProps {
  readonly description: string
  readonly pageUrl: string
  readonly reportId: string
  readonly reporterEmail: string
  readonly reporterName: string
  readonly screenshotUrl?: string
  readonly severity: string
  readonly title: string
}

export function BugReportEmail({
  reportId,
  title,
  description,
  severity,
  pageUrl,
  reporterName,
  reporterEmail,
  screenshotUrl,
}: BugReportEmailProps) {
  const severityLabel = SEVERITY_LABELS[severity] ?? severity
  const severityColor = SEVERITY_COLORS[severity] ?? "#6b7280"
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/bugs`

  return (
    <Html lang="fr">
      <Head />
      <Preview>
        [Bug #{reportId.slice(-6)}] {title} — Motion Finance
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerLogo}>Motion Finance</Text>
            <Text style={headerSub}>Rapport de bug</Text>
          </Section>

          <Section style={card}>
            <Section style={badgeRow}>
              <Text
                style={{
                  ...severityBadge,
                  backgroundColor: severityColor,
                }}
              >
                {severityLabel}
              </Text>
            </Section>

            <Heading style={titleStyle}>{title}</Heading>

            <Section style={metaBox}>
              <Text style={metaItem}>
                <strong>Signalé par :</strong> {reporterName} (
                <Link href={`mailto:${reporterEmail}`} style={inlineLink}>
                  {reporterEmail}
                </Link>
                )
              </Text>
              <Text style={metaItem}>
                <strong>Page :</strong>{" "}
                <Link href={pageUrl} style={inlineLink}>
                  {pageUrl}
                </Link>
              </Text>
              <Text style={metaItem}>
                <strong>Référence :</strong> #{reportId.slice(-8)}
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={sectionLabel}>Description</Text>
            <Section style={descBox}>
              <Text style={descText}>{description}</Text>
            </Section>

            {screenshotUrl ? (
              <>
                <Text style={sectionLabel}>Capture d&apos;écran</Text>
                <Img
                  alt="Capture d'écran du bug"
                  src={screenshotUrl}
                  style={screenshot}
                  width="100%"
                />
              </>
            ) : null}

            <Hr style={divider} />

            <Section style={ctaSection}>
              <Link href={adminUrl} style={ctaButton}>
                Voir tous les rapports
              </Link>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Motion Finance · Gestion des finances personnelles
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f4f4f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 16px",
  maxWidth: "580px",
}

const header = {
  backgroundColor: "#ef4444",
  borderRadius: "12px 12px 0 0",
  padding: "20px 32px",
  textAlign: "center" as const,
}

const headerLogo = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0",
  letterSpacing: "-0.3px",
}

const headerSub = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.8)",
  margin: "4px 0 0",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 12px 12px",
  padding: "32px 40px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
}

const badgeRow = {
  marginBottom: "16px",
}

const severityBadge = {
  display: "inline-block",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  padding: "4px 10px",
  borderRadius: "20px",
  margin: "0",
}

const titleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 16px",
  letterSpacing: "-0.3px",
}

const metaBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
  marginBottom: "20px",
}

const metaItem = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#4b5563",
  margin: "0 0 6px",
}

const divider = {
  borderColor: "#f3f4f6",
  margin: "20px 0",
}

const sectionLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  color: "#9ca3af",
  margin: "0 0 8px",
}

const descBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
  marginBottom: "20px",
}

const descText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#374151",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
}

const screenshot = {
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  marginBottom: "20px",
  maxWidth: "100%",
}

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "4px",
}

const ctaButton = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
}

const inlineLink = {
  color: "#4f46e5",
  textDecoration: "none",
}

const footer = {
  textAlign: "center" as const,
  paddingTop: "24px",
}

const footerText = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
}

export default BugReportEmail
