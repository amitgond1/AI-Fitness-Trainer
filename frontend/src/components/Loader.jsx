const Loader = ({ text = "Loading..." }) => (
  <div className="flex min-h-[180px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-full border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm text-slate-200">
      <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
      {text}
    </div>
  </div>
);

export default Loader;
