export function Button({ children, onClick, variant = "default", ...props }) {
  const base = "px-4 py-2 rounded text-sm font-medium";
  const styles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    link: "text-blue-600 underline hover:text-blue-800",
    ghost: "text-gray-500 hover:text-black"
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}