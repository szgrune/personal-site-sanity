import styles from './Colophon.module.css'

type ColophonProps = {
  text?: string | null
  email?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
}

export function Colophon({
  text,
  email,
  githubUrl,
  linkedinUrl,
}: ColophonProps) {
  const links = [
    email ? {href: `mailto:${email}`, label: 'Email'} : null,
    githubUrl ? {href: githubUrl, label: 'GitHub'} : null,
    linkedinUrl ? {href: linkedinUrl, label: 'LinkedIn'} : null,
  ].filter((link): link is {href: string; label: string} => link !== null)

  return (
    <footer className={styles.colophon}>
      <p>{text ?? 'The Lab @ MassDOT · Summer 2026'}</p>
      {links.length ? (
        <nav aria-label="Contact links">
          {links.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </footer>
  )
}
