import { Resend } from "resend"
import { PasswordResetEmail } from "./templates/password-reset"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendPasswordResetEmailParams {
  resetUrl: string
  to: string
  userName?: string
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
