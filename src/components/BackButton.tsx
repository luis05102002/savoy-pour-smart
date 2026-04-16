import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ to = '/', label = 'Volver', className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-sm ${className}`}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
};

export default BackButton;
