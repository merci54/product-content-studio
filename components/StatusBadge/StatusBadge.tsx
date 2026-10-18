import type { ProductStatus } from '@/app/generated/prisma/enums';

const STATUS_STYLES = {
  PUBLISHED: {
    label: 'Опубліковано',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  DRAFT: {
    label: 'Чернетка',
    className: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  },
} satisfies Record<ProductStatus, { label: string; className: string }>;

type Props = {
  status: ProductStatus;
};

export default function StatusBadge({ status }: Props) {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-semibold ${className}`}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
