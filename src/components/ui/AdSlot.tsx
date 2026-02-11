

interface AdSlotProps {
    active?: boolean;
}

export function AdSlot({ active = false }: AdSlotProps) {
    if (!active) return null;

    return (
        <div className="ad-slot-native">
            {/* Native Ad Structure */}
            <span className="ad-label">Sponsored</span>
            <div className="ad-content">Ad Placeholder</div>
        </div>
    );
}
