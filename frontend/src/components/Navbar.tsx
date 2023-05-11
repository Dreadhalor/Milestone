import { UserMenu } from './UserMenu/UserMenu';

const Navbar = () => {
  return (
    <div className='flex min-h-[75px] w-full flex-row items-center justify-between bg-[rgb(17,24,39)] px-[24px]'>
      <span className='text-2xl text-white'>Milestone</span>
      <UserMenu />
    </div>
  );
};

export default Navbar;
