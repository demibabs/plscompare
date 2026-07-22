import { useNavigate } from "react-router-dom";

export function Nav() {
  const navigate = useNavigate();
  return (
    <nav className="navbar bg-base-200 border-base-300 top-0 z-50 items-center border-3 px-5 md:sticky md:px-7">
      <div className="navbar-start -translate-y-0.5 text-2xl md:text-3xl">
        <a className="cursor-pointer" onClick={() => navigate("/")}>
          <b><span className="text-warning">pls</span><span>compare</span></b>
        </a>
      </div>
      <div className="navbar-end text-lg opacity-70 md:text-xl">
        <a className="link link-hover" onClick={() => navigate("/read-me")}>
          Read me!
        </a>
      </div>
    </nav>
  );
}
