const SeverityBadge = ({ severity, colorClass }) => {
  if (!severity) return null;

  // We map the color from the database to tailwind classes explicitly
  const colorMap = {
    'green': 'bg-success/10 text-success border-success/20',
    'yellow': 'bg-warning/10 text-warning border-warning/20',
    'orange': 'bg-moderate/10 text-moderate border-moderate/20',
    'red': 'bg-danger/10 text-danger border-danger/20',
    'blue': 'bg-secondary/10 text-secondary border-secondary/20',
    'gray': 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const cssclass = colorMap[colorClass] || colorMap['gray'];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cssclass}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
