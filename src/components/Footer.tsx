import { Github } from 'lucide-react';
import './Footer.css';

const GITHUB_REPO_URL = 'https://github.com/MedinaLeonel/MovieDealer';

export function Footer() {
  return (
    <footer className="app-footer">
      <p className="app-footer__text">
        Hecho con <span className="app-footer__heart">♥</span> por Leonzion — San Clemente del Tuyú — 2026
      </p>
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="app-footer__github"
        aria-label="Repositorio en GitHub"
      >
        <Github size={22} strokeWidth={2} />
      </a>
    </footer>
  );
}
