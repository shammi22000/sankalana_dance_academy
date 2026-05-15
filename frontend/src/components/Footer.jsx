import { footerLinks } from "../utils/landingContent";
export function Footer() {
    return (<footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto_auto] md:items-start">
        <div className="max-w-sm">
          <h2 className="text-xl font-black text-white">Classical Dance Studio</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Empowering the world of dance through elegant technology and seamless management.
          </p>
          <p className="mt-8 text-xs font-semibold text-white/70">
            © 2026 Classical Dance Studio. Move with purpose.
          </p>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (<div key={group}>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">{group}</h3>
            <ul className="mt-4 grid gap-3">
              {links.map((link) => (<li key={link}>
                  <a className="text-sm text-white/60 transition hover:text-cyanGlow" href="#contact">
                    {link}
                  </a>
                </li>))}
            </ul>
          </div>))}
      </div>
    </footer>);
}
