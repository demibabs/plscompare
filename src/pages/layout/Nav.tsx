import { Link } from "react-router-dom";

export function Nav() {
  return (
    <nav className="navbar bg-base-200 border-base-300 top-0 z-50 items-center border-y-3 px-5 md:sticky md:px-7">
      <div className="navbar-start -translate-y-0.5 text-2xl md:text-3xl">
        <Link to="/" className="cursor-pointer">
          <b><span className="text-warning">pls</span><span>compare</span></b>
        </Link>
      </div>
      <div className="navbar-end text-lg opacity-70 md:text-xl">
        <Link to="/read-me" className="link link-hover">
          Read me!
        </Link>
      </div>
    </nav>
  );
}
