import type { PropsWithChildren } from 'react'

interface PanelProps extends PropsWithChildren {
  title: string
  description?: string
}

export const Panel = ({ title, description, children }: PanelProps) => (
  <section className="app-card flex flex-col gap-5">
    <header className="space-y-2">
      <h2 className="text-[28px] font-bold leading-tight text-white">{title}</h2>
      {description ? <p className="text-[20px] text-slate-200">{description}</p> : null}
    </header>
    {children}
  </section>
)
