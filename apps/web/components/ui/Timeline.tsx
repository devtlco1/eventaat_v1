import ds from './ds.module.css';

type Entry = { at: string; text: string; key?: string };

type Props = {
  items: Entry[];
  formatTime?: (iso: string) => string;
};

export function Timeline({ items, formatTime }: Props) {
  return (
    <ol className={ds.timeline} aria-label="الخط الزمني">
      {items.map((it, i) => (
        <li key={it.key ?? it.at + String(i)} className={ds.timelineItem}>
          <span className={ds.dot} aria-hidden />
          <p className={ds.time}>
            {formatTime ? formatTime(it.at) : it.at}
          </p>
          <p className={ds.tText}>{it.text}</p>
        </li>
      ))}
    </ol>
  );
}
