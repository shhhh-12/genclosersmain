// GenClosers "G" mark, traced from logo/LOGO.svg with the empty canvas cropped away.
// Colour follows `currentColor`, so set it with a text colour class.

type Props = {
  className?: string;
  title?: string;
};

export function LogoMark({ className, title = "GenClosers" }: Props) {
  return (
    <svg
      viewBox="508 141 350 486"
      className={className}
      role="img"
      aria-label={title}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="857.6 241.87 857.6 328.08 787.94 328.08 787.94 282.08 683.44 221.75 683.1 221.56 578.22 282.08 578.22 359.84 578.06 359.84 578.06 403.15 612.93 423.27 658.77 449.75 589.14 489.99 508.4 443.36 508.4 357.12 508.56 357.12 508.56 241.87 683.1 141.11 683.44 141.33 857.6 241.87" />
      <polygon points="857.6 362.93 857.6 449.14 683.44 549.68 683.29 549.77 683.29 573.06 613.05 532.56 613.05 509.5 613.08 509.5 683.1 469.48 683.44 469.26 787.94 408.93 683.44 363.12 683.22 363.03 787.94 363.03 787.94 362.93 857.6 362.93" />
      <polygon points="613.05 545.78 683.28 586.33 613.05 626.89 613.05 545.78" />
    </svg>
  );
}
