export function Footer() {
  return (
    <footer className="footer footer-center text-base-content bg-base-200 bgp-polkaDots-base-100/10 border-base-300 border-3 px-7 text-lg">
      <div className="flex flex-col md:flex-row w-full justify-between py-3">
        <p>By @crashwy</p>
        <div className="flex gap-6 opacity-70">
          <a className="link link-hover" href="https://discord.gg/FK3QGhvqzq">MKWTT Discord</a>
          <p className="link link-hover">GitHub</p>
        </div>
      </div>
    </footer>
  );
}
