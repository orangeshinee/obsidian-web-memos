
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={\`w-full border rounded-lg p-2 text-sm font-sans \${className}\`}
      rows={4}
      {...props}
    />
  );
}
