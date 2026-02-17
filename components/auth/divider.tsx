export function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/50" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-card/60 px-3 text-muted-foreground backdrop-blur-xl">
          or continue with email
        </span>
      </div>
    </div>
  )
}
