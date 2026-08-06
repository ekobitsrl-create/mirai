import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient, getServerUserWithProfile } from "@/lib/supabase/server"
import { isAdminEmail } from "@/lib/admin"
import { Button } from "@/components/ui/button"

const PRODUCTS_TO_REMOVE = [
  "Valley Dreams Crystal Zip Hoodie - Blue",
  "Valley Crest Crystal Zip Hoodie - Black",
  "Valley Dreams Crystal Zip Hoodie - White",
  "Valley Script Distressed Jorts - White Wash",
  "Valley Crest Crystal Zip Hoodie - Purple",
] as const

async function cleanupProducts() {
  "use server"

  const { user, profile } = await getServerUserWithProfile()
  if (!user) throw new Error("Non autenticato")
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) {
    throw new Error("Non autorizzato")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .delete()
    .in("name", [...PRODUCTS_TO_REMOVE])
    .select("id, name")

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/negozio")
  revalidatePath("/collezioni")
  revalidatePath("/google-merchant-feed.xml")
  revalidatePath("/google-merchant-feed-minimal.xml")
  revalidatePath("/google-merchant-feed-mirai.xml")
  revalidatePath("/meta-product-feed-mirai.xml")
  revalidatePath("/sitemap.xml")

  redirect(`/admin/cleanup-products?deleted=${data?.length || 0}`)
}

export default async function CleanupProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>
}) {
  const { user, profile } = await getServerUserWithProfile()
  if (!user || (profile?.role !== "admin" && !isAdminEmail(user.email))) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const deleted = Number(params.deleted || 0)

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-xl border border-border bg-card p-8">
        <h1 className="mb-3 text-2xl font-semibold">Pulizia prodotti non validi</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Questa operazione elimina definitivamente dal database i cinque prodotti con immagini non valide.
        </p>

        {deleted > 0 && (
          <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            Eliminati definitivamente {deleted} prodotti.
          </div>
        )}

        <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
          {PRODUCTS_TO_REMOVE.map((name) => (
            <li key={name}>• {name}</li>
          ))}
        </ul>

        <form action={cleanupProducts}>
          <Button type="submit" variant="destructive">
            Elimina definitivamente i 5 prodotti
          </Button>
        </form>
      </div>
    </main>
  )
}
