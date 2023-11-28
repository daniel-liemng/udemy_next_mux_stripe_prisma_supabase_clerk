import { prismadb } from '@/lib/prismadb';
import Categories from './_components/categories';
import SearchInput from '@/components/search-input';

const SearchPage = async () => {
  const categories = await prismadb.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <>
      {/* Desktop Search in Navbar */}
      {/* Mobile - Search */}
      <div className='px-6 pt-6 block md:hidden md:mb-0'>
        <SearchInput />
      </div>

      <div className='p-6'>
        <Categories items={categories} />
      </div>
    </>
  );
};

export default SearchPage;
