import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface PasswordResetEmailProps {
  readonly resetUrl: string
  readonly userName?: string
}

export function PasswordResetEmail({
  resetUrl,
  userName,
}: PasswordResetEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>
        Réinitialisez votre mot de passe Motion Finance — Lien valide 1 heure
      </Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={headerLogo}>Motion Finance</Text>
          </Section>

          {/* Card */}
          <Section style={card}>

            {/* Icon */}
            <Section style={iconContainer}>
              <Text style={icon}>🔑</Text>
            </Section>

            <Heading style={title}>Réinitialisation de mot de passe</Heading>

            <Text style={paragraph}>
              {userName ? `Bonjour ${userName},` : "Bonjour,"}
            </Text>

            <Text style={paragraph}>
              Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur
              le bouton ci-dessous pour en créer un nouveau.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button href={resetUrl} style={button}>
                Réinitialiser mon mot de passe
              </Button>
            </Section>

            {/* Expiration notice */}
            <Text style={notice}>
              Ce lien expire dans <strong>1 heure</strong>.
            </Text>

            <Hr style={divider} />

            {/* Fallback link */}
            <Text style={fallbackLabel}>Lien alternatif :</Text>
            <Text style={linkText}>
              <Link href={resetUrl} style={link}>
                {resetUrl}
              </Link>
            </Text>

            {/* Security notice */}
            <Section style={securityBox}>
              <Text style={securityNotice}>
                Si vous n&apos;avez pas demandé cette réinitialisation, ignorez cet
                email. Votre mot de passe ne sera pas modifié.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Motion Finance · Gestion des finances personnelles</Text>
            <Text style={footerText}>
              <Link href="mailto:support@motion-finance.app" style={footerLink}>
                support@motion-finance.app
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f4f4f6",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 16px",
  maxWidth: "560px",
}

const header = {
  backgroundColor: "#4f46e5",
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

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 12px 12px",
  padding: "40px 40px 32px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
}

const iconContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
}

const icon = {
  fontSize: "32px",
  margin: "0",
  lineHeight: "1",
}

const title = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
  letterSpacing: "-0.3px",
}

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 14px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "28px 0 20px",
}

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "13px 28px",
  display: "inline-block",
  border: "none",
}

const notice = {
  fontSize: "13px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
}

const divider = {
  borderColor: "#f3f4f6",
  margin: "0 0 20px 0",
}

const fallbackLabel = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "0 0 6px 0",
}

const linkText = {
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 24px 0",
  wordBreak: "break-all" as const,
  backgroundColor: "#f9fafb",
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #e5e7eb",
}

const link = {
  color: "#4f46e5",
  textDecoration: "none",
}

const securityBox = {
  backgroundColor: "#fffbeb",
  borderRadius: "8px",
  border: "1px solid #fde68a",
  padding: "12px 16px",
}

const securityNotice = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "0",
}

const footer = {
  textAlign: "center" as const,
  paddingTop: "24px",
}

const footerText = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#9ca3af",
  margin: "2px 0",
}

const footerLink = {
  color: "#9ca3af",
  textDecoration: "underline",
}

export default PasswordResetEmail
