
export function Card({ children, className = "", ...props }) {
  return (
    <div className={\`bg-white rounded-2xl shadow p-2 \${className}\`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
