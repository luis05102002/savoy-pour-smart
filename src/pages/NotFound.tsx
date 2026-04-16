import { Link } from "react-router-dom";
import { Home, Wine } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <p className="font-display text-8xl gold-text-gradient tracking-wider">404</p>
        <div className="art-deco-line w-16 mx-auto my-6" />
        <h1 className="font-display text-xl text-foreground tracking-wider uppercase mb-2">
          Página no encontrada
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Esta copa no está en nuestra carta.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg gold-gradient text-primary-foreground font-display tracking-wider hover:opacity-90 transition-opacity"
          >
            <Home size={18} />
            Volver al inicio
          </Link>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-gold/40 text-gold font-display tracking-wider hover:bg-gold/10 transition-colors"
          >
            <Wine size={18} />
            Ver la carta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;