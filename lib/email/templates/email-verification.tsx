import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface EmailVerificationProps {
  readonly userName?: string
  readonly verifyUrl: string
}

export function EmailVerification({
  verifyUrl,
  userName,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email Motion Finance</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Motion Finance</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Vérifiez votre adresse email</Heading>

            <Text style={paragraph}>
              {userName ? `Bonjour ${userName},` : "Bonjour,"}
            </Text>

            <Text style={paragraph}>
              Merci de vous être inscrit sur Motion Finance. Cliquez sur le
              bouton ci-dessous pour vérifier votre adresse email et activer
              votre compte.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button href={verifyUrl} style={button}>
                Vérifier mon adresse email
              </Button>
            </Section>

            {/* Expiration notice */}
            <Text style={notice}>
              Ce lien est valide pendant <strong>1 heure</strong>.
            </Text>

            {/* Fallback link */}
            <Text style={paragraph}>
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans
              votre navigateur :
            </Text>
            <Text style={linkText}>
              <Link href={verifyUrl} style={link}>
                {verifyUrl}
              </Link>
            </Text>

            {/* Security notice */}
            <Text style={securityNotice}>
              Si vous n&apos;avez pas créé de compte, vous pouvez ignorer cet
              email en toute sécurité.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Motion Finance - Gestion des finances personnelles
            </Text>
            <Text style={footerText}>
              Besoin d&apos;aide ? Contactez-nous à support@motion-finance.app
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f5f5f7",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
}

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
}

const logo = {
  fontSize: "28px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  margin: "0",
}

const content = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "40px",
  border: "1px solid rgba(99, 102, 241, 0.1)",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
}

const title = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#18181b",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#52525b",
  margin: "0 0 16px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 32px",
  display: "inline-block",
  border: "none",
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
}

const notice = {
  fontSize: "14px",
  color: "#71717a",
  textAlign: "center" as const,
  margin: "24px 0 16px 0",
}

const linkText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#52525b",
  margin: "8px 0 24px 0",
  wordBreak: "break-all" as const,
  backgroundColor: "#f4f4f5",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e4e4e7",
}

const link = {
  color: "#6366f1",
  textDecoration: "none",
}

const securityNotice = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#71717a",
  textAlign: "center" as const,
  padding: "16px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  border: "1px solid #bfdbfe",
  margin: "24px 0 0 0",
}

const footer = {
  textAlign: "center" as const,
  marginTop: "40px",
  paddingTop: "32px",
  borderTop: "1px solid #e4e4e7",
}

const footerText = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#a1a1aa",
  margin: "4px 0",
}

export default EmailVerification
