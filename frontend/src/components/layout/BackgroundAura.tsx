export function BackgroundAura() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Purple Aura Blob */}
      <div 
        className="absolute top-20 left-10 w-96 h-96 bg-purple-400/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDuration: '20s' }}
      />
      
      {/* Blue Aura Blob */}
      <div 
        className="absolute top-40 right-20 w-[30rem] h-[30rem] bg-blue-400/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDuration: '25s', animationDelay: '2s' }}
      />
      
      {/* Pink Aura Blob */}
      <div 
        className="absolute bottom-20 left-1/3 w-[28rem] h-[28rem] bg-pink-400/30 dark:bg-pink-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDuration: '30s', animationDelay: '4s' }}
      />
      
      {/* Indigo Accent Blob */}
      <div 
        className="absolute bottom-40 right-1/4 w-80 h-80 bg-indigo-400/25 dark:bg-indigo-500/8 rounded-full blur-3xl animate-float"
        style={{ animationDuration: '22s', animationDelay: '1s' }}
      />
    </div>
  );
}