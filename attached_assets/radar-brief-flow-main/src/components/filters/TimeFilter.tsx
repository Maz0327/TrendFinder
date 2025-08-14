export type TimeWindow = '24h' | '7d' | '30d' | 'all'

const TimeFilter = ({ value, onChange }: { value: TimeWindow; onChange: (v: TimeWindow) => void }) => {
  const options: { label: string; v: TimeWindow }[] = [
    { label: 'Last 24h', v: '24h' },
    { label: '7 days', v: '7d' },
    { label: '30 days', v: '30d' },
    { label: 'All', v: 'all' },
  ]
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Time window</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.v}
            className={`px-3 py-1 rounded-full text-sm border ${value === o.v ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            onClick={() => onChange(o.v)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeFilter
