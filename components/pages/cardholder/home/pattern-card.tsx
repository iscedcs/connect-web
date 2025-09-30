export function PatternCard() {
  return (
    <div className="h-24 rounded-lg overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 to-purple-600/50"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)
        `,
        }}></div>
    </div>
  );
}
