'use client';

import { type SubmitEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { ProductStatus } from '@/app/generated/prisma/enums';
import { updateProduct } from '@/lib/api/clientApi';
import { PRODUCT_LIMITS, productUpdateSchema, type ProductUpdate } from '@/lib/validation/product';

type TextFieldName = 'description' | 'seoTitle' | 'seoDescription';
type FieldErrors = Partial<Record<keyof ProductUpdate, string[]>>;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  productId: number;
  initialValues: ProductUpdate;
};

type SaveStatusProps = {
  saveState: SaveState;
  isDirty: boolean;
  errorMessage: string;
};

type TextFieldProps = {
  name: TextFieldName;
  label: string;
  hint?: string;
  value: string;
  max: number;
  rows?: number;
  errors?: string[];
  onChange: (name: TextFieldName, value: string) => void;
};

type StatusFieldProps = {
  value: ProductStatus;
  onChange: (status: ProductStatus) => void;
};

export default function ProductEditor({ productId, initialValues }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isSaving = saveState === 'saving';
  const isDirty =
    values.description !== savedValues.description ||
    values.seoTitle !== savedValues.seoTitle ||
    values.seoDescription !== savedValues.seoDescription ||
    values.status !== savedValues.status;

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  function handleTextChange(name: TextFieldName, value: string) {
    setValues(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: undefined }));
    setSaveState('idle');
  }

  function handleStatusChange(status: ProductStatus) {
    setValues(current => ({ ...current, status }));
    setSaveState('idle');
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = productUpdateSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(z.flattenError(parsed.error).fieldErrors);
      setSaveState('error');
      setErrorMessage('Виправте поля з помилками.');
      return;
    }

    setSaveState('saving');
    setErrorMessage('');

    try {
      const saved = await updateProduct(productId, parsed.data);
      const nextValues = {
        description: saved.description,
        seoTitle: saved.seoTitle,
        seoDescription: saved.seoDescription,
        status: saved.status,
      };
      setValues(nextValues);
      setSavedValues(nextValues);
      setFieldErrors({});
      setSaveState('saved');
      router.refresh();
    } catch (error) {
      setSaveState('error');
      setErrorMessage(getSaveErrorMessage(error));
      if (isAxiosError(error) && error.response?.status === 400) {
        setFieldErrors(error.response.data?.details?.fieldErrors ?? {});
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-8">
      <fieldset disabled={isSaving} className="flex flex-col gap-8">
        <TextField
          name="description"
          label="Опис"
          rows={8}
          value={values.description}
          max={PRODUCT_LIMITS.description}
          errors={fieldErrors.description}
          onChange={handleTextChange}
        />
        <TextField
          name="seoTitle"
          label="SEO-заголовок"
          hint="Показується в заголовку вкладки та в результатах пошуку."
          value={values.seoTitle}
          max={PRODUCT_LIMITS.seoTitle}
          errors={fieldErrors.seoTitle}
          onChange={handleTextChange}
        />
        <TextField
          name="seoDescription"
          label="SEO-опис"
          hint="Короткий опис сторінки для пошукових систем."
          rows={3}
          value={values.seoDescription}
          max={PRODUCT_LIMITS.seoDescription}
          errors={fieldErrors.seoDescription}
          onChange={handleTextChange}
        />
        <StatusField value={values.status} onChange={handleStatusChange} />
      </fieldset>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-separator bg-surface/90 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <SaveStatus saveState={saveState} isDirty={isDirty} errorMessage={errorMessage} />
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className="shrink-0 rounded-full bg-accent px-6 py-3 text-[17px] font-medium whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-50"
        >
          {isSaving ? 'Збереження…' : 'Зберегти зміни'}
        </button>
      </div>
    </form>
  );
}

function getSaveErrorMessage(error: unknown) {
  if (!isAxiosError(error) || !error.response) {
    return "Немає зв'язку із сервером. Зміни не збережено, але вони лишилися у формі.";
  }

  switch (error.response.status) {
    case 400:
      return 'Сервер не прийняв дані. Виправте поля з помилками.';
    case 401:
      return 'Сесія закінчилась. Увійдіть знову в новій вкладці й повторіть збереження.';
    case 404:
      return 'Товар не знайдено.';
    default:
      return 'Не вдалося зберегти через помилку сервера. Спробуйте ще раз.';
  }
}

function SaveStatus({ saveState, isDirty, errorMessage }: SaveStatusProps) {
  if (saveState === 'error') {
    return (
      <p role="alert" className="text-[15px] font-medium text-red-700 dark:text-red-400">
        {errorMessage}
      </p>
    );
  }

  const text =
    saveState === 'saving'
      ? 'Збереження…'
      : saveState === 'saved'
        ? 'Зміни збережено'
        : isDirty
          ? 'Є незбережені зміни'
          : 'Змін немає';

  const color = saveState === 'saved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-secondary';

  return (
    <p role="status" className={`text-[15px] font-medium ${color}`}>
      {text}
    </p>
  );
}

function TextField({ name, label, hint, value, max, rows, errors, onChange }: TextFieldProps) {
  const id = `field-${name}`;
  const length = value.trim().length;
  const isOverLimit = length > max;
  const error = errors?.[0];
  const isInvalid = Boolean(error) || isOverLimit;

  const fieldProps = {
    id,
    name,
    value,
    'aria-invalid': isInvalid,
    'aria-describedby': error ? `${id}-counter ${id}-error` : `${id}-counter`,
    className: `w-full rounded-xl border bg-card px-4 py-3 text-[17px] leading-relaxed outline-accent ${
      isInvalid ? 'border-red-600' : 'border-separator'
    }`,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] font-medium">
          {label}
        </label>
        <span
          id={`${id}-counter`}
          className={`text-[13px] tabular-nums ${
            isOverLimit ? 'font-semibold text-red-700 dark:text-red-400' : 'text-secondary'
          }`}
        >
          {length} / {max}
        </span>
      </div>

      {rows ? (
        <textarea
          {...fieldProps}
          rows={rows}
          onChange={event => onChange(name, event.target.value)}
        />
      ) : (
        <input {...fieldProps} type="text" onChange={event => onChange(name, event.target.value)} />
      )}

      {hint && <p className="text-[13px] text-secondary">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: ProductStatus.DRAFT, label: 'Чернетка', hint: 'Не видно в каталозі' },
  { value: ProductStatus.PUBLISHED, label: 'Опубліковано', hint: 'Видно всім відвідувачам' },
];

function StatusField({ value, onChange }: StatusFieldProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[15px] font-medium">Статус</legend>
      <div className="flex flex-col gap-3 sm:flex-row">
        {STATUS_OPTIONS.map(option => (
          <label
            key={option.value}
            className="flex flex-1 cursor-pointer items-start gap-3 rounded-xl border border-separator bg-card px-4 py-3 has-checked:border-accent has-checked:ring-1 has-checked:ring-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name="status"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 accent-accent"
            />
            <span className="flex flex-col">
              <span className="text-[17px] font-medium">{option.label}</span>
              <span className="text-[13px] text-secondary">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
