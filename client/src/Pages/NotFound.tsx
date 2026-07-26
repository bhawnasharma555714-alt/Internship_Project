import { Link } from "react-router-dom";
import Layout from "../Components/Layout";
import Error from "../assets/error.png";

function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6">
        <div className="rounded-2xl shadow-lg p-8 sm:p-10 max-w-2xl w-full text-center">
          <img src={Error} alt="Page Not Found" className="h-40 w-40 md:w-70 md:h-70 mx-auto"/>
          <h1 className="mt-6 text-2xl md:text-4xl sm:text-5xl font-bold text-white">Oops!</h1>

          <h2 className="mt-2 text-xl md:text-2xl sm:text-3xl font-semibold text-sky-500">Page Not Found</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto leading-relaxed">The page you're looking for doesn't exist, may have been moved,or the URL might be incorrect.</p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">Go Home</Link>

            <Link to="/projects" className="border border-sky-600 text-sky-500 hover:bg-sky-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">Browse Projects</Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default NotFound;