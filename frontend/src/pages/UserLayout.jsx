import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "var(--nav-offset, 5rem)" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
