export default function PriorityBadge({ level }) {
  const styles = {
    HIGH: 'bg-red-100 text-red-800 border-red-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
    UNKNOWN: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  
  const selectedStyle = styles[level?.toUpperCase()] || styles.UNKNOWN;
  
  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${selectedStyle}`}>
      {level || 'UNKNOWN'}
    </span>
  );
}
