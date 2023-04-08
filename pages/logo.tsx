import Image from 'next/image';
// import '../styles/styles.css'; // Import the styles if you haven't already done so.

export const Header = () => {
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="logo-container">
          <Image
            src="/langwallet.png"
            alt="Logo"
            width={130} // Replace with your desired width
            height={80} // Replace with your desired height
            className="transform hover:scale-110 transition-all duration-300"
          />
        </div>
      </div>
      {/* Other header elements */}
    </>
  );
};

export default Header;
