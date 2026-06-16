import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  Search,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { AuthButtons } from "@/components/auth-buttons";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/recipes");
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Brand />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Seu caderno culinário, sempre por perto.
        </span>
      </div>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-6 bg-secondary/80 px-3 py-1.5 text-primary">
            Feito para receitas que merecem ficar
          </Badge>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Todas as suas receitas,{" "}
            <span className="text-primary">bem organizadas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Guarde ingredientes, modo de preparo, fotos e aquele detalhe que
            transforma uma receita comum em receita de família.
          </p>
          <div className="mt-8 max-w-lg rounded-3xl border border-border bg-card p-4 shadow-xl shadow-primary/10 sm:p-5">
            <p className="mb-3 text-sm font-semibold">Comece com sua conta</p>
            <AuthButtons />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Suas receitas são privadas e visíveis apenas para você.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
            {["Busca rápida", "Tags pessoais", "Acesso no celular"].map(
              (feature) => (
                <span key={feature} className="inline-flex items-center gap-2">
                  <Check className="size-4 text-accent" aria-hidden="true" />
                  {feature}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mr-0">
          <div className="absolute -inset-20 -z-10 rounded-full bg-primary/10 blur-3xl" />
          <Card className="rotate-1 overflow-hidden border-card/70 bg-card/95 p-4 shadow-2xl shadow-primary/10 sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Receita salva
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  Bolo de laranja
                </h2>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-2xl">
                01
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="min-h-56 rounded-2xl bg-[radial-gradient(circle_at_30%_25%,rgba(221,214,254,0.95),transparent_26%),linear-gradient(145deg,var(--accent),var(--primary))] p-5 text-primary-foreground">
                <div className="flex h-full flex-col justify-between">
                  <span className="w-fit rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                    Sobremesa
                  </span>
                  <div>
                    <p className="text-4xl font-display font-bold">50</p>
                    <p className="text-sm text-primary-foreground/80">minutos</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-1">
                <div className="flex gap-2">
                  <Badge>família</Badge>
                  <Badge>domingo</Badge>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ingredientes
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {[
                      "3 laranjas maduras",
                      "2 xícaras de farinha",
                      "3 ovos",
                      "Açúcar e carinho",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Ver receita
                  <ArrowRight className="size-4" aria-hidden="true" />
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-card/55">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Encontre em segundos",
              text: "Pesquise pelo nome e use suas próprias tags para chegar à receita certa.",
            },
            {
              icon: Tags,
              title: "Organização do seu jeito",
              text: "Crie tags como jantar, rápido ou receita da vó sem uma estrutura engessada.",
            },
            {
              icon: ShieldCheck,
              title: "Seu espaço privado",
              text: "Cada conta acessa somente as próprias receitas, em qualquer dispositivo.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl p-4">
              <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
