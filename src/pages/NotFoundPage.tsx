import { ArrowLeft, Ghost } from 'lucide-react';
import { Link } from 'react-router-dom';
export function NotFoundPage() { return <main className="not-found"><div><Ghost size={48} /><p>ERROR 404 — SPACE NOODLES LOST</p><h1>This route is not on the map.</h1><span>Suzume checked the whole galaxy. Let’s get you back to the kitchen.</span><Link className="button primary" to="/"><ArrowLeft size={17} /> Return home</Link></div></main>; }
