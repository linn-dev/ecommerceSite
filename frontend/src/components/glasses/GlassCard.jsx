

export default function GlassCard({ children }) {
    return (
        <div className="p-8 bg-red backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-lg text-white">
            {children}
        </div>
    )
}