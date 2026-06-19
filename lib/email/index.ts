import { Resend } from "resend"
import { BugReportEmail } from "./templates/bug-report"
import { EmailChange } from "./templates/email-change"
import { EmailVerification } from "./templates/email-verification"
import { PasswordResetEmail } from "./templates/password-reset"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendPasswordResetEmailParams {
  resetUrl: string
  to: string
  userName?: string
}

interface SendVerificationEmailParams {
  to: string
  userName?: string
  verifyUrl: string
}

/**
 * Envoie un email de vérification d'adresse email
 */
export async function sendVerificationEmail({
  to,
  verifyUrl,
  userName,
}: SendVerificationEmailParams): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: "Vérifiez votre adresse email - Motion Finance",
      react: EmailVerification({ verifyUrl, userName }),
    })

    if (error) {
      console.error(
        "[Email] Erreur lors de l'envoi de l'email de vérification:",
        error
      )
      return
    }

    console.log(`[Email] Email de vérification envoyé à ${to}`)
  } catch (error) {
    console.error("[Email] Erreur inattendue lors de l'envoi:", error)
  }
}

interface SendEmailChangeVerificationParams {
  newEmail: string
  to: string
  userName?: string
  verifyUrl: string
}

export async function sendEmailChangeVerification({
  to,
  verifyUrl,
  userName,
  newEmail,
}: SendEmailChangeVerificationParams): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: "Confirmez votre nouvelle adresse email - Motion Finance",
      react: EmailChange({ verifyUrl, userName, newEmail }),
    })

    if (error) {
      console.error("[Email] Erreur lors de l'envoi de l'email de changement:", error)
      return
    }

    console.log(`[Email] Email de changement d'adresse envoyé à ${to}`)
  } catch (error) {
    console.error("[Email] Erreur inattendue lors de l'envoi:", error)
  }
}

interface SendBugReportEmailParams {
  description: string
  emailPrefix: string
  pageUrl: string
  reportId: string
  reporterEmail: string
  reporterName: string
  screenshotUrl?: string
  severity: string
  title: string
  type: string
}

export async function sendBugReportEmail({
  reportId,
  title,
  description,
  severity,
  pageUrl,
  reporterName,
  reporterEmail,
  screenshotUrl,
  emailPrefix,
  type,
}: SendBugReportEmailParams): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: "tom31.meyer@gmail.com",
      subject: `${emailPrefix} ${title}`,
      react: BugReportEmail({
        reportId,
        title,
        description,
        severity,
        pageUrl,
        reporterName,
        reporterEmail,
        screenshotUrl,
        type,
      }),
    })

    if (error) {
      console.error("[Email] Erreur lors de l'envoi du rapport de bug:", error)
    }
  } catch (error) {
    console.error("[Email] Erreur inattendue lors de l'envoi:", error)
  }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param to - Adresse email du destinataire
 * @param resetUrl - URL de réinitialisation générée par Better Auth
 * @param userName - Prénom de l'utilisateur (optionnel)
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: "Réinitialisation de votre mot de passe - Motion Finance",
      react: PasswordResetEmail({ resetUrl, userName }),
    })

    if (error) {
      console.error(
        "[Email] Erreur lors de l'envoi de l'email de reset:",
        error
      )
      // Ne pas throw pour éviter de révéler si l'email existe (timing attack)
      return
    }

    console.log(`[Email] Email de réinitialisation envoyé à ${to}`)
  } catch (error) {
    console.error("[Email] Erreur inattendue lors de l'envoi:", error)
    // Ne pas throw pour éviter de bloquer l'utilisateur
  }
}
