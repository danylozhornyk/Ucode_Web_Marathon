import { FaGithub, FaInstagram, FaFacebookF } from 'react-icons/fa';

export const Footer =() => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto flex justify-between items-center flex-col md:flex-row">
        <div className="text-sm mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} USOF @dzhornyk. All rights reserved.
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="https://github.com/danylozhornyk" className="hover:text-gray-400">
                <FaGithub className="h-6 w-6" />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/_d_zho/" className="hover:text-gray-400">
                <FaInstagram className="h-6 w-6" />
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/yourpage" className="hover:text-gray-400">
                <FaFacebookF className="h-6 w-6" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};
