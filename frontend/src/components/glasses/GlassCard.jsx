

export default function GlassCard({ children, className, onClick }) {
    return (
        <div onClick={onClick}
             className={`p-8 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-lg text-white ${className}`}
        >
            {children}
        </div>
    )
}