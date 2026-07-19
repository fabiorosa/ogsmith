/**
 * Purposeful inline icons only; each one exists for a specific control.
 * 1.5px strokes on a 20px grid, inheriting currentColor.
 */

interface IconProps {
  readonly className?: string;
}

function base(props: IconProps) {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: props.className,
    "aria-hidden": true,
  };
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M3.5 15.5h13" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="7" width="9.5" height="9.5" rx="1.5" />
      <path d="M13 4.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v7.5A1.5 1.5 0 0 0 4 13h.5" />
    </svg>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12.5 4 6.5 10l6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 10.5 8 15l8.5-9.5" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3.2 18 16.5H2L10 3.2Z" />
      <path d="M10 8.5v3.5" />
      <path d="M10 14.4v.1" />
    </svg>
  );
}
