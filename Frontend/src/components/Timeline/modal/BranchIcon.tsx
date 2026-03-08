interface BranchIconProps {
  hasBranch: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function BranchIcon({ hasBranch, isOpen, onToggle }: BranchIconProps) {
  const svg = (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M3 3v5a3 3 0 003 3h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 9l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="3" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );

  if (hasBranch) {
    return (
      <div
        title="Already branched"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.2)",
          color: "rgba(167,139,250,0.4)",
        }}
      >
        {svg}
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      title="Branch from this step"
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isOpen ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.06)",
        border: isOpen
          ? "1px solid rgba(167,139,250,0.3)"
          : "1px solid rgba(255,255,255,0.1)",
        color: isOpen ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.35)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {svg}
    </button>
  );
}