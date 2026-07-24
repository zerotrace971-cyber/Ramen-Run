import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand() {
  return <Link to="/" className="brand" aria-label="Suzume's Stellar Ramen Run home"><span className="brand-mark"><Sparkles size={18} /></span><span><b>Suzume’s</b><small>STELLAR RAMEN RUN</small></span></Link>;
}
