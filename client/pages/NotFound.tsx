import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! Page not found
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
          >
            Return to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
