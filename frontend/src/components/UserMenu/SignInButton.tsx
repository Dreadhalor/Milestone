import { FaUserCircle } from 'react-icons/fa';

type Props = {
  height?: number;
};
const SignInButton = ({ height }: Props) => {
  const ratio = height ? height / 50 : 1;
  const gap = 8 * ratio;
  const padding_x = 16 * ratio;
  const icon_size = 30 * ratio;

  return (
    <div
      className='flex items-center justify-center text-[#3ea6ff]'
      style={{
        gap: `${gap}px`,
        padding: `0 ${padding_x}px`,
      }}
    >
      <FaUserCircle size={icon_size} />
      Sign in
    </div>
  );
};

export default SignInButton;
