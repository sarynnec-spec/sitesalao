import dynamic from 'next/dynamic'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/sections/hero'
import { Assinatura } from '@/components/sections/assinatura'
import { Modelos } from '@/components/sections/modelos'
import { Manifesto } from '@/components/sections/manifesto'
import { Servicos } from '@/components/sections/servicos'
import { Convite } from '@/components/sections/convite'
import { InstagramSection } from '@/components/sections/instagram'
import { Agendamento } from '@/components/sections/agendamento'
import { Contacto } from '@/components/sections/contacto'
import { SeparadorDourado } from '@/components/ui/separador-dourado'

/**
 * Camadas decorativas puras. Saem do bundle inicial porque nenhuma
 * delas é conteúdo: a página tem de estar legível e navegável muito
 * antes de haver poeira dourada no ar.
 */
const CinematicIntro = dynamic(() =>
  import('@/components/intro/cinematic-intro').then((m) => m.CinematicIntro),
)
const GoldDust = dynamic(() => import('@/components/effects/gold-dust').then((m) => m.GoldDust))

export default function Home() {
  return (
    <>
      <CinematicIntro />
      <SiteHeader />
      <GoldDust />

      <main id="conteudo">
        <Hero />
        <SeparadorDourado />
        <Assinatura />
        <SeparadorDourado />
        <Modelos />
        <SeparadorDourado />
        <Manifesto />
        <SeparadorDourado />
        <Servicos />
        <SeparadorDourado />
        <Convite />
        <SeparadorDourado />
        <InstagramSection />
        <SeparadorDourado />
        <Agendamento />
        <SeparadorDourado />
        <Contacto />
      </main>
    </>
  )
}
