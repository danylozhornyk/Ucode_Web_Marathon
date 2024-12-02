
const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mb-20 mt-20">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-6 text-center">
            The page you are looking for does not exist.
          </p>
          <button
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 flex flex-row items-center"
            onClick={() => (window.location.href = '/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
