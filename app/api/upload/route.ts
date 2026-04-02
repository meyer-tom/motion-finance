import { del, put } from "@vercel/blob"
import { NextResponse } from "next/server"
import sharp from "sharp"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/upload/types"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour uploader une image" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Récupérer le fichier depuis la requête
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Validation du type MIME
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as never)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP",
        },
        { status: 400 }
      )
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024} Mo`,
        },
        { status: 400 }
      )
    }

    // Conversion du fichier en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Compression et redimensionnement avec sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1000, 1000, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    // Récupérer l'utilisateur pour vérifier l'ancienne image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    })

    // Supprimer l'ancienne image si elle existe et vient de Vercel Blob
    if (user?.image?.includes(".vercel-storage.com")) {
      try {
        await del(user.image)
      } catch (error) {
        console.error(
          "[Upload] Erreur lors de la suppression de l'ancienne image:",
          error
        )
        // On continue même si la suppression échoue
      }
    }

    // Upload vers Vercel Blob
    const blob = await put(
      `users/${userId}/profile-picture.jpg`,
      optimizedBuffer,
      {
        access: "public",
        contentType: "image/jpeg",
      }
    )

    // Mettre à jour le champ User.image en BDD
    await prisma.user.update({
      where: { id: userId },
      data: { image: blob.url },
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error("[Upload] Erreur:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'upload",
      },
      { status: 500 }
    )
  }
}
