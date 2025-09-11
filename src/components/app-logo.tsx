export const AppLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 30V10L20 20V30H10Z"
      fill="currentColor"
      className="text-primary"
    />
    <path
      d="M20 20L30 10V30L20 20Z"
      fill="currentColor"
      className="text-accent"
    />
  </svg>
);
