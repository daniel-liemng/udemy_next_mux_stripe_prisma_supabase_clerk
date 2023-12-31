'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconType } from 'react-icons';
import qs from 'query-string';

interface CategoryItemProps {
  label: string;
  icon: IconType;
  value: string;
}

const CategoryItem = ({ label, icon: Icon, value }: CategoryItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get('categoryId');
  const currentTitle = searchParams.get('title');

  const isSelected = currentCategoryId === value;

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          title: currentTitle,
          categoryId: isSelected ? null : value, // toggle
        },
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'py-2 px-3 text-sm border border-slate-200 rounded-full flex items-center gap-x-1 hover:border-sky-700 transition',
        // Change style if active
        isSelected && 'border-sky-700 bg-sky-200/20 text-sky-800'
      )}
    >
      {Icon && <Icon size={20} />}
      <div className='truncate'>{label}</div>
    </button>
  );
};

export default CategoryItem;
