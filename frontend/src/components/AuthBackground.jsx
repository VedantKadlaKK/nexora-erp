export default function AuthBackground({ children }) {
  return (
    <div className="auth-background relative grid min-h-screen place-items-center overflow-hidden bg-slate-100 p-4">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="auth-grid absolute inset-0" />
        <div className="auth-blueprint absolute inset-0" />
        <div className="auth-sweep" />
        <div className="auth-route auth-route-one" />
        <div className="auth-route auth-route-two" />
        <div className="auth-route auth-route-three" />
        <div className="auth-panel auth-panel-one" />
        <div className="auth-panel auth-panel-two" />
        <div className="auth-panel auth-panel-three" />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
