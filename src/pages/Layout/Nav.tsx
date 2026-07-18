import { useNavigate } from "react-router-dom";

export function Nav() {
  const navigate = useNavigate()
  return (
    <nav className="navbar bg-base-200 border-base-300 md:sticky top-0 z-50 items-center border-3 px-5 md:px-7">
      <div className="navbar-start -translate-y-0.5 text-3xl"><a className="cursor-pointer" onClick={() => navigate("/")}>plscompare</a></div>
      <div className="navbar-end text-xl opacity-70"><a className="link link-hover" onClick={() => navigate("/read-me")}>Read me!</a></div>
    </nav>
  );
}
