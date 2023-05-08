import { FaUserCircle } from 'react-icons/fa';

const SignInButton = () => {
  return (
    <div className='flex items-center justify-center gap-[8px] px-[16px] text-[#3ea6ff]'>
      <FaUserCircle size={30} />
      Sign in
    </div>
  );
};

export default SignInButton;
