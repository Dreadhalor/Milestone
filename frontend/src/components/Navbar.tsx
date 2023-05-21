import { UserMenu } from '@components/UserMenu/UserMenu';
// import { UserMenu } from 'milestone-components';

const Navbar = () => {
  return (
    // <div className='flex min-h-[75px] w-full flex-row items-center justify-between bg-[rgb(17,24,39)] px-[24px]'>
    <div className='flex min-h-[75px] w-full flex-row items-center justify-between bg-white px-[24px]'>
      <span className='text-2xl text-white'>Milestone</span>
      <UserMenu light />
    </div>
  );
};

export default Navbar;
